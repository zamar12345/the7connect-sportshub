
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostSearchResult, SearchOptions } from "./types";

export const searchPosts = async (
  query: string,
  options: SearchOptions = {}
): Promise<PostSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  const {
    sort = 'relevance',
    filter = 'all',
    sport,
    limit = 10
  } = options;
  
  try {
    let postsQuery = supabase
      .from('posts')
      .select(`
        id, content, created_at, user_id, image_url,
        user:users(username, avatar_url, sport)
      `)
      .ilike('content', `%${query}%`);
    
    // Apply filters
    if (filter === 'followed' && options.currentUserId) {
      const { data: followedUsers } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', options.currentUserId);
      
      if (followedUsers && followedUsers.length > 0) {
        const followedIds = followedUsers.map(f => f.following_id);
        postsQuery = postsQuery.in('user_id', followedIds);
      }
    } else if (filter === 'sport' && sport) {
      postsQuery = postsQuery.eq('user.sport', sport);
    }
    
    // Apply sort
    if (sort === 'recent') {
      postsQuery = postsQuery.order('created_at', { ascending: false });
    }
    // For popularity we would ideally sort by likes_count, but we need to ensure that column exists
    
    // Apply limit
    postsQuery = postsQuery.limit(limit);
    
    const { data, error } = await postsQuery;
    
    if (error) throw error;
    
    return (data || []).map(post => ({
      id: post.id,
      type: 'post' as const,
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      username: post.user?.username || 'Unknown',
      avatar_url: post.user?.avatar_url,
      image_url: post.image_url
      // likes_count would be added here if available
    }));
  } catch (error: any) {
    console.error("Post search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};
