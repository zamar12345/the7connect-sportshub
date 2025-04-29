
-- Create a trigger that will create onboarding steps AFTER the user profile is created
CREATE OR REPLACE FUNCTION public.create_onboarding_steps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.onboarding_steps (user_id, welcome_completed, profile_completed, interests_completed)
  VALUES (NEW.id, FALSE, FALSE, FALSE);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (to avoid duplicate triggers)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on the users table to ensure onboarding steps are created after user profile
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_onboarding_steps();

-- This ensures the onboarding_steps table only gets records after the user profile exists in the public.users table
