
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/messages";

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          // Update messages cache
          const newMessage = payload.new as Message;
          
          queryClient.setQueryData(['messages', conversationId], (oldData: Message[] = []) => {
            return [...oldData, newMessage];
          });
          
          // Mark as read if it's not from current user
          if (newMessage.sender_id !== supabase.auth.getUser()?.data?.user?.id) {
            markMessageAsRead(conversationId);
          }
        }
      )
      .subscribe(() => {
        setIsSubscribed(true);
      });
      
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [conversationId, queryClient]);

  const markMessageAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId
      });
      
      if (error) throw error;
      
      // Invalidate conversations cache to update unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
    }
  };

  return { isSubscribed };
}
