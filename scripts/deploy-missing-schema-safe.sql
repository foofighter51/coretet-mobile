-- Deploy Missing Schema Components (Safe Version)
-- Run this in Supabase SQL Editor

-- 1. Ensembles table
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

-- 2. Ensemble Members table
CREATE TABLE IF NOT EXISTS ensemble_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ensemble_id, user_id)
);

-- 3. Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Versions table
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

-- 5. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER,
  playlist_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Indexes for Performance (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_invite_code') THEN
    CREATE INDEX idx_ensemble_invite_code ON ensembles(invite_code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_created_by') THEN
    CREATE INDEX idx_ensemble_created_by ON ensembles(created_by);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_members_ensemble') THEN
    CREATE INDEX idx_ensemble_members_ensemble ON ensemble_members(ensemble_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ensemble_members_user') THEN
    CREATE INDEX idx_ensemble_members_user ON ensemble_members(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_songs_ensemble') THEN
    CREATE INDEX idx_songs_ensemble ON songs(ensemble_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_versions_song') THEN
    CREATE INDEX idx_versions_song ON versions(song_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_versions_uploaded_by') THEN
    CREATE INDEX idx_versions_uploaded_by ON versions(uploaded_by);
  END IF;

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

-- 7. Enable Row Level Security
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies (Drop existing ones first to avoid conflicts)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their ensembles" ON ensembles;
DROP POLICY IF EXISTS "Users can create ensembles" ON ensembles;
DROP POLICY IF EXISTS "Creators can update their ensembles" ON ensembles;
DROP POLICY IF EXISTS "Users can view ensemble members" ON ensemble_members;
DROP POLICY IF EXISTS "Users can join ensembles" ON ensemble_members;
DROP POLICY IF EXISTS "Ensemble members can view songs" ON songs;
DROP POLICY IF EXISTS "Ensemble members can create songs" ON songs;
DROP POLICY IF EXISTS "Ensemble members can view versions" ON versions;
DROP POLICY IF EXISTS "Ensemble members can upload versions" ON versions;
DROP POLICY IF EXISTS "Ensemble members can view comments" ON comments;
DROP POLICY IF EXISTS "Ensemble members can create comments" ON comments;

-- Create fresh policies
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

-- 9. Insert Initial App Settings (if not exists)
INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('access_mode', '{"mode": "open_testing", "description": "Anyone can sign up"}'),
  ('beta_batch_size', '{"size": 50, "description": "Number of users invited per batch"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Deployment complete!
SELECT 'Schema deployment completed successfully!' as status;