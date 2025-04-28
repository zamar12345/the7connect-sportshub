
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Conversation } from "@/types/messages";
import ConversationListItem from "./ConversationListItem";
import { useConversationsList } from "@/hooks/useMessages";

type ConversationListProps = {
  onSelectConversation: (conversation: Conversation) => void;
};

const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations = [], isLoading } = useConversationsList();

  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.user.username && conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h1 className="text-xl font-bold mb-3">Messages</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search messages" 
            className="pl-10 bg-muted" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationListItem 
              key={conversation.id} 
              conversation={conversation}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
