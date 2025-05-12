import { supabase } from "@/integrations/supabase/client";

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
