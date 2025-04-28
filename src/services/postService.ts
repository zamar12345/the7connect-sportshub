import { supabase } from "@/integrations/supabase/client";

// Fetch posts with user details and interaction counts
export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      likes_count,
      comments_count,
      user:users(id, username, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data;
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
