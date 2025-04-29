
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { startConversationFromProfile } from "@/services/messageService";
import { useNavigate } from "react-router-dom";

type StartMessageButtonProps = {
  userId: string;
  username?: string | null;
  className?: string;
};

const StartMessageButton = ({ userId, username, className = "" }: StartMessageButtonProps) => {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    await startConversationFromProfile(userId, username, navigate);
  };

  return (
    <Button 
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 ${className}`}
      onClick={handleStartConversation}
    >
      <MessageCircle size={16} />
      <span>Message</span>
    </Button>
  );
};

export default StartMessageButton;
