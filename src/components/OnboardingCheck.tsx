
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
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
          const { data: onboardingData } = await supabase
            .from('onboarding_steps')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (onboardingData) {
            if (!onboardingData.welcome_completed) {
              navigate('/onboarding/welcome');
            } else if (!onboardingData.profile_completed) {
              navigate('/onboarding/profile');
            } else if (!onboardingData.interests_completed) {
              navigate('/onboarding/interests');
            } else {
              navigate('/onboarding/complete');
            }
          } else {
            navigate('/onboarding/welcome');
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    
    if (!loading && user) {
      checkOnboarding();
    }
  }, [user, loading, navigate]);
  
  return <>{children}</>;
};

export default OnboardingCheck;
