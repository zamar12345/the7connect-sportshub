
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthProvider";
import { Conversation } from "@/types/messages";
import ConversationList from "@/components/messages/ConversationList";
import ConversationView from "@/components/messages/ConversationView";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to access messages");
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    // Check for conversation parameter in URL
    const conversationId = searchParams.get('conversation');
    if (conversationId && user) {
      // Find or create the conversation object based on the ID
      const getConversationDetails = async () => {
        try {
          // Get other participants to build the conversation object
          const { data: participants, error: participantsError } = await supabase
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
            .eq('conversation_id', conversationId)
            .neq('user_id', user.id);
            
          if (participantsError) {
            console.error("Error fetching participants:", participantsError);
            return;
          }
          
          if (participants && participants.length > 0) {
            const otherUser = participants[0].users;
            
            // Get conversation details
            const { data: convData, error: convError } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', conversationId)
              .single();
              
            if (convError) {
              console.error("Error fetching conversation:", convError);
              return;
            }
            
            // Mark messages as read when selecting a conversation
            await supabase.rpc('mark_messages_as_read', {
              conversation_id_param: conversationId
            });
              
            // Create conversation object and set it as selected
            const conversation: Conversation = {
              id: conversationId,
              user: {
                id: otherUser.id,
                name: otherUser.full_name || otherUser.username || 'Unknown User',
                avatar: otherUser.avatar_url || '',
                username: otherUser.username
              },
              lastMessage: convData?.last_message || 'Start a conversation',
              time: convData?.last_message_at 
                ? new Date(convData.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : 'now',
              unread: 0
            };
            
            setSelectedConversation(conversation);
          }
        } catch (error) {
          console.error("Error processing conversation from URL:", error);
        }
      };
      
      getConversationDetails();
    }
  }, [searchParams, user]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read when selecting a conversation
    if (conversation.id && user?.id) {
      try {
        await supabase.rpc('mark_messages_as_read', {
          conversation_id_param: conversation.id
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    // Remove the conversation parameter from the URL
    navigate('/messages');
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  // Ensure user is authenticated 
  if (!isAuthenticated || !user) {
    return null; // Don't render anything, redirect happens in useEffect
  }

  return (
    <MobileLayout>
      {selectedConversation ? (
        <ConversationView 
          conversation={selectedConversation}
          currentUserId={user?.id || ''}
          onBack={handleBack}
        />
      ) : (
        <ConversationList 
          onSelectConversation={handleSelectConversation}
        />
      )}
    </MobileLayout>
  );
};

export default Messages;
