
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset === "true") {
      setIsResetMode(true);
      const recoveryToken = searchParams.get("token");
      if (recoveryToken) {
        setOtp(recoveryToken);
      }
    }
  }, [searchParams]);

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
      subtitle="Sign in or create an account to get started"
    >
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
