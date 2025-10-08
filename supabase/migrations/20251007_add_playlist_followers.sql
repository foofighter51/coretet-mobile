-- Create playlist_followers table for following/subscribing to playlists
CREATE TABLE IF NOT EXISTS playlist_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only follow a playlist once
  UNIQUE(playlist_id, user_id)
);

-- Add index for faster lookups
CREATE INDEX idx_playlist_followers_user ON playlist_followers(user_id);
CREATE INDEX idx_playlist_followers_playlist ON playlist_followers(playlist_id);

-- Enable RLS
ALTER TABLE playlist_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlist_followers
-- Users can view their own follows
CREATE POLICY "Users can view their own follows"
  ON playlist_followers
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Users can follow any public playlist
CREATE POLICY "Users can follow public playlists"
  ON playlist_followers
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND playlists.is_public = TRUE
    )
  );

-- Users can unfollow playlists they follow
CREATE POLICY "Users can unfollow their follows"
  ON playlist_followers
  FOR DELETE
  USING (user_id = auth.uid()::text);
