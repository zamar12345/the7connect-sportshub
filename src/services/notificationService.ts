
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch user's notifications
export const fetchNotifications = async () => {
  try {
    // First get the notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (notificationsError) throw notificationsError;
    
    // Initialize result with actor property to satisfy TypeScript
    const result = notifications?.map(notification => ({
      ...notification,
      actor: null // Default actor value
    })) || [];
    
    // If we have notifications, fetch the actor details separately
    if (notifications && notifications.length > 0) {
      // Get unique actor IDs
      const actorIds = [...new Set(notifications
        .filter(n => n.actor_id)
        .map(n => n.actor_id))];
      
      if (actorIds.length > 0) {
        // Fetch actor details
        const { data: actors, error: actorsError } = await supabase
          .from('users')
          .select('id, username, full_name, avatar_url')
          .in('id', actorIds);
        
        if (actorsError) throw actorsError;
        
        // Map actors to notifications
        return result.map(notification => {
          if (notification.actor_id && actors) {
            const actor = actors.find(a => a.id === notification.actor_id);
            if (actor) {
              return {
                ...notification,
                actor
              };
            }
          }
          return notification; // Already has null actor
        });
      }
    }
    
    return result;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    toast.error(`Error: ${error.message}`);
    return [];
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
      .eq('is_read', false);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    toast.error(`Error: ${error.message}`);
    return false;
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    toast.error(`Error: ${error.message}`);
    return false;
  }
};

// Count unread notifications
export const getUnreadNotificationsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
      .eq('is_read', false);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
};

// Store push subscription information in localStorage temporarily
// This is a workaround since we don't have a push_subscriptions table yet
export const registerForPushNotifications = async (subscription: PushSubscription) => {
  try {
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    
    // Store the push subscription in localStorage
    const subscriptionData = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.toJSON().keys?.p256dh,
      auth: subscription.toJSON().keys?.auth,
      created_at: new Date().toISOString()
    };
    
    // Save to localStorage (temporary solution)
    localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));
    
    return true;
  } catch (error: any) {
    console.error("Error registering for push notifications:", error);
    toast.error(`Error: ${error.message}`);
    return false;
  }
};

// Unregister from push notifications
export const unregisterFromPushNotifications = async () => {
  try {
    // Remove subscription from localStorage
    localStorage.removeItem('push_subscription');
    return true;
  } catch (error: any) {
    console.error("Error unregistering from push notifications:", error);
    toast.error(`Error: ${error.message}`);
    return false;
  }
};
