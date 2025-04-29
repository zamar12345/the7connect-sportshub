
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  sport?: string;
  disciplines?: string[];
  onboarding_completed?: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  resetPassword: async () => {},
  verifyOtp: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, bio, sport, disciplines, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        setProfile(data as UserProfile);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener first to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Use setTimeout to prevent Supabase client recursion issues
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const profileData = await fetchUserProfile(currentSession.user.id);
        if (!profileData) {
          console.log("No profile found for user, may need to create one");
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Password reset functionality
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?reset=true",
      });
      
      if (error) throw error;
      
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Error sending reset instructions");
      throw error;
    }
  };

  // Verify OTP for password reset
  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });
      
      if (error) throw error;
      
      toast.success("OTP verified successfully");
    } catch (error: any) {
      toast.error(error.message || "Error verifying OTP");
      throw error;
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating password");
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSession(null);
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    resetPassword,
    verifyOtp,
    updatePassword,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
