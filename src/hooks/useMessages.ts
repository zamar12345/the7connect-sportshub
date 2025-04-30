
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
      // Increase cache time to reduce refetching
      staleTime: 10000,
      gcTime: 30000, // Changed from cacheTime to gcTime
      retry: 1, // Limit retries on error
    }
  );
}

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
      // Optional: Further optimize by adding optimistic updates
      return { content };
    },
    onSuccess: (data) => {
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Update messages cache - optional
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
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
      try {
        // Get the current user ID
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }
        
        // First get all conversations this user participates in
        const { data: participations, error: participationsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', currentUserId);
        
        if (participationsError) {
          console.error("Error fetching participant data:", participationsError);
          throw participationsError;
        }
        
        if (!participations || participations.length === 0) {
          return [];
        }
        
        // Get the conversation IDs
        const conversationIds = participations.map(p => p.conversation_id);
        
        // Get conversations basic data
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('id, created_at, updated_at, last_message, last_message_at')
          .in('id', conversationIds);
        
        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
          throw conversationsError;
        }
        
        if (!conversations || conversations.length === 0) {
          return [];
        }
        
        // For each conversation, get the other participant
        const result = await Promise.all(conversations.map(async (conv) => {
          try {
            // Get other participants
            const { data: otherParticipants, error: participantsError } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                users:user_id (
                  id, 
                  full_name, 
                  avatar_url,
                  username
                )
              `)
              .eq('conversation_id', conv.id)
              .neq('user_id', currentUserId)
              .limit(1)
              .single();
              
            if (participantsError) {
              console.error(`Error fetching participants for conversation ${conv.id}:`, participantsError);
              return null;
            }
            
            // Get unread count
            const { count, error: countError } = await supabase
              .from('direct_messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);
              
            if (countError) {
              console.error(`Error counting unread messages for conversation ${conv.id}:`, countError);
            }
            
            const otherUser = otherParticipants?.users || {
              id: 'unknown',
              full_name: 'Unknown User',
              avatar_url: null,
              username: null
            };
            
            return {
              id: conv.id,
              lastMessage: conv.last_message || 'Start a conversation',
              time: conv.last_message_at 
                ? new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : 'now',
              unread: count || 0,
              user: {
                id: otherUser.id,
                name: otherUser.full_name || otherUser.username || 'Unknown User',
                avatar: otherUser.avatar_url || '',
                username: otherUser.username
              }
            };
          } catch (error) {
            console.error(`Error processing conversation ${conv.id}:`, error);
            return null;
          }
        }));
        
        // Filter out any null results from errors
        return result.filter(item => item !== null) as Conversation[];
      } catch (error) {
        console.error("Error in useConversationsList:", error);
        return [];
      }
    },
    {
      // Increase cache time to reduce refetching
      staleTime: 5000,
      gcTime: 30000, // Changed from cacheTime to gcTime
      retry: 1, // Limit retries on error
    }
  );
}
