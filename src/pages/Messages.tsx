
import MobileLayout from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mockConversations = [
  {
    id: "conv-1",
    user: mockUsers[1],
    lastMessage: "Are you coming to the tournament next week?",
    time: "2m",
    unread: 2
  },
  {
    id: "conv-2",
    user: mockUsers[2],
    lastMessage: "Thanks for the advice on my technique!",
    time: "1h",
    unread: 0
  },
  {
    id: "conv-3",
    user: mockUsers[3],
    lastMessage: "Let's schedule that practice session for tomorrow",
    time: "3h",
    unread: 0
  }
];

const Messages = () => {
  return (
    <MobileLayout>
      <div className="flex flex-col h-full">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages" className="pl-10 bg-muted" />
          </div>
        </div>
        
        <div>
          {mockConversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className="flex items-center p-4 border-b border-border hover:bg-muted/20 cursor-pointer"
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
          ))}
          
          {mockConversations.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Messages;
