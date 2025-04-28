
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthProvider";
import { Conversation } from "@/types/messages";
import ConversationList from "@/components/messages/ConversationList";
import ConversationView from "@/components/messages/ConversationView";
import { useConversations } from "@/hooks/useConversations";

const Messages = () => {
  const { user } = useAuth();
  const { conversations, loading } = useConversations(user?.id);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

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
          conversations={conversations}
          loading={loading}
          onSelectConversation={handleSelectConversation}
        />
      )}
    </MobileLayout>
  );
};

export default Messages;
