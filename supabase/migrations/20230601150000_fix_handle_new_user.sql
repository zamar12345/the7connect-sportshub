
-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now create the safest function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metadata jsonb DEFAULT '{}'::jsonb;
  username text;
  full_name text;
BEGIN
  -- Only cast if raw_user_meta_data is not null or empty
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data <> '' THEN
    BEGIN
      metadata := NEW.raw_user_meta_data::jsonb;
    EXCEPTION WHEN others THEN
      metadata := '{}'::jsonb; -- If it's invalid JSON, fall back to empty
    END;
  END IF;

  -- Generate username
  username := COALESCE(
    metadata->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || floor(random() * 1000)::text
  );

  -- Generate full name
  full_name := COALESCE(
    metadata->>'full_name',
    (COALESCE(metadata->>'first_name', '') || ' ' || COALESCE(metadata->>'last_name', ''))::text,
    'Unknown User'
  );

  -- Insert into your main users table
  INSERT INTO public.users (id, username, email, full_name)
  VALUES (
    NEW.id,
    username,
    NEW.email,
    full_name
  );

  RETURN NEW;
END;
$$;

-- Now recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
