
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
        return notifications.map(notification => {
          if (notification.actor_id) {
            const actor = actors?.find(a => a.id === notification.actor_id);
            return {
              ...notification,
              actor: actor || { 
                id: notification.actor_id,
                username: 'unknown',
                full_name: 'Unknown User',
                avatar_url: null 
              }
            };
          }
          return {
            ...notification,
            actor: null
          };
        });
      }
    }
    
    return notifications || [];
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
