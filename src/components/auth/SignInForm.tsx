
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailLoginForm } from "./EmailLoginForm";
import { UsernameLoginForm } from "./UsernameLoginForm";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useSignIn } from "./useSignIn";

export const SignInForm = () => {
  const {
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
  } = useSignIn();

  return (
    <div className="space-y-4">
      <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setLoginType(value as "email" | "username")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Sign in with Email</TabsTrigger>
          <TabsTrigger value="username">Sign in with Username</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <TabsContent value="email">
            <EmailLoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          </TabsContent>
          
          <TabsContent value="username">
            <UsernameLoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
            />
          </TabsContent>
          
          <div className="text-right">
            <Button 
              variant="link" 
              className="p-0 text-sport-blue"
              onClick={() => setResetDialogOpen(true)}
              type="button"
            >
              Forgot password?
            </Button>
            
            <PasswordResetDialog 
              open={resetDialogOpen} 
              onOpenChange={setResetDialogOpen} 
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-sport-green hover:bg-sport-green/90"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Tabs>
      
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
      
      <div>
        <SocialLoginButtons />
      </div>
    </div>
  );
};
