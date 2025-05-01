
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/types/messages";
import { toast } from "sonner";

/**
 * Hook for fetching messages in a conversation
 */
export function useMessageQuery(conversationId: string, isSubscribed: boolean = true) {
  return useSupabaseQuery<Message[]>(
    ['messages', conversationId],
    async () => {
      if (!conversationId) return [];
      
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Error fetching messages:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in useMessageQuery:", error);
        return [];
      }
    },
    {
      enabled: !!conversationId && isSubscribed,
      staleTime: 10000,
      gcTime: 30000,
      retry: 1,
    }
  );
}

/**
 * Hook for sending messages in a conversation
 */
export function useSendMessage(conversationId: string, currentUserId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: string) => {
      if (!content.trim()) {
        throw new Error("Message content cannot be empty");
      }
      
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          content,
          sender_id: currentUserId,
          conversation_id: conversationId,
          is_read: false
        })
        .select();
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      return data?.[0];
    },
    onMutate: async (content) => {
      return { content };
    },
    onSuccess: () => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    }
  });
}
