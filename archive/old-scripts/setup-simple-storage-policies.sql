-- Simplified Supabase Storage Policies for Development
-- Run this in Supabase SQL Editor

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  false, -- Private bucket
  52428800, -- 50MB file size limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view audio files they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Simple authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Simple authenticated select" ON storage.objects;
DROP POLICY IF EXISTS "Simple authenticated delete" ON storage.objects;

-- 3. Create simplified policies for development
-- Allow authenticated users to upload to audio-files bucket
CREATE POLICY "Simple authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view files in audio-files bucket
CREATE POLICY "Simple authenticated select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-files' AND
  auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Simple authenticated delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-files' AND
  auth.uid() = owner
);

-- 4. Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Test that the setup works
SELECT 'Simplified storage policies created successfully!' as status;