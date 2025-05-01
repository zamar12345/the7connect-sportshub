
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationParticipant } from "@/types/messages";
import { findOrCreateConversation } from "./conversationService";

// Get conversation participants
export const getConversationParticipants = async (conversationId: string): Promise<ConversationParticipant[]> => {
  try {
    // Using a direct join with users table to avoid recursive policy issues
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        avatar_url,
        username
      `)
      .in('id', supabase.rpc('get_conversation_participant_ids', { conversation_uuid: conversationId }));
      
    if (error) throw error;
    
    return data.map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      username: user.username
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
