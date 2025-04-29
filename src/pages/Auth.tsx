
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useAuth } from "@/context/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset === "true") {
      setIsResetMode(true);
      const recoveryToken = searchParams.get("token");
      if (recoveryToken) {
        setOtp(recoveryToken);
      }
    }
    
    // Check if this is a verification redirect
    const verification = searchParams.get("verification");
    if (verification === "true") {
      setVerificationSuccess(true);
    }
  }, [searchParams]);

  // Don't use early return with hooks - move inside the rendering section
  if (loading) {
    return (
      <AuthContainer 
        title="Loading"
        subtitle="Please wait..."
      >
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AuthContainer>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  if (isResetMode) {
    return (
      <AuthContainer 
        title="Reset Your Password"
        subtitle="Enter your email and the verification code to reset your password"
      >
        <ResetPasswordForm 
          email={email} 
          otp={otp}
          setEmail={setEmail}
          setOtp={setOtp}
        />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer 
      title="Welcome to The7Connect"
      subtitle="Where Talent Meets Opportunity."
    >
      {verificationSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Verification successful! Log in now to access your account.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <SignInForm />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </AuthContainer>
  );
};

export default Auth;
