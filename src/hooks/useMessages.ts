
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
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      return data || [];
    },
    {
      enabled: !!conversationId && isSubscribed,
      // Increase cache time to reduce refetching
      staleTime: 10000,
      gcTime: 30000, // Changed from cacheTime to gcTime
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
        
        // Get conversations with latest messages and participants using the updated view
        const { data, error } = await supabase
          .from('conversation_details')
          .select('*')
          .order('last_message_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching conversations:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          return [];
        }

        return data.map(conv => {
          // Safely handle participants, which could be a JSON array or string
          let participantsArray = [];
          if (conv.participants) {
            try {
              // If it's a string, parse it
              if (typeof conv.participants === 'string') {
                participantsArray = JSON.parse(conv.participants);
              } 
              // If it's already an array or object
              else if (Array.isArray(conv.participants)) {
                participantsArray = conv.participants;
              }
              // If it's an object but not an array
              else if (typeof conv.participants === 'object') {
                participantsArray = [conv.participants];
              }
            } catch (e) {
              console.error('Error parsing participants:', e);
              participantsArray = [];
            }
          }
          
          // Find the other participant (not current user)
          const otherParticipant = Array.isArray(participantsArray) ? 
            participantsArray.find((p: any) => p.id !== currentUserId) : null;
            
          return {
            id: conv.id || '',
            lastMessage: conv.last_message || 'Start a conversation',
            time: conv.last_message_at 
              ? new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              : 'now',
            unread: conv.unread_count || 0,
            user: {
              id: otherParticipant?.id || 'unknown',
              name: otherParticipant?.full_name || otherParticipant?.username || 'Unknown User',
              avatar: otherParticipant?.avatar_url || '',
              username: otherParticipant?.username
            }
          };
        });
      } catch (error) {
        console.error("Error in useConversationsList:", error);
        throw error;
      }
    },
    {
      // Increase cache time to reduce refetching
      staleTime: 5000,
      gcTime: 30000, // Changed from cacheTime to gcTime
    }
  );
}
