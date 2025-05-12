
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/supabase";

interface FetchPostsOptions {
  userId?: string;
  limit?: number;
  offset?: number;
  following?: boolean;
}

// Fetch posts with user details and interaction counts
export const fetchPosts = async (options: FetchPostsOptions = {}): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        image_url,
        location,
        user_id,
        user:users(id, username, full_name, avatar_url),
        likes_count,
        comments_count
      `)
      .order('created_at', { ascending: false });
      
    // Add filters based on options
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // If fetching following posts, route to the specialized service
    if (options.following) {
      return fetchFollowingPosts();
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }

    console.log("Fetched posts:", data);

    // Cast the response data to our Post type and ensure likes_count and comments_count are defined
    return (data as any[]).map(post => ({
      ...post,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0
    })) as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Fetch posts from users the current user follows
export const fetchFollowingPosts = async (): Promise<Post[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    return [];
  }
  
  try {
    // Get the user's following list
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.user.id);
    
    if (followingError) {
      throw followingError;
    }
    
    if (!following || following.length === 0) {
      return [];
    }
    
    // Get posts from followed users
    const followingIds = following.map(f => f.following_id);
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Cast the response data to our Post type and ensure likes_count and comments_count are defined
    return (data as any[]).map(post => ({
      ...post,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0
    })) as Post[];
  } catch (error) {
    console.error("Error fetching following posts:", error);
    throw error;
  }
};
