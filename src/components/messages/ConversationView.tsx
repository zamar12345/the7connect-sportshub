
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import DonateButton from "@/components/DonateButton";
import { Conversation, Message } from "@/types/messages";
import MessageBubble from "./MessageBubble";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ConversationViewProps = {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
};

const ConversationView = ({ conversation, currentUserId, onBack }: ConversationViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversation.id}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          if (newMessage.sender_id !== currentUserId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData);
      } else {
        const mockMessages = [
          {
            id: "msg-1",
            content: "Hi there! How are you doing?",
            sender_id: conversation.user.id,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true
          },
          {
            id: "msg-2",
            content: "I'm doing great! Just finished training. How about you?",
            sender_id: currentUserId,
            created_at: new Date(Date.now() - 3500000).toISOString(),
            is_read: true
          },
          {
            id: "msg-3",
            content: "Getting ready for the tournament next weekend. Are you coming?",
            sender_id: conversation.user.id,
            created_at: new Date(Date.now() - 3400000).toISOString(),
            is_read: true
          }
        ];
        
        setMessages(mockMessages);
      }
    } catch (error: any) {
      toast.error("Failed to load messages: " + error.message);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversation.id
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          content: newMessage,
          sender_id: currentUserId,
          conversation_id: conversation.id,
          is_read: false
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        const newMsg = data[0];
        setMessages(prevMessages => [...prevMessages, newMsg]);
      }
      
      setNewMessage("");
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSendingMessage(false);
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
          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-base">{conversation.user.name}</h3>
              <p className="text-xs text-muted-foreground">
                {conversation.user.username ? `@${conversation.user.username}` : 'Online'}
              </p>
            </div>
            <DonateButton
              recipientId={conversation.user.id}
              recipientName={conversation.user.name}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isCurrentUser={message.sender_id === currentUserId} 
          />
        ))}
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
            disabled={sendingMessage || !newMessage.trim()}
          >
            <Send size={18} className="mr-2" /> Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
