
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import DonateButton from "@/components/DonateButton";
import { Conversation } from "@/types/messages";
import MessageBubble from "./MessageBubble";
import { useMessageQuery, useSendMessage } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useMessages"; 
import { Alert, AlertDescription } from "@/components/ui/alert";

type ConversationViewProps = {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
};

const ConversationView = ({ conversation, currentUserId, onBack }: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set up real-time messaging and mark-as-read functionality first
  const { isSubscribed, markMessageAsRead } = useRealtimeMessages(conversation.id);
  
  // Fetch messages with React Query and real-time updates
  const { 
    data: messages = [],
    isLoading,
    refetch
  } = useMessageQuery(conversation.id, isSubscribed);
  
  // Send message mutation
  const sendMessageMutation = useSendMessage(conversation.id, currentUserId);

  useEffect(() => {
    scrollToBottom();
    
    // Mark messages as read when conversation is opened
    if (conversation.id) {
      markMessageAsRead(conversation.id);
    }
  }, [conversation.id, markMessageAsRead, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Store the message text and reset input immediately for better UX
    const messageText = newMessage.trim();
    setNewMessage("");
    
    try {
      console.log(`Sending message in conversation ${conversation.id}: ${messageText}`);
      
      // Send to server
      sendMessageMutation.mutate(messageText);
      
      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error("Error sending message:", error);
      // The error toast is handled in the mutation
    }
  };

  const handleRetryConnection = () => {
    // Force refetch messages
    refetch();
    // Refresh the page as a last resort if WebSocket connection is persistently failing
    if (!isSubscribed) {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
          <AvatarFallback>{conversation.user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-base">{conversation.user.name}</h3>
              <p className="text-xs text-muted-foreground">
                {conversation.user.username ? `@${conversation.user.username}` : 'Online'}
                {!isSubscribed && ' (offline)'}
              </p>
            </div>
            <DonateButton
              recipientId={conversation.user.id}
              recipientName={conversation.user.name}
            />
          </div>
        </div>
      </div>
      
      {!isSubscribed && (
        <Alert variant="destructive" className="m-2 py-2">
          <AlertDescription className="flex items-center justify-between">
            <span>Connection issue. Real-time updates paused.</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={handleRetryConnection}
            >
              <RefreshCw size={14} className="mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isCurrentUser={message.sender_id === currentUserId} 
            />
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-border p-4">
        <form 
          className="flex flex-col space-y-2" 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        >
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="resize-none min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            type="submit" 
            className="self-end"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <Send size={18} className="mr-2" /> 
            {sendMessageMutation.isPending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
