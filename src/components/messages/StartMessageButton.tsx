
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
    try {
      setIsLoading(true);
      
      // Navigate to messages first, then try to start conversation there
      navigate('/messages');
      
      // Small delay to ensure navigation happens first
      setTimeout(async () => {
        try {
          const conversationId = await startConversationFromProfile(userId, username);
          if (!conversationId) {
            console.log("No conversation ID returned but no error was thrown");
          }
        } catch (error) {
          console.error("Error after navigation:", error);
        } finally {
          setIsLoading(false);
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast.error(`Could not start conversation: ${error.message}`);
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
