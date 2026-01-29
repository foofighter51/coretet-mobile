-- Migration: Works-Centric Architecture Schema
-- Date: 2026-01-27
-- Purpose: Add Work-level comments, ratings, and waveform caching for Frame.io-style UX
-- Breaking: No (additive tables)

BEGIN;

-- =============================================================================
-- 1. Work-Level Comments Table
-- =============================================================================
-- Comments at the Work level, optionally tied to a specific track version
-- and/or a timestamp within the audio

CREATE TABLE work_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_group_id UUID REFERENCES version_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  -- Optional: tie comment to a specific version within the work
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  -- Timestamp in seconds (millisecond precision for accurate seeking)
  timestamp_seconds DECIMAL(10,3),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_work_comments_version_group ON work_comments(version_group_id);
CREATE INDEX idx_work_comments_track ON work_comments(track_id);
CREATE INDEX idx_work_comments_timestamp ON work_comments(timestamp_seconds) WHERE timestamp_seconds IS NOT NULL;
CREATE INDEX idx_work_comments_user ON work_comments(user_id);

-- RLS Policies
ALTER TABLE work_comments ENABLE ROW LEVEL SECURITY;

-- Band members can view comments on Works in their bands
CREATE POLICY "Band members can view work comments"
  ON work_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      JOIN version_groups vg ON vg.band_id = bm.band_id
      WHERE vg.id = work_comments.version_group_id
      AND bm.user_id = auth.uid()
    )
  );

-- Users can insert their own comments
CREATE POLICY "Users can insert work comments"
  ON work_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own work comments"
  ON work_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own work comments"
  ON work_comments FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- 2. Work-Level Ratings Table
-- =============================================================================
-- Ratings at the Work level for clear personal/collaborator/cumulative views

CREATE TABLE work_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_group_id UUID REFERENCES version_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating TEXT CHECK (rating IN ('liked', 'loved')) NOT NULL,
  -- Optional: rate a specific version within the work
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- One rating per user per work (or per user per track if track_id specified)
  UNIQUE(version_group_id, user_id, track_id)
);

-- Indexes
CREATE INDEX idx_work_ratings_version_group ON work_ratings(version_group_id);
CREATE INDEX idx_work_ratings_user ON work_ratings(user_id);
CREATE INDEX idx_work_ratings_track ON work_ratings(track_id) WHERE track_id IS NOT NULL;

-- RLS Policies
ALTER TABLE work_ratings ENABLE ROW LEVEL SECURITY;

-- Band members can view ratings on Works in their bands
CREATE POLICY "Band members can view work ratings"
  ON work_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      JOIN version_groups vg ON vg.band_id = bm.band_id
      WHERE vg.id = work_ratings.version_group_id
      AND bm.user_id = auth.uid()
    )
  );

-- Users can insert their own ratings
CREATE POLICY "Users can insert work ratings"
  ON work_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own ratings
CREATE POLICY "Users can update own work ratings"
  ON work_ratings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Users can delete own work ratings"
  ON work_ratings FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- 3. Waveform Cache Table
-- =============================================================================
-- Pre-computed waveform data for faster loading (avoid re-decoding audio)

CREATE TABLE track_waveforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Array of normalized amplitude values (0-1)
  waveform_data JSONB NOT NULL,
  -- Number of samples in waveform_data array
  sample_count INTEGER NOT NULL,
  -- Duration of the track in seconds
  duration_seconds DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for track lookup
CREATE INDEX idx_track_waveforms_track ON track_waveforms(track_id);

-- RLS Policies
ALTER TABLE track_waveforms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view waveforms (they're just visual data)
CREATE POLICY "Authenticated users can view waveforms"
  ON track_waveforms FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Anyone authenticated can insert waveforms (client-side caching)
CREATE POLICY "Authenticated users can insert waveforms"
  ON track_waveforms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- 4. Work Comment Views (for unread indicators)
-- =============================================================================
-- Track when users last viewed comments on a Work

CREATE TABLE work_comment_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_group_id UUID REFERENCES version_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(version_group_id, user_id)
);

-- Index
CREATE INDEX idx_work_comment_views_version_group ON work_comment_views(version_group_id);
CREATE INDEX idx_work_comment_views_user ON work_comment_views(user_id);

-- RLS Policies
ALTER TABLE work_comment_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comment views"
  ON work_comment_views FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own comment views"
  ON work_comment_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comment views"
  ON work_comment_views FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- 5. Comments
-- =============================================================================

COMMENT ON TABLE work_comments IS 'Comments on Works (version_groups), optionally with timestamps for audio position linking';
COMMENT ON COLUMN work_comments.timestamp_seconds IS 'Timestamp in seconds where comment was made (null for general comments)';
COMMENT ON COLUMN work_comments.track_id IS 'Optional reference to specific track version being commented on';

COMMENT ON TABLE work_ratings IS 'Ratings on Works with clear personal/collaborator distinction';
COMMENT ON COLUMN work_ratings.track_id IS 'Optional reference to rate a specific version within the work';

COMMENT ON TABLE track_waveforms IS 'Cached waveform data for audio visualization';
COMMENT ON COLUMN track_waveforms.waveform_data IS 'JSON array of normalized amplitude values (0-1)';

COMMENT ON TABLE work_comment_views IS 'Tracks when users last viewed comments to show unread indicators';

COMMIT;
