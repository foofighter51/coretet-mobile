-- Migration: Add soft delete support for recycle bin functionality
-- This enables a 30-day recycle bin for deleted items

-- Add soft delete columns to tracks table
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

-- Add soft delete columns to version_groups (Works) table
ALTER TABLE version_groups
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

-- Add soft delete columns to set_lists table
ALTER TABLE set_lists
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;

-- Create index for efficient querying of non-deleted items
CREATE INDEX IF NOT EXISTS idx_tracks_deleted_at ON tracks(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_version_groups_deleted_at ON version_groups(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_set_lists_deleted_at ON set_lists(deleted_at) WHERE deleted_at IS NULL;

-- Create index for querying deleted items (for recycle bin view)
CREATE INDEX IF NOT EXISTS idx_tracks_deleted ON tracks(band_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_version_groups_deleted ON version_groups(band_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_set_lists_deleted ON set_lists(band_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- Function to soft delete a track
CREATE OR REPLACE FUNCTION soft_delete_track(
  p_track_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a track from recycle bin
CREATE OR REPLACE FUNCTION restore_track(
  p_track_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a version group (Work)
CREATE OR REPLACE FUNCTION soft_delete_version_group(
  p_group_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Soft delete the group
  UPDATE version_groups
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_group_id;

  -- Also soft delete all tracks in the group
  UPDATE tracks
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE version_group_id = p_group_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a version group (Work) from recycle bin
CREATE OR REPLACE FUNCTION restore_version_group(
  p_group_id TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Restore the group
  UPDATE version_groups
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_group_id;

  -- Also restore all tracks that were deleted with the group
  -- (tracks deleted at same time or after the group was deleted)
  UPDATE tracks
  SET deleted_at = NULL, deleted_by = NULL
  WHERE version_group_id = p_group_id AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a set list
CREATE OR REPLACE FUNCTION soft_delete_set_list(
  p_set_list_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE set_lists
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_set_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a set list from recycle bin
CREATE OR REPLACE FUNCTION restore_set_list(
  p_set_list_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE set_lists
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_set_list_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete items older than 30 days
-- This should be called by a scheduled job (e.g., pg_cron or external scheduler)
CREATE OR REPLACE FUNCTION cleanup_recycle_bin()
RETURNS TABLE(
  deleted_tracks INT,
  deleted_groups INT,
  deleted_set_lists INT
) AS $$
DECLARE
  v_deleted_tracks INT;
  v_deleted_groups INT;
  v_deleted_set_lists INT;
BEGIN
  -- Delete tracks older than 30 days
  WITH deleted AS (
    DELETE FROM tracks
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_tracks FROM deleted;

  -- Delete version groups older than 30 days
  WITH deleted AS (
    DELETE FROM version_groups
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_groups FROM deleted;

  -- Delete set lists older than 30 days
  WITH deleted AS (
    DELETE FROM set_lists
    WHERE deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_deleted_set_lists FROM deleted;

  RETURN QUERY SELECT v_deleted_tracks, v_deleted_groups, v_deleted_set_lists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for recycle bin items
-- Note: deleted_by is TEXT, profiles.id is UUID, so we cast for the join
CREATE OR REPLACE VIEW recycle_bin_items AS
SELECT
  'track' as item_type,
  t.id,
  t.title as name,
  t.deleted_at,
  t.deleted_by,
  t.band_id,
  p.name as deleted_by_name,
  t.deleted_at + INTERVAL '30 days' as expires_at
FROM tracks t
LEFT JOIN profiles p ON t.deleted_by::uuid = p.id
WHERE t.deleted_at IS NOT NULL

UNION ALL

SELECT
  'work' as item_type,
  vg.id,
  vg.name,
  vg.deleted_at,
  vg.deleted_by,
  vg.band_id,
  p.name as deleted_by_name,
  vg.deleted_at + INTERVAL '30 days' as expires_at
FROM version_groups vg
LEFT JOIN profiles p ON vg.deleted_by::uuid = p.id
WHERE vg.deleted_at IS NOT NULL

UNION ALL

SELECT
  'set_list' as item_type,
  sl.id,
  sl.title as name,
  sl.deleted_at,
  sl.deleted_by,
  sl.band_id,
  p.name as deleted_by_name,
  sl.deleted_at + INTERVAL '30 days' as expires_at
FROM set_lists sl
LEFT JOIN profiles p ON sl.deleted_by::uuid = p.id
WHERE sl.deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION soft_delete_track(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_track(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_version_group(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_version_group(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_set_list(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_set_list(TEXT) TO authenticated;

-- Note: cleanup_recycle_bin should only be called by a scheduled job/service role
-- GRANT EXECUTE ON FUNCTION cleanup_recycle_bin() TO service_role;

COMMENT ON FUNCTION soft_delete_track IS 'Moves a track to the recycle bin (soft delete)';
COMMENT ON FUNCTION restore_track IS 'Restores a track from the recycle bin';
COMMENT ON FUNCTION soft_delete_version_group IS 'Moves a work and its tracks to the recycle bin';
COMMENT ON FUNCTION restore_version_group IS 'Restores a work and its tracks from the recycle bin';
COMMENT ON FUNCTION cleanup_recycle_bin IS 'Permanently deletes items that have been in recycle bin for 30+ days';
COMMENT ON VIEW recycle_bin_items IS 'View showing all items currently in the recycle bin';
