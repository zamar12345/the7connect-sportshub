
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import { SocialLoginButtons } from "./SocialLoginButtons";

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const resetForm = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: ""
    }
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Starting sign in process...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Sign in successful, user data:", data);
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "Error during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (values: z.infer<typeof passwordResetSchema>) => {
    try {
      await resetPassword(values.email);
      setResetDialogOpen(false);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Error sending reset instructions");
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Mail className="text-muted-foreground w-5 h-5" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="text-muted-foreground w-5 h-5" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="text-right">
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 text-sport-blue">
                Forgot password?
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
                <DialogDescription>
                  Enter your email and we'll send you instructions to reset your password.
                </DialogDescription>
              </DialogHeader>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handlePasswordResetRequest)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Send Reset Instructions</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-sport-green hover:bg-sport-green/90"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      
      <SocialLoginButtons />
    </form>
  );
};
