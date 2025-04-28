
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseQuery } from "./useSupabaseQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { OnboardingSteps, OnboardingStep } from "@/types/onboarding";
import { toast } from "sonner";

export function useOnboardingSteps() {
  const { user } = useAuth();
  
  return useSupabaseQuery<OnboardingSteps>(
    ['onboarding', 'steps', user?.id],
    async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("onboarding_steps")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error) throw error;
      return data as OnboardingSteps;
    },
    {
      enabled: !!user
    }
  );
}

export function useUpdateOnboardingStep() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ step }: { step: OnboardingStep }) => {
      if (!user) throw new Error("User not authenticated");
      
      const stepField = `${step}_completed`;
      
      // Update the specific step
      const { error: stepError } = await supabase
        .from("onboarding_steps")
        .update({ [stepField]: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
        
      if (stepError) throw stepError;

      // If this is the final step, mark onboarding as complete in users table
      if (step === 'interests') {
        const { error: userError } = await supabase
          .from("users")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
          
        if (userError) throw userError;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'steps', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating onboarding step: ${error.message}`);
    }
  });
}

export function useOnboardingNavigation() {
  const navigate = useNavigate();
  const { data: onboardingSteps, isLoading } = useOnboardingSteps();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  useEffect(() => {
    if (onboardingSteps && !isLoading) {
      if (!onboardingSteps.welcome_completed) {
        setCurrentStep('welcome');
      } else if (!onboardingSteps.profile_completed) {
        setCurrentStep('profile');
      } else if (!onboardingSteps.interests_completed) {
        setCurrentStep('interests');
      } else {
        setCurrentStep('complete');
      }
    }
  }, [onboardingSteps, isLoading]);
  
  const navigateToNextStep = () => {
    switch(currentStep) {
      case 'welcome':
        navigate('/onboarding/profile');
        break;
      case 'profile':
        navigate('/onboarding/interests');
        break;
      case 'interests':
        navigate('/onboarding/complete');
        break;
      case 'complete':
        navigate('/home');
        break;
      default:
        navigate('/onboarding/welcome');
    }
  };
  
  return {
    currentStep,
    setCurrentStep,
    navigateToNextStep,
    isLoading
  };
}
