
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { User, OnboardingSteps } from "@/types/supabase";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);
  
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.onboarding_completed === false) {
          // User needs to complete onboarding
          const { data: onboardingData, error: onboardingError } = await supabase
            .from('onboarding_steps')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (onboardingError && onboardingError.code !== 'PGRST116') {
            console.error("Error fetching onboarding data:", onboardingError);
            return;
          }
          
          const steps = onboardingData as OnboardingSteps | null;
          if (steps) {
            if (!steps.welcome_completed) {
              navigate('/onboarding/welcome');
            } else if (!steps.profile_completed) {
              navigate('/onboarding/profile');
            } else if (!steps.interests_completed) {
              navigate('/onboarding/interests');
            } else {
              navigate('/onboarding/complete');
            }
          } else {
            // No onboarding data found, start from beginning
            navigate('/onboarding/welcome');
          }
        }
        
        setCheckComplete(true);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setCheckComplete(true);
      }
    };
    
    if (!loading && user) {
      checkOnboarding();
    } else if (!loading) {
      setCheckComplete(true);
    }
  }, [user, loading, navigate]);
  
  // Show a loading state while checking onboarding status
  if (!checkComplete && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default OnboardingCheck;
