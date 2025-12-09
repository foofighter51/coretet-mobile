-- Migration: Create Track Listens System (MVP Feature 2: Listened Indicator)
-- Date: 2025-12-05
-- Purpose: Track when users listen to 80%+ of a track/version
-- Breaking: No - purely additive
-- Rollback: See rollback section at bottom

BEGIN;

-- ============================================================
-- STEP 1: Create track_listens table
-- ============================================================

CREATE TABLE IF NOT EXISTS track_listens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  version_id UUID REFERENCES track_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listened_at TIMESTAMPTZ DEFAULT now(),
  playback_percentage NUMERIC, -- Optional: track actual percentage reached
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Constraint: One listen record per user per version
  -- Users can "re-listen" by updating the timestamp
  UNIQUE(user_id, version_id)
);

-- Indexes for performance
CREATE INDEX idx_track_listens_track_id ON track_listens(track_id);
CREATE INDEX idx_track_listens_version_id ON track_listens(version_id);
CREATE INDEX idx_track_listens_user_id ON track_listens(user_id);
CREATE INDEX idx_track_listens_track_user ON track_listens(track_id, user_id);

-- Composite index for common query: "Who has listened to this track?"
CREATE INDEX idx_track_listens_track_listened_at ON track_listens(track_id, listened_at DESC);

-- ============================================================
-- STEP 2: Create helper function to record a listen
-- ============================================================

-- This function can be called from the application or from a trigger
CREATE OR REPLACE FUNCTION record_track_listen(
  p_track_id UUID,
  p_version_id UUID,
  p_user_id UUID,
  p_playback_percentage NUMERIC DEFAULT 100
)
RETURNS UUID AS $$
DECLARE
  listen_id UUID;
BEGIN
  -- Upsert: If user already listened to this version, update timestamp
  INSERT INTO track_listens (track_id, version_id, user_id, playback_percentage, listened_at)
  VALUES (p_track_id, p_version_id, p_user_id, p_playback_percentage, now())
  ON CONFLICT (user_id, version_id)
  DO UPDATE SET
    listened_at = now(),
    playback_percentage = EXCLUDED.playback_percentage
  RETURNING id INTO listen_id;

  RETURN listen_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 3: Create view for listen statistics
-- ============================================================

-- Useful for queries like "show me who listened to this track"
CREATE OR REPLACE VIEW track_listen_stats AS
SELECT
  t.id as track_id,
  t.title as track_title,
  tv.id as version_id,
  tv.version_number,
  COUNT(DISTINCT tl.user_id) as listener_count,
  ARRAY_AGG(DISTINCT tl.user_id) FILTER (WHERE tl.user_id IS NOT NULL) as listener_ids,
  MAX(tl.listened_at) as most_recent_listen
FROM tracks t
LEFT JOIN track_versions tv ON tv.track_id = t.id
LEFT JOIN track_listens tl ON tl.version_id = tv.id
GROUP BY t.id, t.title, tv.id, tv.version_number;

-- ============================================================
-- STEP 4: Enable Row Level Security
-- ============================================================

ALTER TABLE track_listens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view listen records for tracks they have access to
CREATE POLICY "Users can view listens for accessible tracks"
  ON track_listens FOR SELECT
  USING (
    -- Can view if they can view the parent track
    EXISTS (
      SELECT 1 FROM tracks
      WHERE tracks.id = track_listens.track_id
        AND (
          -- Track creator can see all listens
          tracks.created_by = auth.uid()
          -- OR member of track's band can see all listens
          OR EXISTS (
            SELECT 1 FROM band_members
            WHERE band_members.band_id = tracks.band_id
              AND band_members.user_id = auth.uid()
          )
          -- OR it's the user's own listen record
          OR track_listens.user_id = auth.uid()
        )
    )
  );

-- Policy: Users can record their own listens
CREATE POLICY "Users can record their own listens"
  ON track_listens FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      -- Can only listen to tracks they have access to
      SELECT 1 FROM tracks
      WHERE tracks.id = track_listens.track_id
        AND (
          tracks.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM band_members
            WHERE band_members.band_id = tracks.band_id
              AND band_members.user_id = auth.uid()
          )
        )
    )
  );

-- Policy: Users can update their own listens (re-listening)
CREATE POLICY "Users can update their own listens"
  ON track_listens FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own listens
CREATE POLICY "Users can delete their own listens"
  ON track_listens FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- STEP 5: Grant access to the helper function
-- ============================================================

-- Allow authenticated users to call the record_track_listen function
GRANT EXECUTE ON FUNCTION record_track_listen(UUID, UUID, UUID, NUMERIC) TO authenticated;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ track_listens table created successfully';
  RAISE NOTICE '✅ Helper function record_track_listen() available';
  RAISE NOTICE '✅ View track_listen_stats created';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage from app:';
  RAISE NOTICE '  await supabase.rpc(''record_track_listen'', {';
  RAISE NOTICE '    p_track_id: trackId,';
  RAISE NOTICE '    p_version_id: versionId,';
  RAISE NOTICE '    p_user_id: userId,';
  RAISE NOTICE '    p_playback_percentage: 85';
  RAISE NOTICE '  });';
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS (DO NOT RUN - for reference only)
-- ============================================================

-- To rollback this migration:
/*
BEGIN;
DROP VIEW IF EXISTS track_listen_stats;
DROP FUNCTION IF EXISTS record_track_listen(UUID, UUID, UUID, NUMERIC);
DROP TABLE IF EXISTS track_listens;
COMMIT;
*/
