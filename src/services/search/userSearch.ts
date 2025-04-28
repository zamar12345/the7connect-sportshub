
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserSearchResult, SearchOptions } from "./types";

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
