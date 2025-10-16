-- Migration: Add comment views tracking
-- Tracks when users view comments on tracks to show "unread" indicators

-- Ensure clerk_user_id function exists (idempotent)
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS comment_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Index for fast lookups
CREATE INDEX idx_comment_views_user_track ON comment_views(user_id, track_id);
CREATE INDEX idx_comment_views_track ON comment_views(track_id);

-- Enable RLS
ALTER TABLE comment_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own comment view records
CREATE POLICY "Users can view their own comment views"
  ON comment_views FOR SELECT
  USING (user_id::text = public.clerk_user_id());

-- Users can insert their own comment view records
CREATE POLICY "Users can insert their own comment views"
  ON comment_views FOR INSERT
  WITH CHECK (user_id::text = public.clerk_user_id());

-- Users can update their own comment view records
CREATE POLICY "Users can update their own comment views"
  ON comment_views FOR UPDATE
  USING (user_id::text = public.clerk_user_id());
