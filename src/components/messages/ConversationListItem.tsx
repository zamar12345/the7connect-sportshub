
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/types/messages";

type ConversationListItemProps = {
  conversation: Conversation;
  onClick: () => void;
};

const ConversationListItem = ({ conversation, onClick }: ConversationListItemProps) => {
  return (
    <div 
      className="flex items-center p-4 border-b border-border hover:bg-muted/20 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
        </Avatar>
        {conversation.unread > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-sport-orange text-white"
          >
            {conversation.unread}
          </Badge>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium truncate">{conversation.user.name}</h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">{conversation.time}</span>
        </div>
        <p 
          className={`text-sm truncate ${conversation.unread > 0 ? "font-medium" : "text-muted-foreground"}`}
        >
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );
};

export default ConversationListItem;
