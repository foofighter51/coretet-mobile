-- ============================================================
-- PART 2: ENABLE RLS AND CREATE POLICIES
-- Run this after Part 1 (tables created)
-- This version drops existing policies first to avoid conflicts
-- ============================================================

-- Enable RLS on all band tables
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
DROP POLICY IF EXISTS "Band owners can update" ON bands;
DROP POLICY IF EXISTS "Band owners can delete" ON bands;
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
DROP POLICY IF EXISTS "Owners and admins can invite" ON band_invites;
DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;

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

-- Band Members: Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM band_members WHERE band_id = band_members.band_id)
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

-- Band Invites: Users can view invites for their bands or sent to them
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

-- Band Invites: Users can accept/decline invites sent to them
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    email IN (
      SELECT email FROM profiles WHERE id = auth.uid()::TEXT
    )
  );
