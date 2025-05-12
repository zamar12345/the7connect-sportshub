
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/supabase";

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
