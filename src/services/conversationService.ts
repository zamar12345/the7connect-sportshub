
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create a new conversation with another user
 * @param otherUserId The ID of the user to start a conversation with
 * @returns The ID of the new conversation or null on failure
 */
export const createConversation = async (otherUserId: string): Promise<string | null> => {
  try {
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    if (!currentUser) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }

    // First create the conversation record
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
    
    // Add current user as a participant
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
    
    // Add the other user as a participant
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
    toast.error(`Failed to create conversation: ${error.message}`);
    return null;
  }
};

/**
 * Find an existing conversation between two users or create a new one
 * @param otherUserId The ID of the other user
 * @returns The conversation ID if found or created, null otherwise
 */
export const findOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
  try {
    const currentUser = (await supabase.auth.getSession()).data.session?.user;
    
    if (!currentUser) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }
    
    // Find all conversations for current user
    const { data: currentUserConversations, error: currentUserError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.id);
      
    if (currentUserError) {
      console.error("Error finding current user conversations:", currentUserError);
      throw currentUserError;
    }
    
    if (!currentUserConversations || currentUserConversations.length === 0) {
      // No existing conversations, create a new one
      return createConversation(otherUserId);
    }
    
    // Find which of current user's conversations also have the other user
    const currentUserConversationIds = currentUserConversations.map(c => c.conversation_id);
    
    const { data: sharedConversations, error: sharedError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', currentUserConversationIds);
      
    if (sharedError) {
      console.error("Error finding shared conversations:", sharedError);
      throw sharedError;
    }
    
    // If a shared conversation exists, return its ID
    if (sharedConversations && sharedConversations.length > 0) {
      return sharedConversations[0].conversation_id;
    }
    
    // No existing conversation found, create a new one
    return createConversation(otherUserId);
  } catch (error: any) {
    console.error("Error finding or creating conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
