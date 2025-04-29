
-- Add banner_url column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND column_name = 'banner_url') THEN
    ALTER TABLE public.users ADD COLUMN banner_url TEXT;
  END IF;
END $$;

-- Create banners storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to enable public read access to banners
CREATE POLICY IF NOT EXISTS "Allow public read access to banners"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banners');

-- Create policy to enable authenticated users to upload banners
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Create policy to enable users to update their own banners
CREATE POLICY IF NOT EXISTS "Allow users to update their own banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to enable users to delete their own banners
CREATE POLICY IF NOT EXISTS "Allow users to delete their own banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
