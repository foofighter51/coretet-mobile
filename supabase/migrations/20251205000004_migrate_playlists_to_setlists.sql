-- Migration: Migrate Playlists to Set Lists with Version Support (MVP Feature 4)
-- Date: 2025-12-05
-- Purpose: Rename playlists → set_lists and enable version selection
-- Breaking: YES - Renames tables and changes foreign key references
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- IMPORTANT: This is a BREAKING migration
-- ============================================================
-- This migration will:
-- 1. Rename playlists → set_lists
-- 2. Rename playlist_items → set_list_entries
-- 3. Change set_list_entries to reference version_id instead of track_id
-- 4. Migrate existing data to use hero versions
-- 5. Update all related tables (playlist_followers, shared_playlists, etc.)

-- ============================================================
-- STEP 1: Rename playlists table to set_lists
-- ============================================================

-- Rename the table
ALTER TABLE playlists RENAME TO set_lists;

-- Rename the primary key constraint
ALTER INDEX playlists_pkey RENAME TO set_lists_pkey;

-- Rename existing indexes (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'playlists_created_by_idx') THEN
    ALTER INDEX playlists_created_by_idx RENAME TO set_lists_created_by_idx;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlists_band_id') THEN
    ALTER INDEX idx_playlists_band_id RENAME TO idx_set_lists_band_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlists_created_by') THEN
    ALTER INDEX idx_playlists_created_by RENAME TO idx_set_lists_created_by;
  END IF;
END $$;

-- Drop old RLS policies if they exist (we'll create new ones later)
DROP POLICY IF EXISTS "Users can view playlists they have access to" ON set_lists;
DROP POLICY IF EXISTS "Users can create playlists" ON set_lists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON set_lists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON set_lists;

-- ============================================================
-- STEP 2: Rename playlist_items to set_list_entries
-- ============================================================

-- Rename the table
ALTER TABLE playlist_items RENAME TO set_list_entries;

-- Rename the primary key constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'playlist_items_pkey') THEN
    ALTER INDEX playlist_items_pkey RENAME TO set_list_entries_pkey;
  END IF;
END $$;

-- Rename existing indexes (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_items_playlist_id') THEN
    ALTER INDEX idx_playlist_items_playlist_id RENAME TO idx_set_list_entries_set_list_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_items_track_id') THEN
    ALTER INDEX idx_playlist_items_track_id RENAME TO idx_set_list_entries_track_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_items_added_by') THEN
    ALTER INDEX idx_playlist_items_added_by RENAME TO idx_set_list_entries_added_by;
  END IF;
END $$;

-- Rename the foreign key column
ALTER TABLE set_list_entries RENAME COLUMN playlist_id TO set_list_id;

-- ============================================================
-- STEP 3: Add version_id to set_list_entries
-- ============================================================

-- Add version_id column (nullable for migration, will be required after)
ALTER TABLE set_list_entries
  ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES track_versions(id) ON DELETE CASCADE;

-- Create index on version_id
CREATE INDEX idx_set_list_entries_version_id ON set_list_entries(version_id);

-- ============================================================
-- STEP 4: Migrate existing data to use hero versions
-- ============================================================

-- For each set_list_entry, find the hero version of its track
UPDATE set_list_entries sle
SET version_id = tv.id
FROM track_versions tv
WHERE tv.track_id = sle.track_id
  AND tv.is_hero = true
  AND sle.version_id IS NULL;

-- Verify all entries have version_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM set_list_entries
  WHERE version_id IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING '⚠️  % set_list_entries do not have version_id. These tracks may not have versions yet.', null_count;
  ELSE
    RAISE NOTICE '✅ All set_list_entries successfully migrated to version_id';
  END IF;
END $$;

-- Make version_id NOT NULL (after migration)
-- Note: Keep track_id for backward compatibility queries
-- ALTER TABLE set_list_entries ALTER COLUMN version_id SET NOT NULL;

-- ============================================================
-- STEP 5: Update playlist_followers to use set_lists
-- ============================================================

-- Rename the foreign key column
ALTER TABLE playlist_followers RENAME COLUMN playlist_id TO set_list_id;

-- Rename the table for clarity
ALTER TABLE playlist_followers RENAME TO set_list_followers;

-- Rename the primary key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'playlist_followers_pkey') THEN
    ALTER INDEX playlist_followers_pkey RENAME TO set_list_followers_pkey;
  END IF;
END $$;

-- Rename indexes (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_followers_playlist_id') THEN
    ALTER INDEX idx_playlist_followers_playlist_id RENAME TO idx_set_list_followers_set_list_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_playlist_followers_user_id') THEN
    ALTER INDEX idx_playlist_followers_user_id RENAME TO idx_set_list_followers_user_id;
  END IF;
END $$;

-- Update foreign key constraint name (drop and recreate)
ALTER TABLE set_list_followers
  DROP CONSTRAINT IF EXISTS playlist_followers_playlist_id_fkey;

ALTER TABLE set_list_followers
  ADD CONSTRAINT set_list_followers_set_list_id_fkey
  FOREIGN KEY (set_list_id) REFERENCES set_lists(id) ON DELETE CASCADE;

-- Drop old RLS policies if they exist (we'll create new ones in STEP 8)
DROP POLICY IF EXISTS "Users can view playlist followers" ON set_list_followers;
DROP POLICY IF EXISTS "Users can follow playlists" ON set_list_followers;
DROP POLICY IF EXISTS "Users can unfollow playlists" ON set_list_followers;

-- ============================================================
-- STEP 6: Update shared_playlists to use set_lists
-- ============================================================

-- Rename the foreign key column
ALTER TABLE shared_playlists RENAME COLUMN playlist_id TO set_list_id;

-- Rename the table for consistency
ALTER TABLE shared_playlists RENAME TO shared_set_lists;

-- Rename the primary key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'shared_playlists_pkey') THEN
    ALTER INDEX shared_playlists_pkey RENAME TO shared_set_lists_pkey;
  END IF;
END $$;

-- Rename indexes (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shared_playlists_playlist_id') THEN
    ALTER INDEX idx_shared_playlists_playlist_id RENAME TO idx_shared_set_lists_set_list_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shared_playlists_share_token') THEN
    ALTER INDEX idx_shared_playlists_share_token RENAME TO idx_shared_set_lists_share_token;
  END IF;
END $$;

-- Update foreign key constraint
ALTER TABLE shared_set_lists
  DROP CONSTRAINT IF EXISTS shared_playlists_playlist_id_fkey;

ALTER TABLE shared_set_lists
  ADD CONSTRAINT shared_set_lists_set_list_id_fkey
  FOREIGN KEY (set_list_id) REFERENCES set_lists(id) ON DELETE CASCADE;

-- Drop old RLS policies if they exist
DROP POLICY IF EXISTS "Users can view shared playlists" ON shared_set_lists;
DROP POLICY IF EXISTS "Users can create shared playlists" ON shared_set_lists;

-- ============================================================
-- STEP 7: Update playlist_access_grants to use shared_set_lists
-- ============================================================

-- Rename the foreign key column
ALTER TABLE playlist_access_grants RENAME COLUMN shared_playlist_id TO shared_set_list_id;

-- Rename the table
ALTER TABLE playlist_access_grants RENAME TO set_list_access_grants;

-- Rename the primary key
ALTER INDEX playlist_access_grants_pkey RENAME TO set_list_access_grants_pkey;

-- Rename indexes
ALTER INDEX IF EXISTS idx_playlist_access_grants_shared_playlist_id RENAME TO idx_set_list_access_grants_shared_set_list_id;

-- Update foreign key constraint
ALTER TABLE set_list_access_grants
  DROP CONSTRAINT IF EXISTS playlist_access_grants_shared_playlist_id_fkey;

ALTER TABLE set_list_access_grants
  ADD CONSTRAINT set_list_access_grants_shared_set_list_id_fkey
  FOREIGN KEY (shared_set_list_id) REFERENCES shared_set_lists(id) ON DELETE CASCADE;

-- ============================================================
-- STEP 8: Update RLS policies for set_lists
-- ============================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view set lists they have access to" ON set_lists;
DROP POLICY IF EXISTS "Users can create set lists" ON set_lists;
DROP POLICY IF EXISTS "Users can update their own set lists" ON set_lists;
DROP POLICY IF EXISTS "Users can delete their own set lists" ON set_lists;

-- Create new policies with set_list naming
CREATE POLICY "Band members can view set lists"
  ON set_lists FOR SELECT
  USING (
    -- Set list creator
    created_by = auth.uid()
    -- OR member of set list's band
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = set_lists.band_id
        AND band_members.user_id = auth.uid()
    )
    -- OR set list is public and shared
    OR (is_public = true)
  );

CREATE POLICY "Band admins can create set lists"
  ON set_lists FOR INSERT
  WITH CHECK (
    -- Personal set list (no band)
    (band_id IS NULL AND created_by = auth.uid())
    -- OR band admin creating band set list
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = set_lists.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Band admins can update set lists"
  ON set_lists FOR UPDATE
  USING (
    -- Own set list
    created_by = auth.uid()
    -- OR band admin
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = set_lists.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Band admins can delete set lists"
  ON set_lists FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = set_lists.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- STEP 9: Update RLS policies for set_list_entries
-- ============================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view playlist items" ON set_list_entries;
DROP POLICY IF EXISTS "Users can add items to playlists" ON set_list_entries;
DROP POLICY IF EXISTS "Users can remove items from playlists" ON set_list_entries;
DROP POLICY IF EXISTS "Users can update playlist items" ON set_list_entries;

-- Create new policies
CREATE POLICY "Users can view set list entries"
  ON set_list_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM set_lists
      WHERE set_lists.id = set_list_entries.set_list_id
        AND (
          set_lists.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM band_members
            WHERE band_members.band_id = set_lists.band_id
              AND band_members.user_id = auth.uid()
          )
          OR set_lists.is_public = true
        )
    )
  );

CREATE POLICY "Band admins can manage set list entries"
  ON set_list_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM set_lists
      WHERE set_lists.id = set_list_entries.set_list_id
        AND (
          set_lists.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM band_members
            WHERE band_members.band_id = set_lists.band_id
              AND band_members.user_id = auth.uid()
              AND band_members.role IN ('owner', 'admin')
          )
        )
    )
  );

-- ============================================================
-- STEP 10: Create helper view for set lists with version info
-- ============================================================

CREATE OR REPLACE VIEW set_list_details AS
SELECT
  sl.id as set_list_id,
  sl.title as set_list_title,
  sl.description,
  sl.band_id,
  sl.created_by,
  sl.is_public,
  sle.id as entry_id,
  sle.position,
  t.id as track_id,
  t.title as track_title,
  tv.id as version_id,
  tv.version_number,
  tv.is_hero,
  tv.file_url,
  tv.duration_seconds
FROM set_lists sl
LEFT JOIN set_list_entries sle ON sle.set_list_id = sl.id
LEFT JOIN tracks t ON t.id = sle.track_id
LEFT JOIN track_versions tv ON tv.id = sle.version_id
ORDER BY sl.created_at DESC, sle.position ASC;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

DO $$
DECLARE
  set_list_count INTEGER;
  entry_count INTEGER;
  entries_with_versions INTEGER;
BEGIN
  SELECT COUNT(*) INTO set_list_count FROM set_lists;
  SELECT COUNT(*) INTO entry_count FROM set_list_entries;
  SELECT COUNT(*) INTO entries_with_versions FROM set_list_entries WHERE version_id IS NOT NULL;

  RAISE NOTICE '✅ Migration complete: playlists → set_lists';
  RAISE NOTICE '✅ Total set lists: %', set_list_count;
  RAISE NOTICE '✅ Total entries: %', entry_count;
  RAISE NOTICE '✅ Entries with versions: % / %', entries_with_versions, entry_count;

  IF entries_with_versions < entry_count THEN
    RAISE WARNING '⚠️  Some entries do not have version_id set';
  END IF;
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS (DO NOT RUN - for reference only)
-- ============================================================

-- To rollback this migration (COMPLEX - use with caution):
/*
BEGIN;

-- Drop the view
DROP VIEW IF EXISTS set_list_details;

-- Revert set_list_access_grants
ALTER TABLE set_list_access_grants RENAME TO playlist_access_grants;
ALTER TABLE playlist_access_grants RENAME COLUMN shared_set_list_id TO shared_playlist_id;

-- Revert shared_set_lists
ALTER TABLE shared_set_lists RENAME TO shared_playlists;
ALTER TABLE shared_playlists RENAME COLUMN set_list_id TO playlist_id;

-- Revert set_list_followers
ALTER TABLE set_list_followers RENAME TO playlist_followers;
ALTER TABLE playlist_followers RENAME COLUMN set_list_id TO playlist_id;

-- Revert set_list_entries
ALTER TABLE set_list_entries DROP COLUMN version_id;
ALTER TABLE set_list_entries RENAME TO playlist_items;
ALTER TABLE playlist_items RENAME COLUMN set_list_id TO playlist_id;

-- Revert set_lists
ALTER TABLE set_lists RENAME TO playlists;

COMMIT;
*/
