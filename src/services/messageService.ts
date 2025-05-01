
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationParticipant } from "@/types/messages";
import { findOrCreateConversation } from "./conversationService";

// Get conversation participants
export const getConversationParticipants = async (conversationId: string): Promise<ConversationParticipant[]> => {
  try {
    // First get participant user IDs
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);
      
    if (participantsError) throw participantsError;
    
    if (!participants || participants.length === 0) {
      return [];
    }
    
    // Get the user info for all participants
    const userIds = participants.map(p => p.user_id);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, username')
      .in('id', userIds);
      
    if (usersError) throw usersError;
    
    return users.map((user: any) => ({
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
