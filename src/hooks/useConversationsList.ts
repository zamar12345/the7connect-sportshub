
import { useSupabaseQuery } from "./useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/types/messages";

/**
 * Hook for fetching the list of conversations for the current user
 */
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
        
        // First get all conversation IDs where the current user is a participant
        const { data: participations, error: participationsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', currentUserId);
          
        if (participationsError) {
          console.error("Error fetching conversations:", participationsError);
          throw participationsError;
        }
        
        if (!participations || participations.length === 0) {
          return [];
        }
        
        // Get the conversation IDs
        const conversationIds = participations.map(p => p.conversation_id);
        
        // Process each conversation separately to avoid complex joins
        const conversations = await Promise.all(conversationIds.map(async (convId) => {
          try {
            // Get the conversation details
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .select('*, id, last_message, last_message_at')
              .eq('id', convId)
              .single();
              
            if (convError || !conversation) {
              console.error("Error fetching conversation:", convError);
              return null;
            }
            
            // Find the other participant
            const { data: participants, error: partError } = await supabase
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
              .eq('conversation_id', convId)
              .neq('user_id', currentUserId);
              
            if (partError || !participants || participants.length === 0) {
              console.error("Error fetching participants:", partError);
              return null;
            }
            
            // Get the other user's info
            const otherUser = participants[0].users;
            
            // Count unread messages
            const { count, error: countError } = await supabase
              .from('direct_messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convId)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);
              
            if (countError) {
              console.error("Error counting unread messages:", countError);
              return null;
            }
            
            // Build the conversation object
            return {
              id: conversation.id,
              user: {
                id: otherUser.id,
                name: otherUser.full_name || otherUser.username || 'Unknown User',
                avatar: otherUser.avatar_url || '',
                username: otherUser.username
              },
              lastMessage: conversation.last_message || 'Start a conversation',
              time: conversation.last_message_at 
                ? new Date(conversation.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : 'now',
              unread: count || 0
            };
          } catch (error) {
            console.error("Error processing conversation:", error);
            return null;
          }
        }));
        
        // Filter out any null results and return valid conversations
        return conversations.filter(Boolean) as Conversation[];
      } catch (error) {
        console.error("Error in useConversationsList:", error);
        return [];
      }
    },
    {
      staleTime: 5000,
      gcTime: 30000,
      retry: 1,
    }
  );
}
