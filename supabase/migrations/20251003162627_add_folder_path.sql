-- Add folder_path column to tracks table for folder organization
ALTER TABLE tracks ADD COLUMN folder_path TEXT;

-- Create index for faster folder-based queries
CREATE INDEX idx_tracks_folder_path ON tracks(folder_path);
