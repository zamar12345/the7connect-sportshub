
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContext";
import { useUserProfile } from "./useUserProfile";
import { useAuthOperations } from "./useAuthOperations";
import { UserProfile } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { profile, setProfile, handleUserProfile } = useUserProfile();
  const { resetPassword, verifyOtp, updatePassword, signOut: authSignOut } = useAuthOperations();

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

  const signOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      throw error;
    }
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
