
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationParticipant } from "@/types/messages";
import { findOrCreateConversation } from "./conversationService";

// Get conversation participants
export const getConversationParticipants = async (conversationId: string): Promise<ConversationParticipant[]> => {
  try {
    const { data, error } = await supabase
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
      .eq('conversation_id', conversationId);
      
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.users.id,
      full_name: item.users.full_name,
      avatar_url: item.users.avatar_url,
      username: item.users.username
    }));
  } catch (error: any) {
    console.error("Error fetching conversation participants:", error);
    return [];
  }
};

// Start a conversation with a user from their profile
export const startConversationFromProfile = async (userId: string): Promise<string | null> => {
  return findOrCreateConversation(userId);
};
