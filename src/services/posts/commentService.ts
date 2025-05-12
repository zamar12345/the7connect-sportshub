
import { supabase } from "@/integrations/supabase/client";

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
