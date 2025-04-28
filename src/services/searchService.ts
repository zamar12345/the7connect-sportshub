
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Search types
export type SearchResultType = 'user' | 'post' | 'hashtag';

interface BaseSearchResult {
  id: string;
  type: SearchResultType;
}

export interface UserSearchResult extends BaseSearchResult {
  type: 'user';
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface PostSearchResult extends BaseSearchResult {
  type: 'post';
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url?: string;
}

export interface HashtagSearchResult extends BaseSearchResult {
  type: 'hashtag';
  name: string;
  post_count: number;
}

export type SearchResult = UserSearchResult | PostSearchResult | HashtagSearchResult;

// Search all (users, posts, hashtags)
export const searchAll = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const results: SearchResult[] = [];
    
    // Search users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(5);
    
    if (usersError) throw usersError;
    
    // Add users to results
    if (users) {
      users.forEach(user => {
        results.push({
          id: user.id,
          type: 'user',
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          bio: user.bio
        });
      });
    }
    
    // Search posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id, content, created_at, user_id,
        user:users(username, avatar_url)
      `)
      .ilike('content', `%${query}%`)
      .limit(5);
    
    if (postsError) throw postsError;
    
    // Add posts to results
    if (posts) {
      posts.forEach(post => {
        results.push({
          id: post.id,
          type: 'post',
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          username: post.user?.username || 'Unknown',
          avatar_url: post.user?.avatar_url
        });
      });
    }
    
    // Search hashtags
    // This is simplified - in a real app you might have a hashtags table or a more sophisticated mechanism
    if (query.startsWith('#') || query.length > 2) {
      const searchTag = query.startsWith('#') ? query.slice(1) : query;
      
      // Search posts with hashtags that might contain the search term
      const { data: hashtagPosts, error: hashtagError } = await supabase
        .from('posts')
        .select('id, content')
        .ilike('content', `%#${searchTag}%`)
        .limit(20);
      
      if (!hashtagError && hashtagPosts) {
        // Parse hashtags from content
        const hashtags: Record<string, number> = {};
        
        hashtagPosts.forEach(post => {
          // Simple regex to extract hashtags
          const tags = post.content.match(/#(\w+)/g) || [];
          
          // Convert #tag to tag and count occurrences
          tags.forEach(tag => {
            const cleanTag = tag.substring(1).toLowerCase(); // Remove # and convert to lowercase
            if (cleanTag.includes(searchTag.toLowerCase())) {
              hashtags[cleanTag] = (hashtags[cleanTag] || 0) + 1;
            }
          });
        });
        
        // Add hashtags to results
        Object.entries(hashtags).forEach(([tag, count]) => {
          results.push({
            id: tag,
            type: 'hashtag',
            name: tag,
            post_count: count
          });
        });
      }
    }
    
    return results;
  } catch (error: any) {
    console.error("Search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};

// Search users
export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      type: 'user' as const,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio
    }));
  } catch (error: any) {
    console.error("User search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};

// Search posts
export const searchPosts = async (query: string): Promise<PostSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, content, created_at, user_id,
        user:users(username, avatar_url)
      `)
      .ilike('content', `%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    return (data || []).map(post => ({
      id: post.id,
      type: 'post' as const,
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      username: post.user?.username || 'Unknown',
      avatar_url: post.user?.avatar_url
    }));
  } catch (error: any) {
    console.error("Post search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};

// Search hashtags (simplified implementation)
export const searchHashtags = async (query: string): Promise<HashtagSearchResult[]> => {
  if (!query || query.length < 2) return [];
  const searchTag = query.startsWith('#') ? query.slice(1) : query;
  
  try {
    // Simple implementation to search for hashtags in posts
    const { data, error } = await supabase
      .from('posts')
      .select('content')
      .ilike('content', `%#${searchTag}%`)
      .limit(50);
    
    if (error) throw error;
    
    // Extract and count hashtags
    const hashtags: Record<string, number> = {};
    
    (data || []).forEach(post => {
      // Simple regex to extract hashtags
      const tags = post.content.match(/#(\w+)/g) || [];
      
      // Count occurrences
      tags.forEach(tag => {
        const cleanTag = tag.substring(1).toLowerCase(); // Remove # and convert to lowercase
        if (cleanTag.includes(searchTag.toLowerCase())) {
          hashtags[cleanTag] = (hashtags[cleanTag] || 0) + 1;
        }
      });
    });
    
    // Convert to result array
    return Object.entries(hashtags).map(([tag, count]) => ({
      id: tag,
      type: 'hashtag' as const,
      name: tag,
      post_count: count
    }));
  } catch (error: any) {
    console.error("Hashtag search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};
