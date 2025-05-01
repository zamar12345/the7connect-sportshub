
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
        
        // Use a custom function to fetch conversations without recursion issues
        const { data: conversationIds, error: idsError } = await supabase.rpc('get_user_conversation_ids', { 
          user_id_param: currentUserId 
        });
          
        if (idsError) {
          console.error("Error fetching conversation IDs:", idsError);
          throw idsError;
        }
        
        if (!conversationIds || conversationIds.length === 0) {
          return [];
        }
        
        // Fetch conversations data
        const conversationsPromises = conversationIds.map(async (convId: string) => {
          try {
            // 1. Get the basic conversation data
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', convId)
              .single();
              
            if (convError || !conversation) {
              console.error(`Error fetching conversation ${convId}:`, convError);
              return null;
            }
            
            // 2. Get the other participants
            const { data: otherUsers, error: usersError } = await supabase
              .from('users')
              .select('id, full_name, avatar_url, username')
              .in('id', supabase.rpc('get_conversation_other_participants', { 
                conversation_uuid: convId,
                current_user_id: currentUserId
              }))
              .limit(1);
              
            if (usersError || !otherUsers || otherUsers.length === 0) {
              console.error(`Error fetching other participants for ${convId}:`, usersError);
              return null;
            }
            
            // 3. Get the other user's info
            const otherUser = otherUsers[0];
            
            // 4. Count unread messages
            const { count, error: countError } = await supabase
              .from('direct_messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', convId)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);
              
            if (countError) {
              console.error(`Error counting unread messages for ${convId}:`, countError);
              return null;
            }
            
            // 5. Build the conversation object
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
        });
        
        // Wait for all conversation processing to complete
        const conversations = await Promise.all(conversationsPromises);
        
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
