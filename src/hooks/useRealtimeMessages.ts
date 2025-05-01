
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types/messages";

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    // Get the current user ID
    const getCurrentUserId = async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id;
    };

    // Create a more specific channel name to avoid conflicts
    const channelName = `conversation:${conversationId}`;
    
    console.log(`Subscribing to realtime updates for conversation: ${conversationId}`);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        async (payload) => {
          try {
            console.log("Realtime message received:", payload);
            
            // Update messages cache
            const newMessage = payload.new as Message;
            
            // Optimistic update
            queryClient.setQueryData(['messages', conversationId], (oldData: Message[] = []) => {
              // Check if message already exists to avoid duplicates
              if (!oldData.some(msg => msg.id === newMessage.id)) {
                return [...oldData, newMessage];
              }
              return oldData;
            });
            
            // Mark as read if it's not from current user
            const currentUserId = await getCurrentUserId();
            if (currentUserId && newMessage.sender_id !== currentUserId) {
              markMessageAsRead(conversationId);
            }
            
            // Also update conversations list to show latest message
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          } catch (error) {
            console.error("Error handling realtime message:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to channel: ${channelName}`);
          setIsSubscribed(true);
        } else {
          console.log(`Realtime subscription status: ${status}`);
        }
      });
      
    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [conversationId, queryClient]);

  const markMessageAsRead = async (conversationId: string) => {
    try {
      console.log("Marking messages as read for conversation:", conversationId);
      
      // Directly use rpc to mark messages as read
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId
      });
      
      if (error) {
        console.error("Error marking messages as read:", error);
        throw error;
      }
      
      // Invalidate conversations cache to update unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
    }
  };

  return { isSubscribed, markMessageAsRead };
}
