-- Migration: Add Version Groups for Existing Tracks
-- Date: 2025-12-09
-- Purpose: Allow grouping existing tracks as versions without data loss
-- Breaking: No - purely additive
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- STEP 1: Create version_groups table
-- ============================================================

CREATE TABLE IF NOT EXISTS version_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Group name (e.g., "Steady As You Go")
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  hero_track_id UUID, -- References tracks(id) - the featured version
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_version_groups_band_id ON version_groups(band_id);
CREATE INDEX idx_version_groups_hero_track_id ON version_groups(hero_track_id);

-- ============================================================
-- STEP 2: Add version_group_id to tracks table
-- ============================================================

-- Optional column - NULL means track is standalone (not grouped)
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS version_group_id UUID REFERENCES version_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_tracks_version_group_id ON tracks(version_group_id);

-- ============================================================
-- STEP 3: Helper function to create version group
-- ============================================================

-- Function to group tracks together as versions
CREATE OR REPLACE FUNCTION create_version_group(
  p_name TEXT,
  p_band_id UUID,
  p_track_ids UUID[],
  p_hero_track_id UUID,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_track_id UUID;
BEGIN
  -- Validate hero track is in the list
  IF NOT (p_hero_track_id = ANY(p_track_ids)) THEN
    RAISE EXCEPTION 'Hero track must be one of the selected tracks';
  END IF;

  -- Create the version group
  INSERT INTO version_groups (name, band_id, hero_track_id, created_by)
  VALUES (p_name, p_band_id, p_hero_track_id, p_created_by)
  RETURNING id INTO v_group_id;

  -- Update all tracks to reference this group
  UPDATE tracks
  SET version_group_id = v_group_id
  WHERE id = ANY(p_track_ids);

  RETURN v_group_id;
END;
$$;

-- ============================================================
-- STEP 4: Helper function to ungroup tracks
-- ============================================================

CREATE OR REPLACE FUNCTION ungroup_tracks(p_group_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear version_group_id from all tracks in this group
  UPDATE tracks
  SET version_group_id = NULL
  WHERE version_group_id = p_group_id;

  -- Delete the group
  DELETE FROM version_groups WHERE id = p_group_id;
END;
$$;

-- ============================================================
-- STEP 5: Helper function to change hero
-- ============================================================

CREATE OR REPLACE FUNCTION set_hero_track(
  p_group_id UUID,
  p_hero_track_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate track is in this group
  IF NOT EXISTS (
    SELECT 1 FROM tracks
    WHERE id = p_hero_track_id
    AND version_group_id = p_group_id
  ) THEN
    RAISE EXCEPTION 'Track is not in this version group';
  END IF;

  -- Update the hero
  UPDATE version_groups
  SET hero_track_id = p_hero_track_id,
      updated_at = now()
  WHERE id = p_group_id;
END;
$$;

-- ============================================================
-- STEP 6: View for easy querying
-- ============================================================

CREATE OR REPLACE VIEW track_version_groups AS
SELECT
  vg.id as group_id,
  vg.name as group_name,
  vg.band_id,
  vg.hero_track_id,
  vg.created_at as group_created_at,
  t.id as track_id,
  t.title as track_title,
  t.file_url,
  t.duration_seconds,
  t.created_at as track_created_at,
  (t.id = vg.hero_track_id) as is_hero,
  COUNT(*) OVER (PARTITION BY vg.id) as version_count
FROM version_groups vg
JOIN tracks t ON t.version_group_id = vg.id
ORDER BY vg.id, is_hero DESC, t.created_at;

-- ============================================================
-- STEP 7: RLS Policies
-- ============================================================

-- Enable RLS
ALTER TABLE version_groups ENABLE ROW LEVEL SECURITY;

-- Users can view version groups for their bands
CREATE POLICY "Users can view version groups for their bands"
  ON version_groups FOR SELECT
  USING (
    band_id IS NULL -- Personal groups
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = version_groups.band_id
      AND band_members.user_id = auth.uid()
    )
  );

-- Band admins/owners can create version groups
CREATE POLICY "Band admins can create version groups"
  ON version_groups FOR INSERT
  WITH CHECK (
    band_id IS NULL -- Personal groups
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = version_groups.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('admin', 'owner')
    )
  );

-- Band admins/owners can update version groups
CREATE POLICY "Band admins can update version groups"
  ON version_groups FOR UPDATE
  USING (
    band_id IS NULL
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = version_groups.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('admin', 'owner')
    )
  );

-- Band admins/owners can delete version groups
CREATE POLICY "Band admins can delete version groups"
  ON version_groups FOR DELETE
  USING (
    band_id IS NULL
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = version_groups.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('admin', 'owner')
    )
  );

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration:
--
-- BEGIN;
-- DROP VIEW IF EXISTS track_version_groups;
-- DROP FUNCTION IF EXISTS set_hero_track(UUID, UUID);
-- DROP FUNCTION IF EXISTS ungroup_tracks(UUID);
-- DROP FUNCTION IF EXISTS create_version_group(TEXT, UUID, UUID[], UUID, UUID);
-- ALTER TABLE tracks DROP COLUMN IF EXISTS version_group_id;
-- DROP TABLE IF EXISTS version_groups;
-- COMMIT;
