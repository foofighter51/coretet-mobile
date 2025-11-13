-- Migration: Clerk-compatible RLS + Rename ensembles to bands
-- This migration does two things:
-- 1. Renames all "ensemble" references to "bands"
-- 2. Updates RLS policies to work with Clerk authentication (not Supabase auth.uid())

-- PART 1: Rename ensembles to bands
-- ====================================

-- Rename the main table
ALTER TABLE IF EXISTS ensembles RENAME TO bands;

-- Rename the members table
ALTER TABLE IF EXISTS ensemble_members RENAME TO band_members;

-- Rename columns that reference ensemble
ALTER TABLE IF EXISTS band_members RENAME COLUMN ensemble_id TO band_id;
ALTER TABLE IF EXISTS playlists RENAME COLUMN ensemble_id TO band_id;

-- Rename indexes
ALTER INDEX IF EXISTS idx_ensemble_members_user_id RENAME TO idx_band_members_user_id;
ALTER INDEX IF EXISTS idx_ensemble_members_ensemble_id RENAME TO idx_band_members_band_id;

-- Rename foreign key constraints
-- Note: We'll need to drop and recreate these
ALTER TABLE band_members DROP CONSTRAINT IF EXISTS ensemble_members_ensemble_id_fkey;
ALTER TABLE band_members ADD CONSTRAINT band_members_band_id_fkey
  FOREIGN KEY (band_id) REFERENCES bands(id);

ALTER TABLE playlists DROP CONSTRAINT IF EXISTS playlists_ensemble_id_fkey;
ALTER TABLE playlists ADD CONSTRAINT playlists_band_id_fkey
  FOREIGN KEY (band_id) REFERENCES bands(id);

-- Rename unique constraint
ALTER TABLE band_members DROP CONSTRAINT IF EXISTS ensemble_members_ensemble_id_user_id_key;
ALTER TABLE band_members ADD CONSTRAINT band_members_band_id_user_id_key
  UNIQUE (band_id, user_id);

-- Update the function name
DROP FUNCTION IF EXISTS get_ensemble_member_count(UUID);
CREATE OR REPLACE FUNCTION get_band_member_count(band_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM band_members
    WHERE band_id = band_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PART 2: Enable RLS on all tables
-- ====================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;


-- PART 3: Drop ALL existing policies
-- ====================================

-- Drop all policies on all tables to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
    END LOOP;
END $$;


-- PART 4: Create Clerk-compatible RLS policies
-- =============================================
-- These policies use JWT claims to get Clerk user_id

-- Helper function to get Clerk user ID from JWT
-- Created in public schema since we don't have permission for auth schema
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- PROFILES POLICIES
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id::text = public.clerk_user_id());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id::text = public.clerk_user_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id::text = public.clerk_user_id());


-- SONGS POLICIES
-- Songs are visible to the creator and band members
CREATE POLICY "Songs visible to creator and band members"
  ON songs FOR SELECT
  USING (
    created_by::text = public.clerk_user_id()
    OR EXISTS (
      SELECT 1 FROM band_members bm
      JOIN versions v ON v.song_id = songs.id
      JOIN playlists p ON p.band_id = bm.band_id
      WHERE bm.user_id::text = public.clerk_user_id()
    )
  );

CREATE POLICY "Users can create songs"
  ON songs FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

CREATE POLICY "Creators can update their songs"
  ON songs FOR UPDATE
  USING (created_by::text = public.clerk_user_id());


-- VERSIONS POLICIES
-- Versions visible to uploader or band members
CREATE POLICY "Versions visible to authorized users"
  ON versions FOR SELECT
  USING (
    uploaded_by::text = public.clerk_user_id()
    OR EXISTS (
      SELECT 1 FROM playlist_items pi
      JOIN playlists p ON p.id = pi.playlist_id
      LEFT JOIN band_members bm ON bm.band_id = p.band_id
      WHERE pi.version_id = versions.id
      AND (bm.user_id::text = public.clerk_user_id() OR p.is_public = true)
    )
  );

CREATE POLICY "Users can upload versions"
  ON versions FOR INSERT
  WITH CHECK (uploaded_by::text = public.clerk_user_id());

CREATE POLICY "Uploaders can update their versions"
  ON versions FOR UPDATE
  USING (uploaded_by::text = public.clerk_user_id());


-- BANDS POLICIES
-- Users can view bands they're members of
CREATE POLICY "Users can view bands they belong to"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members WHERE user_id::text = public.clerk_user_id()
    )
  );

CREATE POLICY "Users can create bands"
  ON bands FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

CREATE POLICY "Band creators can update their bands"
  ON bands FOR UPDATE
  USING (created_by::text = public.clerk_user_id());


-- BAND MEMBERS POLICIES
-- Users can view members of bands they belong to
CREATE POLICY "Users can view members of their bands"
  ON band_members FOR SELECT
  USING (
    user_id::text = public.clerk_user_id()
    OR band_id IN (
      SELECT band_id FROM band_members WHERE user_id::text = public.clerk_user_id()
    )
  );

CREATE POLICY "Band creators can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT id FROM bands WHERE created_by::text = public.clerk_user_id()
    )
  );

CREATE POLICY "Users can leave bands (delete own membership)"
  ON band_members FOR DELETE
  USING (user_id::text = public.clerk_user_id());


-- PLAYLISTS POLICIES
-- Playlists visible to creator, band members, or if public
CREATE POLICY "Playlists visible to authorized users"
  ON playlists FOR SELECT
  USING (
    created_by::text = public.clerk_user_id()
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = playlists.band_id
      AND bm.user_id::text = public.clerk_user_id()
    )
  );

CREATE POLICY "Users can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

CREATE POLICY "Creators can update their playlists"
  ON playlists FOR UPDATE
  USING (created_by::text = public.clerk_user_id());


-- PLAYLIST ITEMS POLICIES
-- Can view items in accessible playlists
CREATE POLICY "Playlist items visible to authorized users"
  ON playlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists p
      WHERE p.id = playlist_items.playlist_id
      -- Playlist visibility handled by playlists policy
    )
  );

CREATE POLICY "Band members can add playlist items"
  ON playlist_items FOR INSERT
  WITH CHECK (
    playlist_id IN (
      SELECT p.id FROM playlists p
      LEFT JOIN band_members bm ON bm.band_id = p.band_id
      WHERE p.created_by::text = public.clerk_user_id()
      OR bm.user_id::text = public.clerk_user_id()
    )
  );


-- RATINGS POLICIES
-- Users can read ratings on accessible versions
CREATE POLICY "Ratings visible for accessible versions"
  ON ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM versions v
      WHERE v.id = ratings.version_id
      -- Version visibility handled by versions policy
    )
  );

CREATE POLICY "Users can manage their own ratings"
  ON ratings FOR INSERT
  WITH CHECK (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (user_id::text = public.clerk_user_id());


-- COMMENTS POLICIES
-- Similar to ratings
CREATE POLICY "Comments visible for accessible versions"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM versions v
      WHERE v.id = comments.version_id
      -- Version visibility handled by versions policy
    )
  );

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id::text = public.clerk_user_id());


-- FILE UPLOADS POLICIES
-- Users can only manage their own file uploads
CREATE POLICY "Users can view their own uploads"
  ON file_uploads FOR SELECT
  USING (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can create uploads"
  ON file_uploads FOR INSERT
  WITH CHECK (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can update their own uploads"
  ON file_uploads FOR UPDATE
  USING (user_id::text = public.clerk_user_id());

CREATE POLICY "Users can delete their own uploads"
  ON file_uploads FOR DELETE
  USING (user_id::text = public.clerk_user_id());
