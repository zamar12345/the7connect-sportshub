
import { Message } from "@/types/messages";

type MessageBubbleProps = {
  message: Message;
  isCurrentUser: boolean;
};

const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isCurrentUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isCurrentUser 
          ? 'text-primary-foreground/70' 
          : 'text-muted-foreground'
        }`}>
          {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
