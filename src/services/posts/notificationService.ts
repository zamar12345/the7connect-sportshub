
import { supabase } from "@/integrations/supabase/client";

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
