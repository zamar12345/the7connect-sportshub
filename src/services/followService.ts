import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check if the current user is following a specific user
export const checkFollowStatus = async (profileId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('following_id', profileId)
    .eq('follower_id', (await supabase.auth.getSession()).data.session?.user.id)
    .maybeSingle();
    
  if (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
  
  return !!data;
};

// Follow or unfollow a user
export const toggleFollow = async (profileId: string): Promise<boolean> => {
  try {
    const currentUserId = (await supabase.auth.getSession()).data.session?.user.id;
    
    if (!currentUserId) {
      toast.error("You must be logged in to follow users");
      return false;
    }
    
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select()
      .eq('following_id', profileId)
      .eq('follower_id', currentUserId)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    // If already following, unfollow
    if (existingFollow) {
      // Begin a transaction to ensure both operations complete successfully
      const { error: unfollowError } = await supabase.rpc('unfollow_user', {
        follower: currentUserId,
        following: profileId
      });
      
      if (unfollowError) {
        console.error("Error while unfollowing:", unfollowError);
        // Fallback in case the RPC isn't available
        const { error: deleteError } = await supabase
          .from('follows')
          .delete()
          .eq('id', existingFollow.id);
          
        if (deleteError) throw deleteError;
        
        // Update followers and following counts manually if RPC failed
        await Promise.all([
          supabase.from('users').update({ followers: supabase.rpc('decrement_counter') }).eq('id', profileId),
          supabase.from('users').update({ following: supabase.rpc('decrement_counter') }).eq('id', currentUserId)
        ]);
      }
      
      // Remove follow notification
      await deleteFollowNotification(profileId);
      
      return false; // Indicates user is now not following
    } 
    // Otherwise follow the user
    else {
      // Begin a transaction to ensure both operations complete successfully
      const { error: followError } = await supabase.rpc('follow_user', {
        follower: currentUserId,
        following: profileId
      });
      
      if (followError) {
        console.error("Error while following:", followError);
        // Fallback in case the RPC isn't available
        const { error: insertError } = await supabase
          .from('follows')
          .insert({ 
            following_id: profileId,
            follower_id: currentUserId
          });
          
        if (insertError) throw insertError;
        
        // Update followers and following counts manually if RPC failed
        await Promise.all([
          supabase.from('users').update({ followers: supabase.rpc('increment_counter') }).eq('id', profileId),
          supabase.from('users').update({ following: supabase.rpc('increment_counter') }).eq('id', currentUserId)
        ]);
      }
      
      // Create follow notification
      await createFollowNotification(profileId);
      
      return true; // Indicates user is now following
    }
  } catch (error: any) {
    console.error("Error toggling follow status:", error);
    toast.error(`Error: ${error.message}`);
    throw error;
  }
};

// Get list of users followed by the current user
export const getFollowingList = async () => {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        users:following_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('follower_id', (await supabase.auth.getSession()).data.session?.user.id);
      
    if (error) throw error;
    
    return data.map(item => item.users);
  } catch (error: any) {
    console.error("Error fetching following list:", error);
    toast.error(`Error: ${error.message}`);
    return [];
  }
};

// Get list of users following the current user
export const getFollowersList = async (userId?: string) => {
  const targetId = userId || (await supabase.auth.getSession()).data.session?.user.id;
  
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        users:follower_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('following_id', targetId);
      
    if (error) throw error;
    
    return data.map(item => item.users);
  } catch (error: any) {
    console.error("Error fetching followers list:", error);
    toast.error(`Error: ${error.message}`);
    return [];
  }
};

// Fetch posts for the following feed (posts from followed users)
export const fetchFollowingPosts = async () => {
  try {
    // First get the list of users the current user follows
    const { data: followingData, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', (await supabase.auth.getSession()).data.session?.user.id);
      
    if (followingError) throw followingError;
    
    if (!followingData || followingData.length === 0) {
      return []; // User doesn't follow anyone yet
    }
    
    // Get the list of user IDs
    const followingIds = followingData.map(follow => follow.following_id);
    
    // Get posts from those users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        likes_count,
        comments_count,
        user:users(id, username, full_name, avatar_url)
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false });
      
    if (postsError) throw postsError;
    
    return posts;
  } catch (error: any) {
    console.error("Error fetching following feed:", error);
    toast.error(`Error fetching posts: ${error.message}`);
    return [];
  }
};

// Create a notification when a user follows another user
const createFollowNotification = async (recipientId: string) => {
  const currentUser = (await supabase.auth.getSession()).data.session?.user;
  
  if (!currentUser || currentUser.id === recipientId) return;
  
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        actor_id: currentUser.id,
        type: 'follow',
        content: 'started following you'
      });
  } catch (error) {
    console.error("Error creating follow notification:", error);
  }
};

// Delete a follow notification when a user unfollows another user
const deleteFollowNotification = async (recipientId: string) => {
  const currentUser = (await supabase.auth.getSession()).data.session?.user;
  
  if (!currentUser) return;
  
  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', recipientId)
      .eq('actor_id', currentUser.id)
      .eq('type', 'follow');
  } catch (error) {
    console.error("Error deleting follow notification:", error);
  }
};
