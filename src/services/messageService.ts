
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

    // Simplified approach to avoid recursion issues
    // First create a conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({ })
      .select()
      .single();
      
    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }
    
    // Then add participants one by one
    // First add current user
    const { error: currentUserError } = await supabase
      .from('conversation_participants')
      .insert({ 
        conversation_id: conversationData.id, 
        user_id: currentUser.id 
      });
      
    if (currentUserError) {
      console.error("Error adding current user as participant:", currentUserError);
      throw currentUserError;
    }
    
    // Then add other user
    const { error: otherUserError } = await supabase
      .from('conversation_participants')
      .insert({ 
        conversation_id: conversationData.id, 
        user_id: otherUserId 
      });
      
    if (otherUserError) {
      console.error("Error adding other user as participant:", otherUserError);
      throw otherUserError;
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
    // Check if conversation already exists by querying directly
    const currentUserSession = await supabase.auth.getSession();
    const currentUserId = currentUserSession.data.session?.user.id;
    
    if (!currentUserId) {
      toast.error("You must be logged in to start a conversation");
      return null;
    }

    // Look for existing conversation
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversation_details')
      .select('*');

    if (!searchError && existingConversations) {
      // Look through participants to find a conversation with this user
      const existingConversation = existingConversations.find((conv) => {
        if (!conv.participants) return false;
        
        let participants = [];
        try {
          if (typeof conv.participants === 'string') {
            participants = JSON.parse(conv.participants);
          } else if (Array.isArray(conv.participants)) {
            participants = conv.participants;
          } else if (typeof conv.participants === 'object') {
            participants = [conv.participants];
          }
        } catch (e) {
          return false;
        }
        
        // Check if both users are in this conversation
        const hasCurrentUser = participants.some((p: any) => p.id === currentUserId);
        const hasOtherUser = participants.some((p: any) => p.id === userId);
        
        return hasCurrentUser && hasOtherUser;
      });
      
      if (existingConversation) {
        toast.success(`Conversation with ${username || 'user'} already exists`);
        if (navigate) navigate('/messages');
        return existingConversation.id;
      }
    }
    
    const conversationId = await createConversation(userId);
    
    if (conversationId) {
      toast.success(`Started conversation with ${username || 'user'}`);
      if (navigate) navigate('/messages');
    }
    return conversationId;
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    toast.error(`Could not start conversation: ${error.message}`);
    return null;
  }
};
