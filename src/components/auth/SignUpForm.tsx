import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from "@/components/ui/form";
import { Mail, Lock, User } from "lucide-react";
import { SocialLoginButtons } from "./SocialLoginButtons";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const SignUpForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSignUp = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    console.log("Starting sign up process...");
    
    try {
      const fullName = `${values.firstName} ${values.lastName}`;
      let username = values.email.split('@')[0];
      
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
        // Generate a unique username if the email username already exists
        username = `${username}_${Math.floor(Math.random() * 1000)}`;
        console.log(`Username already exists, using ${username} instead`);
      }

      // Create the user in the auth system with metadata
      // With RLS properly configured, Supabase will automatically create the user profile
      // when the auth user is created due to our trigger
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verification=true`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            full_name: fullName,
            username: username,
            email: values.email
          }
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <User className="text-muted-foreground w-5 h-5" />
                    <FormControl>
                      <Input placeholder="First Name" id="signup-firstName" name="firstName" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Last Name" id="signup-lastName" name="lastName" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground w-5 h-5" />
                  <FormControl>
                    <Input type="email" placeholder="Email" id="signup-email" name="email" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Lock className="text-muted-foreground w-5 h-5" />
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)" 
                      id="signup-password"
                      name="password"
                      {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Lock className="text-muted-foreground w-5 h-5" />
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm Password" 
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-sport-blue hover:bg-sport-blue/90"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>
      
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <SocialLoginButtons />
      </div>
    </>
  );
};
