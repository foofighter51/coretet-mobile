-- Migration: Create Track Versions System (MVP Feature 1: Hero System)
-- Date: 2025-12-05
-- Purpose: Enable multiple versions per track with Hero designation
-- Breaking: No - existing tracks remain functional
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- STEP 1: Create track_versions table
-- ============================================================

CREATE TABLE IF NOT EXISTS track_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds NUMERIC,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_hero BOOLEAN DEFAULT false,
  notes TEXT, -- Optional: version notes/changelog
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(track_id, version_number),
  CHECK (version_number > 0)
);

-- Indexes for performance
CREATE INDEX idx_track_versions_track_id ON track_versions(track_id);
CREATE INDEX idx_track_versions_is_hero ON track_versions(track_id, is_hero) WHERE is_hero = true;
CREATE INDEX idx_track_versions_uploaded_by ON track_versions(uploaded_by);

-- ============================================================
-- STEP 2: Add hero_version_id to tracks table
-- ============================================================

-- Add column to reference the current "Hero" version
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS hero_version_id UUID REFERENCES track_versions(id) ON DELETE SET NULL;

CREATE INDEX idx_tracks_hero_version ON tracks(hero_version_id);

-- ============================================================
-- STEP 3: Migrate existing tracks to version 1
-- ============================================================

-- For each existing track, create a version 1 and set it as hero
-- This preserves all existing data while enabling the version system

INSERT INTO track_versions (track_id, version_number, file_url, file_size, duration_seconds, uploaded_at, uploaded_by, is_hero)
SELECT
  id as track_id,
  1 as version_number,
  file_url,
  file_size,
  duration_seconds,
  created_at as uploaded_at,
  created_by as uploaded_by,
  true as is_hero
FROM tracks
WHERE NOT EXISTS (
  -- Don't create duplicates if migration is re-run
  SELECT 1 FROM track_versions WHERE track_versions.track_id = tracks.id
);

-- Update tracks to reference their hero version
UPDATE tracks t
SET hero_version_id = v.id
FROM track_versions v
WHERE v.track_id = t.id
  AND v.is_hero = true
  AND t.hero_version_id IS NULL;

-- ============================================================
-- STEP 4: Create trigger to ensure only one hero per track
-- ============================================================

CREATE OR REPLACE FUNCTION ensure_single_hero_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_hero = true THEN
    -- Unset is_hero for all other versions of this track
    UPDATE track_versions
    SET is_hero = false
    WHERE track_id = NEW.track_id
      AND id != NEW.id
      AND is_hero = true;

    -- Update the track's hero_version_id
    UPDATE tracks
    SET hero_version_id = NEW.id
    WHERE id = NEW.track_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_versions_hero_trigger
  AFTER INSERT OR UPDATE OF is_hero ON track_versions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_hero_version();

-- ============================================================
-- STEP 5: Create updated_at trigger for track_versions
-- ============================================================

CREATE OR REPLACE FUNCTION update_track_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_versions_updated_at
  BEFORE UPDATE ON track_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_track_versions_updated_at();

-- ============================================================
-- STEP 6: Update storage triggers to work with versions
-- ============================================================

-- NOTE: Storage triggers from Nov 2024 migrations track file_size on tracks table
-- We need to update them to also track version uploads/deletes

-- Update storage on version insert
CREATE OR REPLACE FUNCTION update_storage_on_version_insert()
RETURNS TRIGGER AS $$
DECLARE
  track_band_id UUID;
  track_created_by UUID;
BEGIN
  -- Get the track's band_id and created_by
  SELECT band_id, created_by INTO track_band_id, track_created_by
  FROM tracks
  WHERE id = NEW.track_id;

  -- Update band storage if track belongs to band
  IF track_band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = track_band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = track_created_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER version_insert_storage_update
  AFTER INSERT ON track_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_version_insert();

-- Update storage on version delete
CREATE OR REPLACE FUNCTION update_storage_on_version_delete()
RETURNS TRIGGER AS $$
DECLARE
  track_band_id UUID;
  track_created_by UUID;
BEGIN
  -- Get the track's band_id and created_by
  SELECT band_id, created_by INTO track_band_id, track_created_by
  FROM tracks
  WHERE id = OLD.track_id;

  -- Update band storage if track belonged to band
  IF track_band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = track_band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = track_created_by;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER version_delete_storage_update
  AFTER DELETE ON track_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_version_delete();

-- ============================================================
-- STEP 7: Enable Row Level Security
-- ============================================================

ALTER TABLE track_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of tracks they can access
CREATE POLICY "Users can view track versions they have access to"
  ON track_versions FOR SELECT
  USING (
    -- Can view if they can view the parent track
    EXISTS (
      SELECT 1 FROM tracks
      WHERE tracks.id = track_versions.track_id
        AND (
          -- Track creator
          tracks.created_by = auth.uid()
          -- OR member of track's band
          OR EXISTS (
            SELECT 1 FROM band_members
            WHERE band_members.band_id = tracks.band_id
              AND band_members.user_id = auth.uid()
          )
        )
    )
  );

-- Policy: Band admins/owners can create versions
CREATE POLICY "Band admins can create track versions"
  ON track_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_versions.track_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Band admins/owners can update versions (including hero designation)
CREATE POLICY "Band admins can update track versions"
  ON track_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_versions.track_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Band admins/owners can delete versions
CREATE POLICY "Band admins can delete track versions"
  ON track_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_versions.track_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Count migrated versions
DO $$
DECLARE
  version_count INTEGER;
  track_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO version_count FROM track_versions;
  SELECT COUNT(*) INTO track_count FROM tracks;

  RAISE NOTICE '✅ Migration complete: % tracks migrated to % versions', track_count, version_count;

  IF version_count != track_count THEN
    RAISE WARNING '⚠️  Mismatch: % tracks but % versions', track_count, version_count;
  END IF;
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS (DO NOT RUN - for reference only)
-- ============================================================

-- To rollback this migration:
/*
BEGIN;
DROP TRIGGER IF EXISTS version_delete_storage_update ON track_versions;
DROP TRIGGER IF EXISTS version_insert_storage_update ON track_versions;
DROP TRIGGER IF EXISTS track_versions_updated_at ON track_versions;
DROP TRIGGER IF EXISTS track_versions_hero_trigger ON track_versions;
DROP FUNCTION IF EXISTS update_storage_on_version_delete();
DROP FUNCTION IF EXISTS update_storage_on_version_insert();
DROP FUNCTION IF EXISTS update_track_versions_updated_at();
DROP FUNCTION IF EXISTS ensure_single_hero_version();
ALTER TABLE tracks DROP COLUMN IF EXISTS hero_version_id;
DROP TABLE IF EXISTS track_versions;
COMMIT;
*/
