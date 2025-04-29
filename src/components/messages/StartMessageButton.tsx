
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { startConversationFromProfile } from "@/services/messageService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
      await startConversationFromProfile(userId, username, navigate);
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
