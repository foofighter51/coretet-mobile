-- Migration: Create storage tracking triggers
-- Created: 2025-11-18
-- Purpose: Automatically update storage_used when tracks are added/deleted

BEGIN;

-- ============================================================
-- FUNCTION: Update storage on track insert
-- ============================================================

CREATE OR REPLACE FUNCTION update_storage_on_track_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belongs to band
  IF NEW.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = storage_used + COALESCE(NEW.file_size, 0)
    WHERE id = NEW.created_by;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS track_insert_storage_update ON tracks;

-- Create trigger
CREATE TRIGGER track_insert_storage_update
  AFTER INSERT ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_insert();

-- ============================================================
-- FUNCTION: Update storage on track delete
-- ============================================================

CREATE OR REPLACE FUNCTION update_storage_on_track_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update band storage if track belonged to band
  IF OLD.band_id IS NOT NULL THEN
    UPDATE bands
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = OLD.band_id;
  ELSE
    -- Update user's personal storage
    UPDATE profiles
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0))
    WHERE id = OLD.created_by;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS track_delete_storage_update ON tracks;

-- Create trigger
CREATE TRIGGER track_delete_storage_update
  AFTER DELETE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_delete();

-- ============================================================
-- FUNCTION: Update storage on track update (file_size change)
-- ============================================================

CREATE OR REPLACE FUNCTION update_storage_on_track_update()
RETURNS TRIGGER AS $$
DECLARE
  size_diff BIGINT;
BEGIN
  -- Only update if file_size changed
  IF OLD.file_size IS DISTINCT FROM NEW.file_size THEN
    size_diff := COALESCE(NEW.file_size, 0) - COALESCE(OLD.file_size, 0);

    -- Update band storage if track belongs to band
    IF NEW.band_id IS NOT NULL THEN
      UPDATE bands
      SET storage_used = GREATEST(0, storage_used + size_diff)
      WHERE id = NEW.band_id;
    ELSE
      -- Update user's personal storage
      UPDATE profiles
      SET storage_used = GREATEST(0, storage_used + size_diff)
      WHERE id = NEW.created_by;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS track_update_storage_update ON tracks;

-- Create trigger
CREATE TRIGGER track_update_storage_update
  AFTER UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_track_update();

COMMIT;

-- Verification: Test with a sample query
SELECT
  'Storage triggers created successfully' as status,
  COUNT(*) as trigger_count
FROM pg_trigger
WHERE tgname LIKE '%storage%';
