-- Complete Schema Deployment for CoreTet
-- Run this in Supabase SQL Editor

-- 1. App Settings table (must come first)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Access Control table
CREATE TABLE IF NOT EXISTS user_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('blocked', 'waitlist', 'invited', 'active')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  waitlist_position INTEGER,
  waitlist_joined_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensembles table
CREATE TABLE IF NOT EXISTS ensembles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  authorized_phone_1 TEXT,
  authorized_phone_2 TEXT,
  authorized_phone_3 TEXT,
  authorized_phone_4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ensemble Members table
CREATE TABLE IF NOT EXISTS ensemble_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ensemble_id, user_id)
);

-- 6. Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  version_type TEXT DEFAULT 'practice',
  uploaded_by UUID REFERENCES auth.users(id),
  recording_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('listened', 'like', 'love')),
  playlist_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(version_id, user_id, playlist_id)
);

-- 9. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  playlist_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create Indexes for Performance
DO $$
BEGIN
  -- User access control indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_access_email') THEN
    CREATE INDEX idx_user_access_email ON user_access_control(email);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_access_level') THEN
    CREATE INDEX idx_user_access_level ON user_access_control(access_level);
  END IF;

  -- Ensemble indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_invite_code') THEN
    CREATE INDEX idx_ensemble_invite_code ON ensembles(invite_code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_created_by') THEN
    CREATE INDEX idx_ensemble_created_by ON ensembles(created_by);
  END IF;

  -- Member indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_members_ensemble') THEN
    CREATE INDEX idx_ensemble_members_ensemble ON ensemble_members(ensemble_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_members_user') THEN
    CREATE INDEX idx_ensemble_members_user ON ensemble_members(user_id);
  END IF;

  -- Song and version indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_songs_ensemble') THEN
    CREATE INDEX idx_songs_ensemble ON songs(ensemble_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_versions_song') THEN
    CREATE INDEX idx_versions_song ON versions(song_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_versions_uploaded_by') THEN
    CREATE INDEX idx_versions_uploaded_by ON versions(uploaded_by);
  END IF;

  -- Rating and comment indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ratings_version') THEN
    CREATE INDEX idx_ratings_version ON ratings(version_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ratings_user') THEN
    CREATE INDEX idx_ratings_user ON ratings(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_version') THEN
    CREATE INDEX idx_comments_version ON comments(version_id);
  END IF;
END $$;

-- 11. Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 12. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public read for access checking" ON user_access_control;
DROP POLICY IF EXISTS "System can insert new users" ON user_access_control;
DROP POLICY IF EXISTS "Public read app settings" ON app_settings;
DROP POLICY IF EXISTS "Users can view their ensembles" ON ensembles;
DROP POLICY IF EXISTS "Users can create ensembles" ON ensembles;
DROP POLICY IF EXISTS "Creators can update their ensembles" ON ensembles;
DROP POLICY IF EXISTS "Users can view ensemble members" ON ensemble_members;
DROP POLICY IF EXISTS "Users can join ensembles" ON ensemble_members;
DROP POLICY IF EXISTS "Ensemble members can view songs" ON songs;
DROP POLICY IF EXISTS "Ensemble members can create songs" ON songs;
DROP POLICY IF EXISTS "Ensemble members can view versions" ON versions;
DROP POLICY IF EXISTS "Ensemble members can upload versions" ON versions;
DROP POLICY IF EXISTS "Users can manage own ratings" ON ratings;
DROP POLICY IF EXISTS "Ensemble members can view comments" ON comments;
DROP POLICY IF EXISTS "Ensemble members can create comments" ON comments;

-- 13. Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User access control policies (public read for access checking)
CREATE POLICY "Public read for access checking" ON user_access_control FOR SELECT USING (true);
CREATE POLICY "System can insert new users" ON user_access_control FOR INSERT WITH CHECK (true);

-- App settings policies (read-only for users)
CREATE POLICY "Public read app settings" ON app_settings FOR SELECT USING (true);

-- Ensemble policies
CREATE POLICY "Users can view their ensembles" ON ensembles FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM ensemble_members WHERE ensemble_id = ensembles.id
  )
);
CREATE POLICY "Users can create ensembles" ON ensembles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update their ensembles" ON ensembles FOR UPDATE USING (auth.uid() = created_by);

-- Ensemble members policies
CREATE POLICY "Users can view ensemble members" ON ensemble_members FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT user_id FROM ensemble_members em WHERE em.ensemble_id = ensemble_members.ensemble_id)
);
CREATE POLICY "Users can join ensembles" ON ensemble_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Songs policies
CREATE POLICY "Ensemble members can view songs" ON songs FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM ensemble_members WHERE ensemble_id = songs.ensemble_id
  )
);
CREATE POLICY "Ensemble members can create songs" ON songs FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM ensemble_members WHERE ensemble_id = songs.ensemble_id
  )
);

-- Versions policies
CREATE POLICY "Ensemble members can view versions" ON versions FOR SELECT USING (
  auth.uid() IN (
    SELECT em.user_id FROM ensemble_members em
    JOIN songs s ON s.ensemble_id = em.ensemble_id
    WHERE s.id = versions.song_id
  )
);
CREATE POLICY "Ensemble members can upload versions" ON versions FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT em.user_id FROM ensemble_members em
    JOIN songs s ON s.ensemble_id = em.ensemble_id
    WHERE s.id = versions.song_id
  )
);

-- Ratings policies
CREATE POLICY "Users can manage own ratings" ON ratings FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Ensemble members can view comments" ON comments FOR SELECT USING (
  auth.uid() IN (
    SELECT em.user_id FROM ensemble_members em
    JOIN songs s ON s.ensemble_id = em.ensemble_id
    JOIN versions v ON v.song_id = s.id
    WHERE v.id = comments.version_id
  )
);
CREATE POLICY "Ensemble members can create comments" ON comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  auth.uid() IN (
    SELECT em.user_id FROM ensemble_members em
    JOIN songs s ON s.ensemble_id = em.ensemble_id
    JOIN versions v ON v.song_id = s.id
    WHERE v.id = comments.version_id
  )
);

-- 14. Insert Initial App Settings
INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('access_mode', '{"mode": "open_testing", "description": "Anyone can sign up"}'),
  ('beta_batch_size', '{"size": 50, "description": "Number of users invited per batch"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Deployment complete!
SELECT 'Complete schema deployment finished successfully!' as status;