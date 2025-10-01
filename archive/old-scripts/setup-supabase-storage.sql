-- Setup Supabase Storage for Audio Files
-- Run this in Supabase SQL Editor

-- 1. Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  false, -- Private bucket, access controlled by RLS
  52428800, -- 50MB file size limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create storage policies for audio files bucket
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view audio files they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND
  auth.role() = 'authenticated'
);

-- Allow users to view audio files from ensembles they're members of
CREATE POLICY "Users can view audio files they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-files' AND
  auth.role() = 'authenticated' AND
  (
    -- User uploaded the file
    owner = auth.uid() OR
    -- File belongs to a version in an ensemble the user is a member of
    EXISTS (
      SELECT 1 FROM versions v
      JOIN songs s ON v.song_id = s.id
      JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
      WHERE v.file_url LIKE '%' || storage.objects.name || '%'
      AND em.user_id = auth.uid()
    )
  )
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-files' AND
  auth.uid() = owner
);

-- 3. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Setup complete!
SELECT 'Supabase storage setup completed successfully!' as status;