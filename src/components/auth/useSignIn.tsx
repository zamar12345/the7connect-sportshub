
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "username">("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // Email + Password login
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      toast.success("Successfully logged in!");
      navigate('/home');
      
      // If authentication is successful but we're not sure if they have a profile
      if (authData.user) {
        try {
          // Check if user has a profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          // If no profile found, create one using the auth data
          if (!userData && authData.user) {
            // We'll use a null check to avoid the TypeScript error
            if (authData.user) {
              await supabase
                .from('users')
                .insert({
                  id: authData.user.id,
                  username: authData.user.email?.split('@')[0] || `user_${Date.now()}`,
                  email: authData.user.email,
                  full_name: authData.user.user_metadata?.full_name || null
                });
            }
          }
        } catch (profileError) {
          console.error("Error checking/creating user profile:", profileError);
          // Continue with login even if profile check fails
        }
      }
      
      return authData;
    } catch (error: any) {
      let errorMessage = error.message || "Failed to sign in";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      }
      
      toast.error(errorMessage);
      return { user: null, session: null };
    } finally {
      setLoading(false);
    }
  };
  
  // Social login methods
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?provider=google`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "email") {
      await signInWithEmail(email, password);
    } else {
      // Username login requires a lookup first to get the email
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("email")
          .eq("username", username)
          .maybeSingle();
        
        if (error) throw error;
        if (!data || !data.email) {
          toast.error("Username not found");
          setLoading(false);
          return;
        }
        
        await signInWithEmail(data.email, password);
      } catch (error: any) {
        toast.error(`Error logging in: ${error.message}`);
        setLoading(false);
      }
    }
  };
  
  return {
    signInWithEmail,
    signInWithGoogle,
    loginType,
    setLoginType,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    resetDialogOpen,
    setResetDialogOpen,
    handleSignIn
  };
};
