
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationParticipant } from "@/types/messages";

// Create a new conversation between two users
export const createConversation = async (otherUserId: string): Promise<string | null> => {
  try {
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    if (!currentUser) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }

    // First create the conversation record without any participants
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();
      
    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }
    
    const conversationId = conversation.id;
    
    // Add both participants using separate insert statements instead of RPC
    const { error: currentUserError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: currentUser.id
      });
      
    if (currentUserError) {
      console.error("Error adding current user to conversation:", currentUserError);
      throw currentUserError;
    }
    
    const { error: otherUserError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: otherUserId
      });
      
    if (otherUserError) {
      console.error("Error adding other user to conversation:", otherUserError);
      throw otherUserError;
    }
    
    return conversationId;
  } catch (error: any) {
    console.error("Error in createConversation:", error);
    toast.error(`Failed to start conversation: ${error.message}`);
    return null;
  }
};

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
  try {
    // Check if conversation already exists by querying conversation_participants directly
    const currentUserSession = await supabase.auth.getSession();
    const currentUserId = currentUserSession.data.session?.user.id;
    
    if (!currentUserId) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }

    // Find existing conversation directly using a query instead of RPC
    const { data: existingParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);
      
    if (existingParticipations && existingParticipations.length > 0) {
      // Get all conversations where current user participates
      const currentUserConversations = existingParticipations.map(p => p.conversation_id);
      
      // Find conversations where the other user also participates
      const { data: otherUserParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)
        .in('conversation_id', currentUserConversations);
        
      // If there's a match, return the first conversation ID
      if (otherUserParticipations && otherUserParticipations.length > 0) {
        return otherUserParticipations[0].conversation_id;
      }
    }
    
    // If no existing conversation found, create a new one
    return await createConversation(userId);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
