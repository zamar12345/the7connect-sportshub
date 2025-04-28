
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";

export const SocialLoginButtons = () => {
  const handleSocialLogin = async (provider: 'github' | 'twitter' | 'facebook' | 'instagram') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Error signing in with ${provider}: ${error.message}`);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('github')}
        >
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('twitter')}
        >
          <Twitter className="mr-2 h-4 w-4" /> Twitter
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('facebook')}
        >
          <Facebook className="mr-2 h-4 w-4" /> Facebook
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('instagram')}
        >
          <Instagram className="mr-2 h-4 w-4" /> Instagram
        </Button>
      </div>
    </>
  );
};
