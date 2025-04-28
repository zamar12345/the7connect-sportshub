
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Message, Conversation } from "@/types/messages";
import { toast } from "sonner";
import { useRealtimeMessages } from "./useRealtimeMessages";

export function useMessageQuery(conversationId: string) {
  // Set up real-time subscription
  const { isSubscribed } = useRealtimeMessages(conversationId);
  
  // Fetch messages
  return useSupabaseQuery<Message[]>(
    ['messages', conversationId],
    async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data;
    },
    {
      enabled: !!conversationId && isSubscribed
    }
  );
}

export function useSendMessage(conversationId: string, currentUserId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          content,
          sender_id: currentUserId,
          conversation_id: conversationId,
          is_read: false
        })
        .select();
      
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      // Conversations will be updated automatically via the trigger and subscription
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    }
  });
}

export function useConversationsList() {
  return useSupabaseQuery<Conversation[]>(
    ['conversations'],
    async () => {
      // Get conversations with latest messages and participants
      const { data, error } = await supabase
        .from('conversation_details')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(conv => ({
        id: conv.id!,
        last_message: conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count: conv.unread_count || 0,
        user: conv.participants?.find((p: any) => 
          p.id !== supabase.auth.getUser()?.data?.user?.id
        ) || {}
      }));
    }
  );
}
