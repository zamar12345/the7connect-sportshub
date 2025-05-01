
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
    
    // Add both participants in a single transaction to prevent issues with RLS policies
    const { error: participantsError } = await supabase.rpc('add_conversation_participants', {
      conversation_id_param: conversationId,
      current_user_id_param: currentUser.id,
      other_user_id_param: otherUserId
    });
      
    if (participantsError) {
      console.error("Error adding participants to conversation:", participantsError);
      throw participantsError;
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

    // Use a more reliable approach to find existing conversations
    const { data: existingConversation, error } = await supabase.rpc('find_conversation_between_users', {
      user_one: currentUserId,
      user_two: userId
    });
    
    if (error) {
      console.error("Error checking existing conversations:", error);
      throw error;
    }
    
    // If an existing conversation was found, return its ID
    if (existingConversation) {
      return existingConversation;
    }
    
    // If no existing conversation found, create a new one
    return await createConversation(userId);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
