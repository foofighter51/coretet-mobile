-- Migration: Create Band/Workspace System
-- Purpose: Enable multi-band collaboration with proper data isolation
-- Run in Supabase SQL Editor

-- ============================================================
-- STEP 1: Create Tables
-- ============================================================

-- Bands (workspaces/organizations)
CREATE TABLE IF NOT EXISTS bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_personal BOOLEAN DEFAULT false, -- For auto-created personal bands
  settings JSONB DEFAULT '{}', -- Future: privacy, branding, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Band members (users in bands)
CREATE TABLE IF NOT EXISTS band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(band_id, user_id)
);

-- Band invites (email invitations)
CREATE TABLE IF NOT EXISTS band_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

-- ============================================================
-- STEP 2: Add band_id to Existing Tables
-- ============================================================

-- Add band_id to tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;

-- Add band_id to playlists
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;

-- Add band_id to ratings
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;

-- Add band_id to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_band_id ON tracks(band_id);
CREATE INDEX IF NOT EXISTS idx_playlists_band_id ON playlists(band_id);
CREATE INDEX IF NOT EXISTS idx_ratings_band_id ON ratings(band_id);
CREATE INDEX IF NOT EXISTS idx_comments_band_id ON comments(band_id);
CREATE INDEX IF NOT EXISTS idx_band_members_user_id ON band_members(user_id);
CREATE INDEX IF NOT EXISTS idx_band_members_band_id ON band_members(band_id);
CREATE INDEX IF NOT EXISTS idx_band_invites_email ON band_invites(email);
CREATE INDEX IF NOT EXISTS idx_band_invites_token ON band_invites(token);

-- ============================================================
-- STEP 3: Create RLS Policies
-- ============================================================

-- Enable RLS on all band tables
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;

-- Bands: Users can only see bands they're members of
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Bands: Any authenticated user can create a band
CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  WITH CHECK (auth.uid()::TEXT IS NOT NULL);

-- Bands: Only owners can update
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'owner'
    )
  );

-- Bands: Only owners can delete
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'owner'
    )
  );

-- Band Members: Users can view members of their bands
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Band Members: Auto-add creator as owner when band is created
-- This is handled in application logic, but allow INSERT for owners/admins
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM band_members WHERE band_id = band_members.band_id) -- Allow first member
  );

-- Band Members: Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
  );

-- Band Invites: Users can view invites for their bands
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
    OR email IN (
      SELECT email FROM profiles WHERE id = auth.uid()::TEXT
    )
  );

-- Band Invites: Owners and admins can create invites
CREATE POLICY "Owners and admins can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
  );

-- Band Invites: Users can update invites sent to them
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    email IN (
      SELECT email FROM profiles WHERE id = auth.uid()::TEXT
    )
  );

-- ============================================================
-- STEP 4: Update Existing RLS Policies for Band Scope
-- ============================================================

-- Note: These policies need to be updated to check band membership
-- We'll do this in the application layer first, then add stricter RLS later

-- Drop existing policies if needed (example, adjust based on actual policies):
-- DROP POLICY IF EXISTS "Users can view tracks" ON tracks;

-- New band-scoped policy for tracks
CREATE POLICY "Users can view band tracks"
  ON tracks FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Similar for playlists, ratings, comments
-- (Add more as needed)

-- ============================================================
-- STEP 5: Create Helper Function
-- ============================================================

-- Function to check if user is band member
CREATE OR REPLACE FUNCTION is_band_member(check_band_id UUID, check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is band owner/admin
CREATE OR REPLACE FUNCTION is_band_admin(check_band_id UUID, check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 6: Create Default "Bedeker" Band
-- ============================================================

-- Insert Bedeker band (run this separately after migration)
-- Replace 'YOUR_USER_ID' with actual user ID

/*
-- Create Bedeker band
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Bedeker', 'YOUR_USER_ID', false)
RETURNING id;

-- Save the returned ID and use it to add yourself as owner
INSERT INTO band_members (band_id, user_id, role)
VALUES ('BAND_ID_FROM_ABOVE', 'YOUR_USER_ID', 'owner');

-- Update all existing tracks to Bedeker band
UPDATE tracks
SET band_id = 'BAND_ID_FROM_ABOVE'
WHERE created_by = 'YOUR_USER_ID';

-- Update all existing playlists to Bedeker band
UPDATE playlists
SET band_id = 'BAND_ID_FROM_ABOVE'
WHERE created_by = 'YOUR_USER_ID';

-- Update all existing ratings to Bedeker band
UPDATE ratings
SET band_id = 'BAND_ID_FROM_ABOVE'
WHERE user_id = 'YOUR_USER_ID';

-- Update all existing comments to Bedeker band
UPDATE comments
SET band_id = 'BAND_ID_FROM_ABOVE'
WHERE user_id = 'YOUR_USER_ID';
*/

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check bands
-- SELECT * FROM bands;

-- Check band members
-- SELECT * FROM band_members;

-- Check tracks with band_id
-- SELECT id, title, band_id FROM tracks LIMIT 10;
