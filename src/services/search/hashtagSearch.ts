import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HashtagSearchResult, SearchOptions } from "./types";

export const searchHashtags = async (
  query: string,
  options: SearchOptions = {}
): Promise<HashtagSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  const {
    sort = 'relevance',
    limit = 10
  } = options;
  
  const searchTag = query.startsWith('#') ? query.slice(1) : query;
  
  try {
    // Simple implementation to search for hashtags in posts
    const { data, error } = await supabase
      .from('posts')
      .select('content, created_at')
      .ilike('content', `%#${searchTag}%`)
      .limit(50);
    
    if (error) throw error;
    
    // Extract and count hashtags
    const hashtags: Record<string, { count: number, lastUsedAt: string }> = {};
    
    (data || []).forEach(post => {
      // Simple regex to extract hashtags
      const tags = post.content.match(/#(\w+)/g) || [];
      
      // Count occurrences and track last used date
      tags.forEach(tag => {
        const cleanTag = tag.substring(1).toLowerCase(); // Remove # and convert to lowercase
        if (cleanTag.includes(searchTag.toLowerCase())) {
          if (!hashtags[cleanTag]) {
            hashtags[cleanTag] = {
              count: 0,
              lastUsedAt: post.created_at
            };
          }
          
          hashtags[cleanTag].count += 1;
          
          // Keep track of the most recent usage
          if (new Date(post.created_at) > new Date(hashtags[cleanTag].lastUsedAt)) {
            hashtags[cleanTag].lastUsedAt = post.created_at;
          }
        }
      });
    });
    
    // Convert to result array and sort based on options
    let results = Object.entries(hashtags).map(([tag, data]) => ({
      id: tag,
      type: 'hashtag' as const,
      name: tag,
      post_count: data.count,
      last_used_at: data.lastUsedAt
    }));
    
    // Apply sorting
    if (sort === 'recent') {
      results.sort((a, b) => 
        new Date(b.last_used_at || '').getTime() - new Date(a.last_used_at || '').getTime()
      );
    } else if (sort === 'popular') {
      results.sort((a, b) => b.post_count - a.post_count);
    }
    
    // Apply limit
    return results.slice(0, limit);
  } catch (error: any) {
    console.error("Hashtag search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};
