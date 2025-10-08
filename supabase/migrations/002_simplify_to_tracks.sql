-- Migration: Simplify songs/versions to single tracks table
--
-- This migration removes the unnecessary complexity of separating
-- "songs" (concept) from "versions" (recordings). For an MVP focused
-- on uploading and sharing audio files, we just need "tracks".
--
-- This is a FRESH START migration that drops everything and recreates
-- with the simplified schema.

-- ============================================
-- PART 1: Drop ALL existing tables
-- ============================================

DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS playlist_items CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS versions CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS band_members CASCADE;
DROP TABLE IF EXISTS bands CASCADE;
DROP TABLE IF EXISTS ensemble_members CASCADE;
DROP TABLE IF EXISTS ensembles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS version_type CASCADE;
DROP TYPE IF EXISTS rating_type CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS get_band_member_count(UUID);
DROP FUNCTION IF EXISTS public.clerk_user_id();


-- ============================================
-- PART 2: Create simplified schema
-- ============================================

-- PROFILES: TEXT id for Clerk user IDs
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  phone_number TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- TRACKS: Single table for all audio files
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tracks_created_by ON tracks(created_by);


-- PLAYLISTS: Public by default with share codes
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  share_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'base64'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlists_created_by ON playlists(created_by);
CREATE INDEX idx_playlists_share_code ON playlists(share_code);


-- PLAYLIST_ITEMS: Links tracks to playlists
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_by TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, track_id),
  UNIQUE(playlist_id, position)
);

CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_track_id ON playlist_items(track_id);


-- RATINGS: Simple like/love system
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(track_id, user_id)
);

CREATE INDEX idx_ratings_track_id ON ratings(track_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);


-- COMMENTS: Track feedback with timestamps
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);


-- FILE_UPLOADS: Track upload status
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);


-- ============================================
-- PART 3: Wide-open RLS policies for MVP
-- ============================================
-- Note: These are intentionally permissive for MVP
-- We trust Clerk auth and will tighten later

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can create profiles"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update profiles"
  ON profiles FOR UPDATE
  TO authenticated, anon
  USING (true);


-- TRACKS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks"
  ON tracks FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can upload tracks"
  ON tracks FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update tracks"
  ON tracks FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete tracks"
  ON tracks FOR DELETE
  TO authenticated, anon
  USING (true);


-- PLAYLISTS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlists"
  ON playlists FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can create playlists"
  ON playlists FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update playlists"
  ON playlists FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete playlists"
  ON playlists FOR DELETE
  TO authenticated, anon
  USING (true);


-- PLAYLIST_ITEMS
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlist items"
  ON playlist_items FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can add items to playlists"
  ON playlist_items FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update playlist items"
  ON playlist_items FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete playlist items"
  ON playlist_items FOR DELETE
  TO authenticated, anon
  USING (true);


-- RATINGS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can rate"
  ON ratings FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update ratings"
  ON ratings FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete ratings"
  ON ratings FOR DELETE
  TO authenticated, anon
  USING (true);


-- COMMENTS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can comment"
  ON comments FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  TO authenticated, anon
  USING (true);


-- FILE_UPLOADS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view uploads"
  ON file_uploads FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can create uploads"
  ON file_uploads FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update uploads"
  ON file_uploads FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can delete uploads"
  ON file_uploads FOR DELETE
  TO authenticated, anon
  USING (true);
