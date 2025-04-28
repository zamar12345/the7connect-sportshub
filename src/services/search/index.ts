
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { searchUsers } from "./userSearch";
import { searchPosts } from "./postSearch";
import { searchHashtags } from "./hashtagSearch";
import { SearchResult, SearchOptions } from "./types";

// Re-export types and specific search functions
export * from "./types";
export { searchUsers } from "./userSearch";
export { searchPosts } from "./postSearch";
export { searchHashtags } from "./hashtagSearch";

// Search all (users, posts, hashtags)
export const searchAll = async (
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    const searchOptions = { ...options, currentUserId };
    
    // Perform all searches in parallel
    const [users, posts, hashtags] = await Promise.all([
      searchUsers(query, { ...searchOptions, limit: 5 }),
      searchPosts(query, { ...searchOptions, limit: 5 }),
      searchHashtags(query, { ...searchOptions, limit: 5 })
    ]);
    
    // Combine results
    const results: SearchResult[] = [
      ...users,
      ...posts,
      ...hashtags
    ];
    
    return results;
  } catch (error: any) {
    console.error("Search error:", error);
    toast.error(`Search error: ${error.message}`);
    return [];
  }
};
