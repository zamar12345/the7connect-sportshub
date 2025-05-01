
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./useAuthOperations";
import { useUserProfile } from "./useUserProfile";
import { UserProfile } from "./types";
import { Session, User } from "@supabase/supabase-js";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { profile, setProfile, handleUserProfile } = useUserProfile();
  const { resetPassword, verifyOtp, updatePassword, signOut } = useAuthOperations();

  // Derived states
  const isAuthenticated = !!user;
  const isLoading = loading;

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth listener first
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`Auth state change event: ${event}`, newSession?.user?.id || "");
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      // Use setTimeout to avoid potential deadlock with Supabase client
      if (newSession?.user) {
        setTimeout(() => {
          handleUserProfile(newSession.user.id, newSession.user.user_metadata);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Has session" : "No session");
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        handleUserProfile(currentSession.user.id, currentSession.user.user_metadata);
      }
      setLoading(false);
    }).catch(error => {
      console.error("Error checking session:", error);
      setLoading(false);
    });

    // Clean up the listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        session,
        user, 
        profile,
        loading,
        isAuthenticated,
        isLoading,
        resetPassword,
        verifyOtp,
        updatePassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
