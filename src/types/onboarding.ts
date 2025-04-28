
export interface OnboardingSteps {
  id: string;
  user_id: string;
  welcome_completed: boolean;
  profile_completed: boolean;
  interests_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type OnboardingStep = 'welcome' | 'profile' | 'interests' | 'complete';
