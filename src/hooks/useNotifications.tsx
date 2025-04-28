
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getUnreadNotificationsCount } from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";

export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get initial unread count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up real-time subscription to receive notifications
      const channel = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh unread count whenever notifications change
            fetchUnreadCount();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  const fetchUnreadCount = async () => {
    if (user) {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    }
  };
  
  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
};
