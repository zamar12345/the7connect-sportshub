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

    // Check if a conversation already exists between these users
    const { data: existingParticipants, error: checkError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.id);
      
    if (checkError) {
      console.error("Error checking existing conversations:", checkError);
      throw checkError;
    }
    
    // Get conversation IDs where the current user is a participant
    const currentUserConversationIds = existingParticipants?.map(p => p.conversation_id) || [];
    
    // Find conversations where the other user is also a participant
    const { data: otherUserConversations, error: otherUserError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', currentUserConversationIds);
    
    if (otherUserError) {
      console.error("Error checking other user conversations:", otherUserError);
      throw otherUserError;
    }
    
    // If conversation already exists, return its ID
    if (otherUserConversations && otherUserConversations.length > 0) {
      return otherUserConversations[0].conversation_id;
    }
    
    // Otherwise, create a new conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({ })
      .select()
      .single();
      
    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }
    
    // Add participants
    const participants = [
      { conversation_id: conversationData.id, user_id: currentUser.id },
      { conversation_id: conversationData.id, user_id: otherUserId }
    ];
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);
      
    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      throw participantsError;
    }
    
    return conversationData.id;
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
export const startConversationFromProfile = async (
  userId: string, 
  username?: string | null, 
  navigate?: (path: string) => void
) => {
  try {
    const conversationId = await createConversation(userId);
    
    if (conversationId && navigate) {
      toast.success(`Started conversation with ${username || 'user'}`);
      navigate('/messages');
    }
    return conversationId;
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
