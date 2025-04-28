
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useUpdateOnboardingStep } from "@/hooks/useOnboarding";
import { useAuth } from "@/context/AuthProvider";

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: updateStep } = useUpdateOnboardingStep();
  
  const handleContinue = () => {
    updateStep({ step: 'welcome' }, {
      onSuccess: () => navigate('/onboarding/profile')
    });
  };

  return (
    <OnboardingLayout 
      title="Welcome to The7Connect!"
      subtitle="We'll help you set up your profile in just a few steps"
      currentStep="welcome"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-primary/10 p-8">
          <div className="w-24 h-24 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16.2 3.8a2.7 2.7 0 0 0-3.81 0l-.4.38-.4-.4a2.7 2.7 0 0 0-3.82 0C6.73 4.85 6.67 6.64 8 8l4 4 4-4c1.33-1.36 1.27-3.15.2-4.2z"></path>
              <path d="M8 8c-1.36 1.33-3.15 1.27-4.2.2a2.7 2.7 0 0 1 0-3.81l.4-.4"></path>
              <path d="M12 12v3"></path>
              <path d="M12 17.5c0 1.5-2 3-2 3"></path>
              <path d="M12 17.5c0 1.5 2 3 2 3"></path>
              <path d="M14 13h-4"></path>
            </svg>
          </div>
        </div>
        
        <div className="space-y-4 text-center max-w-md">
          <h2 className="text-xl font-semibold">Connect with Athletes, Coaches, and Sports Enthusiasts</h2>
          <p className="text-muted-foreground">
            The7Connect is your community for sharing sports achievements, connecting with like-minded individuals, and growing your network.
          </p>
          
          <div className="pt-6">
            <Button onClick={handleContinue} size="lg" className="w-full">
              Let's Get Started
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Welcome;
