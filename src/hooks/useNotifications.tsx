
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getUnreadNotificationsCount } from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          (payload) => {
            // Refresh unread count whenever notifications change
            fetchUnreadCount();
            
            // Show a toast for new notifications
            if (payload.eventType === 'INSERT') {
              const notificationData = payload.new;
              let message = "You have a new notification";
              
              switch(notificationData.type) {
                case 'like':
                  message = "Someone liked your post";
                  break;
                case 'comment':
                  message = "Someone commented on your post";
                  break;
                case 'follow':
                  message = "Someone started following you";
                  break;
                case 'donation':
                  message = "You received a donation";
                  break;
              }
              
              toast(message, {
                description: "Tap to view",
                action: {
                  label: "View",
                  onClick: () => window.location.href = "/notifications"
                }
              });
            }
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
