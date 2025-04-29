import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/supabase";

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
      // Use the RPC function to unfollow and update counts
      const { error: unfollowError } = await supabase
        .rpc('unfollow_user', {
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
          updateCounter(profileId, 'followers', -1),
          updateCounter(currentUserId, 'following', -1)
        ]);
      }
      
      // Remove follow notification
      await deleteFollowNotification(profileId);
      
      return false; // Indicates user is now not following
    } 
    // Otherwise follow the user
    else {
      // Use the RPC function to follow and update counts
      const { error: followError } = await supabase
        .rpc('follow_user', {
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
          updateCounter(profileId, 'followers', 1),
          updateCounter(currentUserId, 'following', 1)
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

// Helper function to manually update counters
async function updateCounter(userId: string, field: 'followers' | 'following', change: number): Promise<void> {
  const { data } = await supabase
    .from('users')
    .select(field)
    .eq('id', userId)
    .single();
  
  if (data) {
    const currentValue = data[field] || 0;
    const newValue = Math.max(0, currentValue + change);
    
    await supabase
      .from('users')
      .update({ [field]: newValue })
      .eq('id', userId);
  }
}

// Get list of users followed by the current user
export const getFollowingList = async (): Promise<User[]> => {
  try {
    const currentUserId = (await supabase.auth.getSession()).data.session?.user.id;
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }
    
    // First get IDs of users that the current user follows
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);
      
    if (followsError) throw followsError;
    
    if (!followsData || followsData.length === 0) {
      return []; // Not following anyone
    }
    
    // Extract the user IDs
    const followingIds = followsData.map(follow => follow.following_id);
    
    // Then fetch the user details for those IDs
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', followingIds);
    
    if (usersError) throw usersError;
    
    return usersData || [];
  } catch (error: any) {
    console.error("Error fetching following list:", error);
    toast.error(`Error: ${error.message}`);
    return [];
  }
};

// Get list of users following the specified user
export const getFollowersList = async (userId: string): Promise<User[]> => {
  try {
    // First get IDs of users that follow the specified user
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
      
    if (followsError) throw followsError;
    
    if (!followsData || followsData.length === 0) {
      return []; // No followers
    }
    
    // Extract the user IDs
    const followerIds = followsData.map(follow => follow.follower_id);
    
    // Then fetch the user details for those IDs
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', followerIds);
    
    if (usersError) throw usersError;
    
    return usersData || [];
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
