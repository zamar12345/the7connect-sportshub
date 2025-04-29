
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Conversation, ConversationParticipant } from "@/types/supabase";

export const useConversations = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchConversations(userId);
    }
  }, [userId]);

  const fetchConversations = async (currentUserId: string) => {
    try {
      setLoading(true);
      
      // Using the updated conversation_details view
      const { data: recentConversations, error } = await supabase
        .from('conversation_details')
        .select('*');
      
      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error(`Failed to load conversations: ${error.message}`);
        throw error;
      }
      
      if (recentConversations) {
        const formattedConversations = recentConversations.map(conv => {
          let participantsList: ConversationParticipant[] = [];
          
          if (conv.participants) {
            try {
              // Handle participants based on their structure
              if (Array.isArray(conv.participants)) {
                participantsList = conv.participants.map((p: any) => {
                  if (typeof p === 'object' && p !== null) {
                    return {
                      id: String(p.id || ''),
                      full_name: typeof p.full_name === 'string' ? p.full_name : null,
                      avatar_url: typeof p.avatar_url === 'string' ? p.avatar_url : null,
                      username: typeof p.username === 'string' ? p.username : null
                    };
                  }
                  return {
                    id: 'unknown',
                    full_name: null,
                    avatar_url: null,
                    username: null
                  };
                });
              } else if (typeof conv.participants === 'object' && conv.participants !== null) {
                const p: any = conv.participants;
                participantsList = [{
                  id: String(p.id || ''),
                  full_name: typeof p.full_name === 'string' ? p.full_name : null,
                  avatar_url: typeof p.avatar_url === 'string' ? p.avatar_url : null,
                  username: typeof p.username === 'string' ? p.username : null
                }];
              }
            } catch (e) {
              console.error("Error processing participants:", e);
              participantsList = [];
            }
          }
          
          const otherParticipant = participantsList.find(p => p.id !== currentUserId) || {
            id: 'unknown',
            full_name: 'Unknown User',
            avatar_url: null,
            username: null
          };
          
          return {
            id: conv.id || '',
            user: {
              id: otherParticipant.id,
              name: otherParticipant.full_name || 'Unknown User',
              avatar: otherParticipant.avatar_url || '',
              username: otherParticipant.username || undefined
            },
            lastMessage: conv.last_message || "Start a conversation",
            time: conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "now",
            unread: conv.unread_count || 0
          } as Conversation;
        });
        
        setConversations(formattedConversations);
      }
    } catch (error: any) {
      console.error("Error in fetchConversations:", error);
      
      // Fallback to fetch some users as potential conversation partners
      try {
        const { data: mockUsers } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, username')
          .neq('id', currentUserId)
          .limit(5);
        
        if (mockUsers) {
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
          })) as Conversation[];
          
          setConversations(mockConversations);
        }
      } catch (fallbackError) {
        console.error("Error fetching fallback users:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConversation = (
    conversationId: string, 
    updates: Partial<Omit<Conversation, 'id' | 'user'>>
  ) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    );
  };

  return { conversations, loading, updateConversation };
};
