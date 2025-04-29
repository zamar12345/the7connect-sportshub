
// Custom type definitions to use across the application
// These types match our Supabase database schema

export type User = {
  id: string;
  username: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  sport?: string | null;
  disciplines?: string[] | null;
  followers?: number | null;  // Added this property
  following?: number | null;  // Added this property
  onboarding_completed?: boolean | null;
  achievements?: any | null;  // Added this to match your schema
  stats?: any | null;         // Added this to match your schema
};

export type OnboardingSteps = {
  id: string;
  user_id: string;
  welcome_completed?: boolean;
  profile_completed?: boolean;
  interests_completed?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string; 
  location?: string; // Added for location support
  created_at: string;
  updated_at?: string;
  user?: User;
  likes_count?: number;
  comments_count?: number;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
};

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  content: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: User;
};

export type Conversation = {
  id: string;
  created_at?: string;
  updated_at?: string;
  last_message?: string;
  last_message_at?: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    username?: string;
  };
  unread: number;
  time: string;
};

export type ConversationParticipant = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Donation = {
  id: string;
  donor_id?: string;
  recipient_id?: string;
  amount: number;
  status: string;
  message?: string;
  donor_name?: string | null;
  donor_username?: string | null;
  donor_avatar?: string | null;
  recipient_name?: string | null;
  recipient_username?: string | null;
  recipient_avatar?: string | null;
  created_at: string;
};
