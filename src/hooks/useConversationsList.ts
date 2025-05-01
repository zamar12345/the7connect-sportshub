
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
        
        // Use a simpler approach to get conversations with direct queries
        // First get all user's conversation participations
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
        
        // Get conversation IDs user participates in
        const conversationIds = participations.map(p => p.conversation_id);
        
        // For each conversation ID, find the other participant and get conversation details
        const result = await Promise.all(conversationIds.map(async (convId) => {
          try {
            // Get conversation details
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .select('id, created_at, updated_at, last_message, last_message_at')
              .eq('id', convId)
              .single();
              
            if (convError) {
              console.error(`Error fetching conversation ${convId}:`, convError);
              return null;
            }
            
            // Find other participant
            const { data: otherParticipant, error: partError } = await supabase
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
              .neq('user_id', currentUserId)
              .single();
              
            if (partError) {
              console.error(`Error fetching other participant for conversation ${convId}:`, partError);
              return null;
            }
            
            // Count unread messages
            const { count, error: countError } = await supabase
              .from('direct_messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convId)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);
              
            if (countError) {
              console.error(`Error counting unread messages for conversation ${convId}:`, countError);
              return null;
            }
            
            const otherUser = otherParticipant?.users || {
              id: 'unknown',
              full_name: 'Unknown User',
              avatar_url: null,
              username: null
            };
            
            return {
              id: conversation.id,
              lastMessage: conversation.last_message || 'Start a conversation',
              time: conversation.last_message_at 
                ? new Date(conversation.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
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
            console.error(`Error processing conversation ${convId}:`, error);
            return null;
          }
        }));
        
        // Filter out any null results from errors and sort by last message time (most recent first)
        return result
          .filter(item => item !== null) as Conversation[];
      } catch (error) {
        console.error("Error in useConversationsList:", error);
        return [];
      }
    },
    {
      staleTime: 5000, // Lower stale time to refresh more often
      gcTime: 30000,
      retry: 1,
    }
  );
}
