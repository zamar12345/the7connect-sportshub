
import { ReactNode } from "react";
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { OnboardingStep } from "@/types/onboarding";

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentStep: OnboardingStep;
}

const STEP_PROGRESS = {
  'welcome': 25,
  'profile': 50,
  'interests': 75,
  'complete': 100,
};

const OnboardingLayout = ({ children, title, subtitle, currentStep }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-center">
        <Logo className="h-4" />
      </div>
      
      <div className="px-4 py-6">
        <Progress value={STEP_PROGRESS[currentStep]} className="h-2" />
        <div className="text-right text-xs text-muted-foreground mt-1">
          Step {Object.keys(STEP_PROGRESS).indexOf(currentStep) + 1} of 4
        </div>
      </div>
      
      <div className="flex-1 flex flex-col px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground mb-6">{subtitle}</p>}
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
