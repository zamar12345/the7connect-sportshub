
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types/messages";
import { toast } from "sonner";

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const MAX_RETRIES = 3;

  // Extract markMessageAsRead to a separate function with useCallback to prevent recreation
  const markMessageAsRead = useCallback(async (conversationId: string) => {
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
  }, [queryClient]);

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
    
    const setupRealtimeSubscription = () => {
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
            setConnectionRetries(0); // Reset retry counter on success
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Realtime channel error for: ${channelName}`);
            handleConnectionError();
          } else if (status === 'TIMED_OUT') {
            console.error(`Realtime subscription timed out: ${channelName}`);
            handleConnectionError();
          } else {
            console.log(`Realtime subscription status: ${status}`);
          }
        });
        
      return channel;
    };
    
    const handleConnectionError = () => {
      if (connectionRetries < MAX_RETRIES) {
        const nextRetry = connectionRetries + 1;
        setConnectionRetries(nextRetry);
        
        const timeout = Math.min(1000 * Math.pow(2, nextRetry), 10000); // Exponential backoff up to 10 seconds
        console.log(`Retrying connection in ${timeout}ms (attempt ${nextRetry}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          console.log(`Attempting to reconnect (retry ${nextRetry}/${MAX_RETRIES})...`);
          setupChannel();
        }, timeout);
      } else {
        setIsSubscribed(false);
        toast.error("Failed to connect to messaging service. Please refresh the page.");
        console.error("Max connection retries reached. Giving up.");
      }
    };
    
    let channel: ReturnType<typeof setupRealtimeSubscription> | null = null;
    
    const setupChannel = () => {
      // Clean up previous channel if it exists
      if (channel) {
        supabase.removeChannel(channel);
      }
      channel = setupRealtimeSubscription();
    };
    
    setupChannel();
      
    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      if (channel) {
        supabase.removeChannel(channel);
      }
      setIsSubscribed(false);
    };
  }, [conversationId, queryClient, connectionRetries, markMessageAsRead]);

  return { isSubscribed, markMessageAsRead };
}
