-- Migration: Setup storage bucket for audio files
--
-- Creates the audio-files bucket with appropriate RLS policies
-- for authenticated users to upload and access audio files

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  false, -- Private bucket, require signed URLs
  104857600, -- 100MB file size limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-files bucket
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view files in audio-files bucket
CREATE POLICY "Anyone can view audio files"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'audio-files');

-- Policy: Authenticated users can upload to audio-files bucket
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-files' AND auth.uid()::text = owner);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files' AND auth.uid()::text = owner);
