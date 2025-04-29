import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserProfile {
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

  const handleUserProfile = async (userId: string, userData?: any) => {
    try {
      console.log("Handling user profile for ID:", userId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id, username, email, full_name, avatar_url, bio, sport, disciplines, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();
        
      if (fetchError && !fetchError.message.includes('No rows found')) {
        console.error("Error fetching user profile:", fetchError);
        return null;
      }
      
      if (existingProfile) {
        console.log("Found existing user profile:", existingProfile);
        setProfile(existingProfile as UserProfile);
        return existingProfile;
      }
      
      console.log("No profile found, creating one with metadata:", userData);
      
      if (userData) {
        const username = userData.username || userData.email?.split('@')[0] || `user_${Date.now()}`;
        const fullName = userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const email = userData.email || null;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: username,
            email: email,
            full_name: fullName || null,
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return null;
        }
        
        console.log("Created new user profile:", newProfile);
        setProfile(newProfile as UserProfile);
        return newProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Exception handling user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user && ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
          setTimeout(() => {
            const metadata = {
              ...currentSession.user.user_metadata,
              email: currentSession.user.email
            };
            handleUserProfile(currentSession.user.id, metadata);
          }, 0);
        } else if (!currentSession) {
          setProfile(null);
        }
        
        if (event !== "INITIAL_SESSION") {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const metadata = {
          ...currentSession.user.user_metadata,
          email: currentSession.user.email
        };
        handleUserProfile(currentSession.user.id, metadata);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
