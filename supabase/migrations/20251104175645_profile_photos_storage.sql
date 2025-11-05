-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
END $$;

-- Storage policies for profile-photos bucket
-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
