-- Migration: Reorganize audio files into user subfolders
-- This script moves tracks from audio/* to {userId}/* structure
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- Test on a few files first before running on all tracks!
--
-- How to use:
-- 1. Comment out the WHERE clause in Step 3 to test on a few tracks
-- 2. Verify those tracks still play in the app
-- 3. Uncomment WHERE clause to run on all tracks

-- Step 1: Preview what will be migrated
-- Run this first to see what files need moving
SELECT
  id,
  title,
  created_by,
  file_url,
  CASE
    WHEN file_url LIKE 'audio/%' THEN
      created_by || '/' || regexp_replace(file_url, '^audio/', '')
    ELSE
      file_url
  END as new_file_url
FROM tracks
WHERE file_url LIKE 'audio/%'
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Create a temporary function to move files in storage
-- This uses Supabase's storage API via SQL
CREATE OR REPLACE FUNCTION migrate_track_file(
  track_id UUID,
  old_path TEXT,
  new_path TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  bucket_name TEXT := 'audio-files';
  copy_result RECORD;
  delete_result RECORD;
BEGIN
  -- Copy file to new location
  SELECT * INTO copy_result
  FROM storage.copy(bucket_name, old_path, bucket_name, new_path);

  IF copy_result.id IS NULL THEN
    RAISE EXCEPTION 'Failed to copy file from % to %', old_path, new_path;
  END IF;

  -- Delete old file
  SELECT * INTO delete_result
  FROM storage.delete(bucket_name, ARRAY[old_path]);

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error migrating file for track %: %', track_id, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Run migration (TEST FIRST with LIMIT!)
-- IMPORTANT: Uncomment the LIMIT clause to test on just a few tracks first
DO $$
DECLARE
  track_record RECORD;
  old_path TEXT;
  new_path TEXT;
  migrated_count INTEGER := 0;
  failed_count INTEGER := 0;
  new_signed_url TEXT;
BEGIN
  -- Loop through tracks that need migration
  FOR track_record IN
    SELECT id, created_by, file_url
    FROM tracks
    WHERE file_url LIKE 'audio/%'
    -- LIMIT 5 -- UNCOMMENT THIS LINE TO TEST ON JUST 5 TRACKS FIRST!
    ORDER BY created_at DESC
  LOOP
    BEGIN
      -- Extract old path from file_url (remove any domain/signed URL parts)
      old_path := regexp_replace(track_record.file_url, '^.*/storage/v1/object/(public|sign)/audio-files/', '');
      old_path := regexp_replace(old_path, '\?.*$', ''); -- Remove query params

      -- Generate new path: {userId}/{filename}
      new_path := track_record.created_by || '/' || regexp_replace(old_path, '^audio/', '');

      RAISE NOTICE 'Migrating track %: % -> %', track_record.id, old_path, new_path;

      -- Move file in storage (copy + delete)
      IF migrate_track_file(track_record.id, old_path, new_path) THEN
        -- Update database with new path
        -- We'll update with just the path, getSignedUrl will be called when loading tracks
        UPDATE tracks
        SET file_url = new_path
        WHERE id = track_record.id;

        migrated_count := migrated_count + 1;
        RAISE NOTICE 'Successfully migrated track %', track_record.id;
      ELSE
        failed_count := failed_count + 1;
        RAISE WARNING 'Failed to migrate track %', track_record.id;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      RAISE WARNING 'Error processing track %: %', track_record.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Migration complete: % succeeded, % failed', migrated_count, failed_count;
END $$;

-- Step 4: Clean up temporary function
DROP FUNCTION IF EXISTS migrate_track_file(UUID, TEXT, TEXT);

-- Step 5: Verify migration results
SELECT
  COUNT(*) as total_tracks,
  COUNT(*) FILTER (WHERE file_url LIKE 'audio/%') as old_structure,
  COUNT(*) FILTER (WHERE file_url ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/') as new_structure
FROM tracks;

-- Step 6: List any tracks that still need migration
SELECT id, title, created_by, file_url
FROM tracks
WHERE file_url LIKE 'audio/%'
ORDER BY created_at DESC;
