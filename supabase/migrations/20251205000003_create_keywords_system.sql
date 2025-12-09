-- Migration: Create Keywords System (MVP Feature 3: Keywords)
-- Date: 2025-12-05
-- Purpose: Enable freeform keyword tagging for track organization
-- Breaking: No - purely additive
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- STEP 1: Create keywords table
-- ============================================================

CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT, -- Optional: for UI customization (hex color)
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_keywords_band_id ON keywords(band_id);
CREATE INDEX IF NOT EXISTS idx_keywords_created_by ON keywords(created_by);

-- Unique index for case-insensitive keyword names per band
CREATE UNIQUE INDEX IF NOT EXISTS idx_keywords_band_name_lower ON keywords(band_id, LOWER(name));

-- ============================================================
-- STEP 2: Create track_keywords junction table
-- ============================================================

CREATE TABLE IF NOT EXISTS track_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),

  -- Constraint: Each keyword can only be applied once per track
  UNIQUE(track_id, keyword_id)
);

-- Indexes for performance
CREATE INDEX idx_track_keywords_track_id ON track_keywords(track_id);
CREATE INDEX idx_track_keywords_keyword_id ON track_keywords(keyword_id);
CREATE INDEX idx_track_keywords_added_by ON track_keywords(added_by);

-- Composite index for filtering: "Show me all tracks with keyword X"
CREATE INDEX idx_track_keywords_keyword_track ON track_keywords(keyword_id, track_id);

-- ============================================================
-- STEP 3: Create helper functions
-- ============================================================

-- Function: Get or create keyword by name (case-insensitive)
CREATE OR REPLACE FUNCTION get_or_create_keyword(
  p_band_id UUID,
  p_name TEXT,
  p_created_by UUID,
  p_color TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  keyword_id UUID;
BEGIN
  -- Try to find existing keyword (case-insensitive)
  SELECT id INTO keyword_id
  FROM keywords
  WHERE band_id = p_band_id
    AND LOWER(name) = LOWER(p_name);

  -- If not found, create it
  IF keyword_id IS NULL THEN
    INSERT INTO keywords (band_id, name, color, created_by)
    VALUES (p_band_id, p_name, p_color, p_created_by)
    RETURNING id INTO keyword_id;
  END IF;

  RETURN keyword_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Add keyword to track
CREATE OR REPLACE FUNCTION add_keyword_to_track(
  p_track_id UUID,
  p_keyword_id UUID,
  p_added_by UUID
)
RETURNS UUID AS $$
DECLARE
  track_keyword_id UUID;
BEGIN
  -- Add keyword to track (ignore if already exists)
  INSERT INTO track_keywords (track_id, keyword_id, added_by)
  VALUES (p_track_id, p_keyword_id, p_added_by)
  ON CONFLICT (track_id, keyword_id) DO NOTHING
  RETURNING id INTO track_keyword_id;

  RETURN track_keyword_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 4: Create view for keyword statistics
-- ============================================================

-- Useful for UI: "Show keywords with usage counts"
CREATE OR REPLACE VIEW keyword_stats AS
SELECT
  k.id as keyword_id,
  k.band_id,
  k.name as keyword_name,
  k.color,
  COUNT(tk.track_id) as track_count,
  ARRAY_AGG(tk.track_id) FILTER (WHERE tk.track_id IS NOT NULL) as track_ids,
  k.created_at
FROM keywords k
LEFT JOIN track_keywords tk ON tk.keyword_id = k.id
GROUP BY k.id, k.band_id, k.name, k.color, k.created_at
ORDER BY track_count DESC, k.name ASC;

-- ============================================================
-- STEP 5: Create updated_at trigger for keywords
-- ============================================================

CREATE OR REPLACE FUNCTION update_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_keywords_updated_at();

-- ============================================================
-- STEP 6: Enable Row Level Security
-- ============================================================

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_keywords ENABLE ROW LEVEL SECURITY;

-- Keywords Policies

-- Policy: Band members can view keywords
CREATE POLICY "Band members can view keywords"
  ON keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = keywords.band_id
        AND band_members.user_id = auth.uid()
    )
  );

-- Policy: Band admins can create keywords
CREATE POLICY "Band admins can create keywords"
  ON keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = keywords.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Band admins can update keywords
CREATE POLICY "Band admins can update keywords"
  ON keywords FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = keywords.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Band admins can delete keywords
CREATE POLICY "Band admins can delete keywords"
  ON keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = keywords.band_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Track Keywords Policies

-- Policy: Band members can view track keywords
CREATE POLICY "Band members can view track keywords"
  ON track_keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_keywords.track_id
        AND band_members.user_id = auth.uid()
    )
  );

-- Policy: Band admins can add keywords to tracks
CREATE POLICY "Band admins can add keywords to tracks"
  ON track_keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_keywords.track_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Band admins can remove keywords from tracks
CREATE POLICY "Band admins can remove keywords from tracks"
  ON track_keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tracks
      JOIN band_members ON band_members.band_id = tracks.band_id
      WHERE tracks.id = track_keywords.track_id
        AND band_members.user_id = auth.uid()
        AND band_members.role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- STEP 7: Grant access to helper functions
-- ============================================================

GRANT EXECUTE ON FUNCTION get_or_create_keyword(UUID, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_keyword_to_track(UUID, UUID, UUID) TO authenticated;

-- ============================================================
-- STEP 8: Create suggested keywords for new bands
-- ============================================================

-- Onboarding helper: Common keyword suggestions
-- Bands can use these or create their own

COMMENT ON TABLE keywords IS 'Freeform keywords for organizing tracks. Suggested starters: Upbeat, Ballad, Instrumental, Needs vocals, Needs mixing, Cover, Original, Jam-friendly, Short, Encore';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ keywords table created successfully';
  RAISE NOTICE '✅ track_keywords junction table created';
  RAISE NOTICE '✅ Helper functions available: get_or_create_keyword(), add_keyword_to_track()';
  RAISE NOTICE '✅ View keyword_stats created';
  RAISE NOTICE '';
  RAISE NOTICE 'Suggested keywords for onboarding:';
  RAISE NOTICE '  - Upbeat, Ballad, Instrumental';
  RAISE NOTICE '  - Needs vocals, Needs mixing';
  RAISE NOTICE '  - Cover, Original';
  RAISE NOTICE '  - Jam-friendly, Short, Encore';
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS (DO NOT RUN - for reference only)
-- ============================================================

-- To rollback this migration:
/*
BEGIN;
DROP VIEW IF EXISTS keyword_stats;
DROP FUNCTION IF EXISTS add_keyword_to_track(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS get_or_create_keyword(UUID, TEXT, UUID, TEXT);
DROP TRIGGER IF EXISTS keywords_updated_at ON keywords;
DROP FUNCTION IF EXISTS update_keywords_updated_at();
DROP TABLE IF EXISTS track_keywords;
DROP TABLE IF EXISTS keywords;
COMMIT;
*/
