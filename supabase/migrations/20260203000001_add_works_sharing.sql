-- Migration: Add sharing capabilities to Works (version_groups)
-- Date: 2026-02-03
-- Purpose: Allow Works to be shared publicly like Set Lists
-- Breaking: No - purely additive
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- STEP 1: Add sharing columns to version_groups
-- ============================================================

-- Add share_code column (unique identifier for public URL)
-- Using substring of UUID since gen_random_bytes requires pgcrypto extension
ALTER TABLE version_groups
  ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE DEFAULT substring(replace(gen_random_uuid()::text, '-', ''), 1, 12);

-- Add is_public column (controls whether work is publicly accessible)
ALTER TABLE version_groups
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Index for share_code lookups
CREATE INDEX IF NOT EXISTS idx_version_groups_share_code ON version_groups(share_code);

-- ============================================================
-- STEP 2: Generate share codes for existing works
-- ============================================================

-- Ensure all existing works have a share code
UPDATE version_groups
SET share_code = substring(replace(gen_random_uuid()::text, '-', ''), 1, 12)
WHERE share_code IS NULL;

-- ============================================================
-- STEP 3: Update RLS policies for public access
-- ============================================================

-- Drop and recreate the SELECT policy to allow public access
DROP POLICY IF EXISTS "Users can view version groups for their bands" ON version_groups;

CREATE POLICY "Users can view version groups"
  ON version_groups FOR SELECT
  USING (
    -- Public works are viewable by anyone
    is_public = true
    -- Band members can view their band's works
    OR band_id IS NULL
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = version_groups.band_id
      AND band_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 4: Allow public access to tracks in public works
-- ============================================================

-- Note: The existing tracks RLS allows band members to view tracks.
-- We need to add a policy for public access to tracks in public works.
-- First, check if this policy already exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public can view tracks in public works'
    AND tablename = 'tracks'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view tracks in public works"
      ON tracks FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM version_groups vg
          WHERE vg.id = tracks.version_group_id
          AND vg.is_public = true
        )
      )';
  END IF;
END $$;

-- ============================================================
-- STEP 5: Allow public access to comments on tracks in public works
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public can view comments on public works'
    AND tablename = 'comments'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view comments on public works"
      ON comments FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM tracks t
          JOIN version_groups vg ON vg.id = t.version_group_id
          WHERE t.id = comments.track_id
          AND vg.is_public = true
        )
      )';
  END IF;
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration:
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Public can view comments on public works" ON comments;
-- DROP POLICY IF EXISTS "Public can view tracks in public works" ON tracks;
-- DROP POLICY IF EXISTS "Users can view version groups" ON version_groups;
-- CREATE POLICY "Users can view version groups for their bands"
--   ON version_groups FOR SELECT
--   USING (
--     band_id IS NULL
--     OR EXISTS (
--       SELECT 1 FROM band_members
--       WHERE band_members.band_id = version_groups.band_id
--       AND band_members.user_id = auth.uid()
--     )
--   );
-- DROP INDEX IF EXISTS idx_version_groups_share_code;
-- ALTER TABLE version_groups DROP COLUMN IF EXISTS is_public;
-- ALTER TABLE version_groups DROP COLUMN IF EXISTS share_code;
-- COMMIT;
