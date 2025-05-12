
import { useSupabaseQuery } from "./useSupabaseQuery";
import { fetchPosts } from "@/services/posts";

export function usePostsQuery(options = {}) {
  return useSupabaseQuery(
    ['posts'],
    () => fetchPosts(),
    options
  );
}

export function useUserPostsQuery(userId: string, options = {}) {
  return useSupabaseQuery(
    ['posts', 'user', userId],
    () => fetchPosts({ userId }),
    options
  );
}

export function useFollowingPostsQuery(options = {}) {
  return useSupabaseQuery(
    ['posts', 'following'],
    () => fetchPosts({ following: true }),
    {
      enabled: false, // Only fetch when explicitly requested
      ...options
    }
  );
}
