-- CoreTet Database Schema
-- Based on the project specification requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table (containers for versions)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Version types enum
CREATE TYPE version_type AS ENUM (
  'voice_memo',
  'rough_demo',
  'rehearsal',
  'working_mix',
  'final',
  'live',
  'other'
);

-- Versions table (individual audio files)
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id), -- nullable for standalone versions
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  version_type version_type DEFAULT 'other',
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  recording_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensembles/Bands table
CREATE TABLE ensembles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'base64'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensemble memberships
CREATE TABLE ensemble_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ensemble_id UUID REFERENCES ensembles(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ensemble_id, user_id)
);

-- Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  ensemble_id UUID REFERENCES ensembles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'base64'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist items (track ordering)
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) NOT NULL,
  version_id UUID REFERENCES versions(id) NOT NULL,
  position INTEGER NOT NULL,
  added_by UUID REFERENCES profiles(id) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, version_id),
  UNIQUE(playlist_id, position)
);

-- Rating types enum
CREATE TYPE rating_type AS ENUM ('listened', 'like', 'love');

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES versions(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  playlist_id UUID REFERENCES playlists(id), -- context for rating
  rating rating_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(version_id, user_id, playlist_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES versions(id) NOT NULL,
  playlist_id UUID REFERENCES playlists(id), -- context for comment
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER, -- position in track
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS authentication sessions for collaborators
CREATE TABLE sms_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  playlist_id UUID REFERENCES playlists(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads tracking
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  upload_status TEXT DEFAULT 'uploading',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_versions_song_id ON versions(song_id);
CREATE INDEX idx_versions_uploaded_by ON versions(uploaded_by);
CREATE INDEX idx_ensemble_members_user_id ON ensemble_members(user_id);
CREATE INDEX idx_ensemble_members_ensemble_id ON ensemble_members(ensemble_id);
CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_position ON playlist_items(playlist_id, position);
CREATE INDEX idx_ratings_version_id ON ratings(version_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_comments_version_id ON comments(version_id);
CREATE INDEX idx_comments_playlist_id ON comments(playlist_id);
CREATE INDEX idx_sms_sessions_phone ON sms_sessions(phone_number);
CREATE INDEX idx_sms_sessions_expires ON sms_sessions(expires_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Songs: Visible to ensemble members
CREATE POLICY "Songs visible to ensemble members" ON songs FOR SELECT
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM ensemble_members em
    JOIN versions v ON v.song_id = songs.id
    JOIN playlists p ON p.ensemble_id = em.ensemble_id
    WHERE em.user_id = auth.uid()
  )
);

-- Versions: Visible to ensemble members or if in accessible playlist
CREATE POLICY "Versions visible to authorized users" ON versions FOR SELECT
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM playlist_items pi
    JOIN playlists p ON p.id = pi.playlist_id
    LEFT JOIN ensemble_members em ON em.ensemble_id = p.ensemble_id
    WHERE pi.version_id = versions.id
    AND (em.user_id = auth.uid() OR p.is_public = true)
  )
);

-- Ensemble members: Can see members of ensembles they belong to
CREATE POLICY "Ensemble members visible to members" ON ensemble_members FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM ensemble_members em2
    WHERE em2.ensemble_id = ensemble_members.ensemble_id
    AND em2.user_id = auth.uid()
  )
);

-- Playlists: Visible to ensemble members or public
CREATE POLICY "Playlists visible to authorized users" ON playlists FOR SELECT
USING (
  created_by = auth.uid()
  OR is_public = true
  OR EXISTS (
    SELECT 1 FROM ensemble_members em
    WHERE em.ensemble_id = playlists.ensemble_id
    AND em.user_id = auth.uid()
  )
);

-- Ratings: Users can read ratings on accessible versions, modify their own
CREATE POLICY "Ratings readable by authorized users" ON ratings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM versions v WHERE v.id = ratings.version_id
    -- Version visibility handled by versions policy
  )
);

CREATE POLICY "Users can manage own ratings" ON ratings FOR ALL
USING (user_id = auth.uid());

-- Comments: Similar to ratings
CREATE POLICY "Comments readable by authorized users" ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM versions v WHERE v.id = comments.version_id
    -- Version visibility handled by versions policy
  )
);

CREATE POLICY "Users can manage own comments" ON comments FOR ALL
USING (user_id = auth.uid());

-- File uploads: Users can only see their own uploads
CREATE POLICY "Users can manage own uploads" ON file_uploads FOR ALL
USING (user_id = auth.uid());

-- Functions for common operations

-- Function to get ensemble members count
CREATE OR REPLACE FUNCTION get_ensemble_member_count(ensemble_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM ensemble_members
    WHERE ensemble_id = ensemble_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get version rating counts
CREATE OR REPLACE FUNCTION get_version_rating_counts(version_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'listened', COUNT(*) FILTER (WHERE rating = 'listened'),
      'like', COUNT(*) FILTER (WHERE rating = 'like'),
      'love', COUNT(*) FILTER (WHERE rating = 'love'),
      'total', COUNT(*)
    )
    FROM ratings
    WHERE version_id = version_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ensembles_updated_at BEFORE UPDATE ON ensembles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();