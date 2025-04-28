
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch user's notifications
export const fetchNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id (
          id, 
          username, 
          full_name, 
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data;
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
