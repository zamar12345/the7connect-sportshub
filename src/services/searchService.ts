import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Search types
export type SearchResultType = 'user' | 'post' | 'hashtag';
export type SortOption = 'relevance' | 'recent' | 'popular';
export type FilterOption = 'all' | 'verified' | 'followed' | 'sport';

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
  sport?: string;
  followers?: number;
  created_at?: string;
  isVerified?: boolean;
}

export interface PostSearchResult extends BaseSearchResult {
  type: 'post';
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  likes_count?: number;
}

export interface HashtagSearchResult extends BaseSearchResult {
  type: 'hashtag';
  name: string;
  post_count: number;
  last_used_at?: string;
}

export interface SearchOptions {
  sort?: SortOption;
  filter?: FilterOption;
  sport?: string;
  limit?: number;
}

// Search all (users, posts, hashtags)
export const searchAll = async (
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  const {
    sort = 'relevance',
    filter = 'all',
    sport,
    limit = 5
  } = options;
  
  try {
    const results: SearchResult[] = [];
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    
    // Search users
    let userQuery = supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio, sport, followers, created_at')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(limit);
    
    // Apply filters
    if (filter === 'sport' && sport) {
      userQuery = userQuery.eq('sport', sport);
    }
    
    // Apply sort
    if (sort === 'recent') {
      userQuery = userQuery.order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      userQuery = userQuery.order('followers', { ascending: false });
    }
    
    const { data: users, error: usersError } = await userQuery;
    
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
          bio: user.bio,
          sport: user.sport,
          followers: user.followers,
          created_at: user.created_at,
          isVerified: false // This would come from your database
        });
      });
    }
    
    // Search posts
    let postsQuery = supabase
      .from('posts')
      .select(`
        id, content, created_at, user_id,
        user:users(username, avatar_url, sport)
      `)
      .ilike('content', `%${query}%`)
      .limit(limit);
    
    // Apply filters
    if (filter === 'followed' && currentUserId) {
      const { data: followedUsers } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);
      
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
    
    const { data: posts, error: postsError } = await postsQuery;
    
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
          // likes_count would be added here if available
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
        .select('id, content, created_at')
        .ilike('content', `%#${searchTag}%`)
        .limit(20);
      
      if (!hashtagError && hashtagPosts) {
        // Parse hashtags from content
        const hashtags: Record<string, { count: number, lastUsedAt: string }> = {};
        
        hashtagPosts.forEach(post => {
          // Simple regex to extract hashtags
          const tags = post.content.match(/#(\w+)/g) || [];
          
          // Convert #tag to tag and count occurrences
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
        
        // Add hashtags to results
        const hashtagEntries = Object.entries(hashtags);
        
        // Sort hashtags based on selected sort option
        if (sort === 'recent') {
          hashtagEntries.sort((a, b) => 
            new Date(b[1].lastUsedAt).getTime() - new Date(a[1].lastUsedAt).getTime()
          );
        } else if (sort === 'popular') {
          hashtagEntries.sort((a, b) => b[1].count - a[1].count);
        }
        
        // Take only the requested limit
        hashtagEntries.slice(0, limit).forEach(([tag, data]) => {
          results.push({
            id: tag,
            type: 'hashtag',
            name: tag,
            post_count: data.count,
            last_used_at: data.lastUsedAt
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
export const searchUsers = async (
  query: string,
  options: SearchOptions = {}
): Promise<UserSearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  const {
    sort = 'relevance',
    filter = 'all',
    sport,
    limit = 10
  } = options;
  
  try {
    let userQuery = supabase
      .from('users')
      .select('id, username, full_name, avatar_url, bio, sport, followers, created_at')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
    
    // Apply filters
    if (filter === 'sport' && sport) {
      userQuery = userQuery.eq('sport', sport);
    }
    
    // Apply sort
    if (sort === 'recent') {
      userQuery = userQuery.order('created_at', { ascending: false });
    } else if (sort === 'popular') {
      userQuery = userQuery.order('followers', { ascending: false });
    }
    
    // Apply limit
    userQuery = userQuery.limit(limit);
    
    const { data, error } = await userQuery;
    
    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      type: 'user' as const,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      sport: user.sport,
      followers: user.followers,
      created_at: user.created_at,
      isVerified: false // This would come from your database
    }));
  } catch (error: any) {
    console.error("User search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};

// Search posts
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
        id, content, created_at, user_id,
        user:users(username, avatar_url, sport)
      `)
      .ilike('content', `%${query}%`);
    
    // Apply filters
    if (filter === 'sport' && sport) {
      // This assumes you can access user.sport in the join
      postsQuery = postsQuery.eq('user.sport', sport);
    }
    
    // Apply sort
    if (sort === 'recent') {
      postsQuery = postsQuery.order('created_at', { ascending: false });
    }
    
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
      avatar_url: post.user?.avatar_url
    }));
  } catch (error: any) {
    console.error("Post search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};

// Search hashtags (simplified implementation)
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
