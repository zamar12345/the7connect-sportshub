
import { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserProfile } from "./types";
import { useUserProfile } from "./useUserProfile";
import { useAuthOperations } from "./useAuthOperations";

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isLoading: true,
  resetPassword: async () => {},
  verifyOtp: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, setProfile, handleUserProfile } = useUserProfile();
  const { resetPassword, verifyOtp, updatePassword, signOut } = useAuthOperations();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          // Use setTimeout to prevent potential deadlocks with Supabase auth
          setTimeout(async () => {
            await handleUserProfile(newSession.user.id, newSession.user.user_metadata);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await handleUserProfile(currentSession.user.id, currentSession.user.user_metadata);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Ensure loading is set to false even if there's an error
        setLoading(false);
      }
    };

    getSession();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleUserProfile, setProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    resetPassword,
    verifyOtp,
    updatePassword,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
