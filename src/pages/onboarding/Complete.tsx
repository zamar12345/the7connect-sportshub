
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/context/AuthProvider";

const Complete = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const handleFinish = () => {
    navigate('/home');
  };

  return (
    <OnboardingLayout 
      title="You're All Set!"
      subtitle="Your profile is now complete"
      currentStep="complete"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-green-500/10 p-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <div className="space-y-4 text-center max-w-md">
          <h2 className="text-xl font-semibold">Welcome to The7Connect, {profile?.full_name || profile?.username || 'Athlete'}!</h2>
          <p className="text-muted-foreground">
            Your profile is now set up and you're ready to start connecting with other sports enthusiasts. Explore posts, follow athletes, and share your own sports journey!
          </p>
          
          <div className="pt-6">
            <Button onClick={handleFinish} size="lg" className="w-full">
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Complete;
