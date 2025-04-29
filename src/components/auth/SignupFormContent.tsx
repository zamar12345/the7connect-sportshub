
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { signupSchema, SignupFormValues } from "./schemas/signupSchema";
import { NameFields, UsernameField, EmailField, PasswordFields } from "./FormFields";

export const SignupFormContent = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSignUp = async (values: SignupFormValues) => {
    setLoading(true);
    console.log("Starting sign up process...");
    
    try {
      const fullName = `${values.firstName} ${values.lastName}`.trim();
      const username = values.username.trim();
      
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing user:", checkError);
      }
      
      if (existingUsers) {
        toast.error("This username is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      // Create a simple flat object with primitive values only - no nested objects or arrays
      const metadata = {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        full_name: fullName,
        username: username.trim()
      };
      
      console.log("Sending metadata:", metadata);

      // Create the user in the auth system with metadata
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verification=true`,
          data: metadata
        }
      });
      
      if (error) throw error;
      console.log("Auth signup successful:", data);
      
      if (data.user) {
        // User successfully created
        toast.success("Registration successful! Please check your email for verification.");
        form.reset();
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Display friendly error message based on error type
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please try logging in instead.");
      } else if (error.message.includes("Password")) {
        toast.error(error.message || "Password doesn't meet the requirements.");
      } else {
        toast.error(error.message || "Error during sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
        <NameFields control={form.control} />
        <UsernameField control={form.control} />
        <EmailField control={form.control} />
        <PasswordFields control={form.control} />
        <Button 
          type="submit" 
          className="w-full bg-sport-blue hover:bg-sport-blue/90"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};
