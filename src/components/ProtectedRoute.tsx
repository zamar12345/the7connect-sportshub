
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  const handleResendVerification = async () => {
    try {
      if (!user?.email) return;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verification=true`,
        },
      });
      
      if (error) throw error;
      
      toast.success("Verification email resent. Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Error resending verification email");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if email is verified
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your email has not been verified. Please check your inbox for the verification email.
            </AlertDescription>
          </Alert>
          <Button onClick={handleResendVerification} className="w-full">
            Resend Verification Email
          </Button>
          <Button 
            variant="outline" 
            onClick={() => supabase.auth.signOut()}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
