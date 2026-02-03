-- Enhanced Editing Fields Migration
-- Adds new editable fields to tracks and version_groups for songwriters

-- Add version_notes to tracks (what changed in this version)
-- Example: "Added bass track", "New guitar solo", "Fixed timing on chorus"
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS version_notes TEXT;

-- Add composition_date to tracks (when the song was written, separate from upload date)
-- This helps songwriters track the creative timeline of their songs
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS composition_date DATE;

-- Add description to version_groups (Works) for project context/notes
-- Example: "Our first single", "Written during summer tour", "Collaboration with John"
ALTER TABLE version_groups ADD COLUMN IF NOT EXISTS description TEXT;

-- Note: set_lists.description already exists in the schema, no change needed

-- Add indexes for any fields that might be used for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_tracks_composition_date ON tracks(composition_date) WHERE composition_date IS NOT NULL;

-- Update the tracks table comment for documentation
COMMENT ON COLUMN tracks.version_notes IS 'Notes about what changed in this version (e.g., "Added bass track")';
COMMENT ON COLUMN tracks.composition_date IS 'When the song/version was written (distinct from upload date)';
COMMENT ON COLUMN version_groups.description IS 'Project notes or context for this Work/song';
