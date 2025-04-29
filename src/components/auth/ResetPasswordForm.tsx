
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";

const passwordUpdateSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

interface ResetPasswordFormProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  setEmail: (email: string) => void;
}

export const ResetPasswordForm = ({ email, otp, setEmail, setOtp }: ResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const { verifyOtp, updatePassword } = useAuth();
  
  const form = useForm<z.infer<typeof passwordUpdateSchema>>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleSetNewPassword = async (values: z.infer<typeof passwordUpdateSchema>) => {
    setLoading(true);
    try {
      if (!email || !otp) {
        toast.error("Email and verification code are required");
        setLoading(false);
        return;
      }

      await verifyOtp(email, otp);
      await updatePassword(values.password);
      toast.success("Password has been reset successfully. Please sign in with your new password.");
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          id="reset-form-email"
          name="reset-form-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="reset-form-otp"
          name="reset-form-otp"
          type="text"
          placeholder="Verification Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSetNewPassword)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="reset-form-password"
                    name="reset-form-password"
                    type="password"
                    placeholder="New Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="reset-form-confirm-password"
                    name="reset-form-confirm-password"
                    type="password"
                    placeholder="Confirm New Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-sport-green hover:bg-sport-green/90"
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
