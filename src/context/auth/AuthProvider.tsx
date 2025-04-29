
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "./useAuthOperations";
import { useUserProfile } from "./useUserProfile";
import { UserProfile } from "./types";

// Extended AuthContextType to include all needed properties
interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  resetPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { profile, setProfile, handleUserProfile } = useUserProfile();
  const { resetPassword, verifyOtp, updatePassword, signOut } = useAuthOperations();

  // Derived states
  const isAuthenticated = !!user;
  const isLoading = loading;

  useEffect(() => {
    // Set up auth listener first
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      // Use setTimeout to avoid potential deadlock with Supabase client
      if (session?.user) {
        setTimeout(() => {
          handleUserProfile(session.user.id, session.user.user_metadata);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        handleUserProfile(session.user.id, session.user.user_metadata);
      }
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
        user, 
        setUser, 
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
