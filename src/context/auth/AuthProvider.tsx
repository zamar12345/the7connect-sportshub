
import { createContext, useState, useEffect } from "react";
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
    const getSession = async () => {
      try {
        // Get session from supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          // Fetch or create user profile
          await handleUserProfile(currentSession.user.id, currentSession.user.user_metadata);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await handleUserProfile(newSession.user.id, newSession.user.user_metadata);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

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
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React from "react";
