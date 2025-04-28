
import { useSupabaseQuery } from "./useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";

// Trending topics
export function useTrendingTopics() {
  return useSupabaseQuery(
    ['explore', 'trending-topics'],
    async () => {
      // This query finds hashtags in posts and groups them by popularity
      const { data, error } = await supabase
        .from('posts')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Extract hashtags from posts
      const hashtagCounts: Record<string, number> = {};
      const hashtagRegex = /#(\w+)/g;
      
      data.forEach(post => {
        const matches = post.content.match(hashtagRegex) || [];
        matches.forEach((tag: string) => {
          const cleanTag = tag.toLowerCase();
          hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
        });
      });
      
      // Convert to array and sort by count
      const trendingTopics = Object.entries(hashtagCounts)
        .map(([tag, posts]) => ({ 
          id: tag,
          name: tag,
          posts
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 10);
        
      return trendingTopics;
    }
  );
}

// Discover users
export function useDiscoverUsers() {
  return useSupabaseQuery(
    ['explore', 'discover-users'],
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, sport, followers')
        .order('followers', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      return data.map(user => ({
        ...user,
        name: user.full_name || user.username,
        isVerified: (user.followers || 0) > 500 // Added null check for followers
      }));
    }
  );
}

// Trending posts
export function useTrendingPosts() {
  return useSupabaseQuery(
    ['explore', 'trending-posts'],
    async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, username, full_name, avatar_url)
        `)
        .order('comments_count', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      return data;
    }
  );
}

// Sports list
export function useSportsList() {
  return useSupabaseQuery(
    ['explore', 'sports'],
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('sport')
        .not('sport', 'is', null);
        
      if (error) throw error;
      
      // Get unique sports
      const uniqueSports = Array.from(new Set(
        data
          .map(user => user.sport)
          .filter(Boolean)
      ));
      
      return uniqueSports;
    }
  );
}
