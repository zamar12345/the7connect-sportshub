
export type ConversationParticipant = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username?: string | null;
}

export type Conversation = {
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

export type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
};

export type CreateMessageRequest = {
  content: string;
  conversation_id: string;
};
