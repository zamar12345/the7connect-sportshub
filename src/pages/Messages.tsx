
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthProvider";
import { Conversation } from "@/types/messages";
import ConversationList from "@/components/messages/ConversationList";
import ConversationView from "@/components/messages/ConversationView";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to access messages");
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
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
