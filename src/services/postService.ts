
import { supabase } from "@/integrations/supabase/client";

interface FetchPostsOptions {
  userId?: string;
  limit?: number;
  offset?: number;
  following?: boolean;
}

// Define Post type to include likes_count and comments_count properties
interface Post {
  id: string;
  content: string;
  created_at: string;
  image_url?: string;
  video_url?: string; // Added for video support
  location?: string;  // Added for location support
  user_id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  comments_count?: number;
}

// Fetch posts with user details and interaction counts
export const fetchPosts = async (options: FetchPostsOptions = {}): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
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
      throw error;
    }

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

// Create a new post with optional image, video, and location
export const createPost = async (
  content: string, 
  imageUrl?: string, 
  videoUrl?: string,
  location?: string
): Promise<Post | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      throw new Error("You must be logged in to create a post");
    }
    
    const userId = session.session.user.id;
    
    console.log("Creating post with image:", imageUrl);
    
    // Create the post in the database
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId,
        image_url: imageUrl,
        video_url: videoUrl,
        location
      })
      .select(`
        *,
        user:users(id, username, full_name, avatar_url)
      `)
      .single();
      
    if (error) {
      console.error("Post creation error:", error);
      throw error;
    }
    
    return data as Post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Check if the current user has liked a post
export const checkPostLikedStatus = async (postId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .maybeSingle();
    
  if (error) {
    console.error("Error checking like status:", error);
    return false;
  }
  
  return !!data;
};

// Like a post
export const likePost = async (postId: string) => {
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select()
    .eq('post_id', postId)
    .maybeSingle();
    
  if (checkError) {
    throw checkError;
  }
  
  // If already liked, unlike it
  if (existingLike) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
      
    if (error) throw error;
    return false; // Indicates post is now unliked
  } 
  // Otherwise like the post
  else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId });
      
    if (error) throw error;
    return true; // Indicates post is now liked
  }
};

// Comment on a post
export const addComment = async (postId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, content })
    .select();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Fetch comments for a post
export const fetchComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, username, full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Create notification for likes
export const createLikeNotification = async (postId: string) => {
  const currentUser = (await supabase.auth.getSession()).data.session?.user;
  
  if (!currentUser) return;
  
  try {
    // First get the post owner
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
    
    if (postError || !post || post.user_id === currentUser.id) return;
    
    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: post.user_id,
        actor_id: currentUser.id,
        type: 'like',
        content: 'liked your post',
        reference_id: postId
      });
  } catch (error) {
    console.error("Error creating like notification:", error);
  }
};

// Delete notification for likes
export const deleteLikeNotification = async (postId: string) => {
  const currentUser = (await supabase.auth.getSession()).data.session?.user;
  
  if (!currentUser) return;
  
  try {
    // First get the post owner
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
    
    if (postError || !post) return;
    
    // Delete notification
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', post.user_id)
      .eq('actor_id', currentUser.id)
      .eq('type', 'like')
      .eq('reference_id', postId);
  } catch (error) {
    console.error("Error deleting like notification:", error);
  }
};

// Create notification for comments
export const createCommentNotification = async (postId: string) => {
  const currentUser = (await supabase.auth.getSession()).data.session?.user;
  
  if (!currentUser) return;
  
  try {
    // First get the post owner
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();
    
    if (postError || !post || post.user_id === currentUser.id) return;
    
    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: post.user_id,
        actor_id: currentUser.id,
        type: 'comment',
        content: 'commented on your post',
        reference_id: postId
      });
  } catch (error) {
    console.error("Error creating comment notification:", error);
  }
};
