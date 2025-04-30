
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { startConversationFromProfile } from "@/services/messageService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

type StartMessageButtonProps = {
  userId: string;
  username?: string | null;
  className?: string;
};

const StartMessageButton = ({ userId, username, className = "" }: StartMessageButtonProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Get the conversation ID first
      const conversationId = await startConversationFromProfile(userId, username);
      
      if (conversationId) {
        // If we got a conversation ID, navigate to the messages page with that ID
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        // Failed to get conversation ID but no error was thrown
        console.log("No conversation ID returned but no error was thrown");
        navigate('/messages'); // Navigate to messages anyway
      }
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast.error(`Could not start conversation: ${error.message}`);
      // Still navigate to messages even if there was an error
      navigate('/messages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 ${className}`}
      onClick={handleStartConversation}
      disabled={isLoading}
    >
      <MessageCircle size={16} />
      <span>{isLoading ? "Loading..." : "Message"}</span>
    </Button>
  );
};

export default StartMessageButton;
