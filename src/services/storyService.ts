
import { supabase } from "@/integrations/supabase/client";

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

// Fetch active stories (not expired)
export const fetchStories = async (): Promise<Story[]> => {
  try {
    // Get current time
    const now = new Date().toISOString();
    
    // Fetch stories that haven't expired yet
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:users(username, avatar_url)
      `)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as unknown as Story[];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
};

// Fetch stories for a specific user
export const fetchUserStories = async (userId: string): Promise<Story[]> => {
  try {
    // Get current time
    const now = new Date().toISOString();
    
    // Fetch stories for user that haven't expired
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:users(username, avatar_url)
      `)
      .eq('user_id', userId)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as unknown as Story[];
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return [];
  }
};

// Mark a story as viewed
export const markStoryViewed = async (storyId: string): Promise<boolean> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error("No authenticated user found");
    }

    // Insert into story_views table
    const { error } = await supabase
      .from('story_views')
      .insert({ 
        story_id: storyId,
        viewer_id: user.data.user.id
      });
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking story as viewed:", error);
    return false;
  }
};
