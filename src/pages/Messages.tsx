
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Input } from "@/components/ui/input";
import { Search, Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username?: string;
  };
  lastMessage: string;
  time: string;
  unread: number;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
};

const Messages = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
      
      // Subscribe to new messages for the selected conversation
      const channel = supabase
        .channel(`conversation:${selectedConversation.id}`)
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${selectedConversation.id}`
          }, 
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            if (newMessage.sender_id !== user?.id) {
              markMessagesAsRead(selectedConversation.id);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, user?.id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // This is a mockup of how we would fetch real data from Supabase
      // In a real implementation, we would fetch from conversation_participants 
      // table where user_id equals current user's ID
      const { data: mockUsers } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, username')
        .neq('id', user?.id)
        .limit(5);
      
      if (mockUsers) {
        // Converting the mock users to conversations format
        const mockConversations = mockUsers.map(mockUser => ({
          id: `conv-${mockUser.id}`,
          user: {
            id: mockUser.id,
            name: mockUser.full_name || 'Unknown User',
            avatar: mockUser.avatar_url || '',
            username: mockUser.username
          },
          lastMessage: "Tap to start messaging",
          time: "now",
          unread: 0
        }));
        
        setConversations(mockConversations);
      }
    } catch (error: any) {
      toast.error("Failed to load conversations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // In a real implementation, we would fetch from direct_messages table
      // where conversation_id equals the selected conversation's ID
      // This is mockup data to simulate messages
      
      const mockMessages = [
        {
          id: "msg-1",
          content: "Hi there! How are you doing?",
          sender_id: selectedConversation?.user.id || "",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true
        },
        {
          id: "msg-2",
          content: "I'm doing great! Just finished training. How about you?",
          sender_id: user?.id || "",
          created_at: new Date(Date.now() - 3500000).toISOString(),
          is_read: true
        },
        {
          id: "msg-3",
          content: "Getting ready for the tournament next weekend. Are you coming?",
          sender_id: selectedConversation?.user.id || "",
          created_at: new Date(Date.now() - 3400000).toISOString(),
          is_read: true
        }
      ];
      
      setMessages(mockMessages);
    } catch (error: any) {
      toast.error("Failed to load messages: " + error.message);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    // In a real implementation, we would update is_read to true
    // for all messages in the conversation where the current user is not the sender
    // This is a mockup to simulate marking messages as read
    
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    try {
      setSendingMessage(true);
      
      // In a real implementation, we would insert into direct_messages table
      // This is a mockup to simulate sending a message
      
      const newMsg = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prevMessages => [...prevMessages, newMsg]);
      
      // Update the conversation with the last message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id ? 
          { ...conv, lastMessage: newMessage, time: "now" } : 
          conv
        )
      );
      
      setNewMessage("");
      
      // In a real implementation, we would update the conversation's last_message and last_message_at
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.user.username && conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;

  if (selectedConversation) {
    return (
      <MobileLayout>
        <div className="flex flex-col h-full">
          <div className="border-b border-border p-4 flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={handleBack}>
              <ArrowLeft size={20} />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
              <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-medium text-base">{selectedConversation.user.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.user.username ? `@${selectedConversation.user.username}` : 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user?.id 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border p-4">
            <form 
              className="flex items-center space-x-2" 
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..." 
                className="flex-1" 
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={sendingMessage || !newMessage.trim()}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
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
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className="flex items-center p-4 border-b border-border hover:bg-muted/20 cursor-pointer"
                onClick={() => setSelectedConversation(conversation)}
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
    </MobileLayout>
  );
};

export default Messages;
