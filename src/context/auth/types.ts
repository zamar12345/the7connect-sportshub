
import { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  sport?: string;
  disciplines?: string[];
  onboarding_completed?: boolean;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;  // Added this property
  isLoading: boolean;        // Added this property
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}
