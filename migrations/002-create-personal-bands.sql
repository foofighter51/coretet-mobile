-- Migration: Create personal bands for all users
-- Date: 2025-11-03
-- Purpose: Eliminate band_id = null, ensure every user has a Personal band

BEGIN;

-- Step 1: Create personal bands for users without one
-- This creates a "Personal" band for any user who doesn't already have one
INSERT INTO bands (name, created_by, is_personal)
SELECT
  'Personal' as name,
  id as created_by,
  true as is_personal
FROM profiles
WHERE id NOT IN (
  SELECT created_by FROM bands WHERE is_personal = true
);

-- Step 2: Add band_members entries for personal band owners
-- Ensures each user is marked as 'owner' of their personal band
INSERT INTO band_members (band_id, user_id, role)
SELECT
  b.id as band_id,
  b.created_by as user_id,
  'owner' as role
FROM bands b
WHERE b.is_personal = true
  AND NOT EXISTS (
    SELECT 1 FROM band_members bm
    WHERE bm.band_id = b.id AND bm.user_id = b.created_by
  );

-- Step 3: Move tracks with null band_id to personal bands
-- This is the critical step - migrates all "personal" tracks to the Personal band
UPDATE tracks t
SET band_id = (
  SELECT b.id
  FROM bands b
  WHERE b.created_by = t.created_by
    AND b.is_personal = true
  LIMIT 1
)
WHERE t.band_id IS NULL;

-- Step 4: Do the same for playlists with null band_id
UPDATE playlists p
SET band_id = (
  SELECT b.id
  FROM bands b
  WHERE b.created_by = p.created_by
    AND b.is_personal = true
  LIMIT 1
)
WHERE p.band_id IS NULL;

-- Step 5: Verify migration success
DO $$
DECLARE
  null_track_count INTEGER;
  null_playlist_count INTEGER;
  total_personal_bands INTEGER;
  total_users INTEGER;
BEGIN
  -- Count remaining nulls
  SELECT COUNT(*) INTO null_track_count FROM tracks WHERE band_id IS NULL;
  SELECT COUNT(*) INTO null_playlist_count FROM playlists WHERE band_id IS NULL;

  -- Count personal bands vs users
  SELECT COUNT(*) INTO total_personal_bands FROM bands WHERE is_personal = true;
  SELECT COUNT(*) INTO total_users FROM profiles;

  -- Validate
  IF null_track_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % tracks still have null band_id', null_track_count;
  END IF;

  IF null_playlist_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % playlists still have null band_id', null_playlist_count;
  END IF;

  RAISE NOTICE 'Migration successful!';
  RAISE NOTICE '  - Total users: %', total_users;
  RAISE NOTICE '  - Personal bands created: %', total_personal_bands;
  RAISE NOTICE '  - Tracks with null band_id: %', null_track_count;
  RAISE NOTICE '  - Playlists with null band_id: %', null_playlist_count;
END $$;

COMMIT;
