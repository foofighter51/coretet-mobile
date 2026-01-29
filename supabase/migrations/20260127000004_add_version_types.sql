-- Migration: Add version types to tracks
-- Allows categorizing track versions (riff, demo, studio, live, etc.)

-- Create version_types lookup table for band-specific custom types
CREATE TABLE version_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Default types have NULL band_id, custom types have band_id
  UNIQUE(band_id, name)
);

-- Insert default version types (band_id = NULL means global defaults)
INSERT INTO version_types (band_id, name, is_default, display_order) VALUES
  (NULL, 'riff', true, 1),
  (NULL, 'rough draft', true, 2),
  (NULL, 'melody', true, 3),
  (NULL, 'acoustic', true, 4),
  (NULL, 'demo', true, 5),
  (NULL, 'WIP', true, 6),
  (NULL, 'studio', true, 7),
  (NULL, 'live', true, 8),
  (NULL, 'remix', true, 9),
  (NULL, 'radio edit', true, 10);

-- Add version_type column to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS version_type TEXT;

-- Create index for faster lookups
CREATE INDEX idx_version_types_band ON version_types(band_id);
CREATE INDEX idx_tracks_version_type ON tracks(version_type);

-- RLS policies for version_types
ALTER TABLE version_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view default types (band_id IS NULL)
CREATE POLICY "Anyone can view default version types"
  ON version_types FOR SELECT
  USING (band_id IS NULL);

-- Band members can view their band's custom types
CREATE POLICY "Band members can view custom version types"
  ON version_types FOR SELECT
  USING (
    band_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = version_types.band_id
      AND bm.user_id = auth.uid()
    )
  );

-- Band members can create custom types for their band
CREATE POLICY "Band members can create custom version types"
  ON version_types FOR INSERT
  WITH CHECK (
    band_id IS NOT NULL AND
    is_default = false AND
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = version_types.band_id
      AND bm.user_id = auth.uid()
    )
  );

-- Band admins/owners can delete custom types
CREATE POLICY "Band admins can delete custom version types"
  ON version_types FOR DELETE
  USING (
    band_id IS NOT NULL AND
    is_default = false AND
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = version_types.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('admin', 'owner')
    )
  );
