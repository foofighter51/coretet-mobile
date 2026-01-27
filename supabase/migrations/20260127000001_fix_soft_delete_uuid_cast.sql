-- Migration: Fix soft delete functions to properly cast TEXT parameters to UUID
-- The version_groups.id, tracks.id, and set_lists.id columns are UUID,
-- but the RPC functions receive TEXT parameters

-- Fix soft_delete_track function
CREATE OR REPLACE FUNCTION soft_delete_track(
  p_track_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_track_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix restore_track function
CREATE OR REPLACE FUNCTION restore_track(
  p_track_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_track_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix soft_delete_version_group function
CREATE OR REPLACE FUNCTION soft_delete_version_group(
  p_group_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Soft delete the group
  UPDATE version_groups
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_group_id::uuid;

  -- Also soft delete all tracks in the group
  UPDATE tracks
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE version_group_id = p_group_id::uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix restore_version_group function
CREATE OR REPLACE FUNCTION restore_version_group(
  p_group_id TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Restore the group
  UPDATE version_groups
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_group_id::uuid;

  -- Also restore all tracks that were deleted with the group
  UPDATE tracks
  SET deleted_at = NULL, deleted_by = NULL
  WHERE version_group_id = p_group_id::uuid AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix soft_delete_set_list function
CREATE OR REPLACE FUNCTION soft_delete_set_list(
  p_set_list_id TEXT,
  p_deleted_by TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE set_lists
  SET deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_set_list_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix restore_set_list function
CREATE OR REPLACE FUNCTION restore_set_list(
  p_set_list_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE set_lists
  SET deleted_at = NULL, deleted_by = NULL
  WHERE id = p_set_list_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
