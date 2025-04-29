
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSignIn = () => {
  const [loginType, setLoginType] = useState<"email" | "username">("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Starting sign in process...");
    
    try {
      let signInResult;
      
      if (loginType === "email") {
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        // For username login, need to find the email first
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', username)
          .single();
          
        if (userError) {
          toast.error("Username not found. Please check your username or sign in with email.");
          setLoading(false);
          return;
        }
        
        signInResult = await supabase.auth.signInWithPassword({
          email: userData.email,
          password,
        });
      }
      
      const { data, error } = signInResult;
      
      if (error) throw error;
      
      console.log("Sign in successful, user data:", data);
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login")) {
        toast.error(`Invalid ${loginType === "email" ? "email" : "username"} or password. Please try again.`);
      } else {
        toast.error(error.message || "Error during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
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
