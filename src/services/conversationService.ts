
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
    
    // Add current user as a participant directly
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
    
    // For adding the other user, we need to use service role in production
    // For now, we'll directly insert but in production this should be done via a secure function
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
    
    // First get all conversation IDs where the current user is a participant
    const { data: userConversations, error: userConvError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.id);
      
    if (userConvError) {
      console.error("Error fetching user conversations:", userConvError);
      throw userConvError;
    }
    
    if (userConversations && userConversations.length > 0) {
      const conversationIds = userConversations.map(p => p.conversation_id);
      
      // Now find which of these conversations the other user participates in
      const { data: matchingConversations, error: matchingError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', conversationIds);
        
      if (matchingError) {
        console.error("Error finding matching conversations:", matchingError);
        throw matchingError;
      }
      
      if (matchingConversations && matchingConversations.length > 0) {
        // Return the first matching conversation ID
        return matchingConversations[0].conversation_id;
      }
    }
    
    // No existing conversation found, create a new one
    return createConversation(otherUserId);
  } catch (error: any) {
    console.error("Error finding or creating conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
