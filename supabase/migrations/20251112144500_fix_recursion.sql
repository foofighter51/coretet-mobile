-- Fix infinite recursion in band_members policies
-- Date: 2025-11-12
-- Issue: SELECT policy queries band_members table causing recursion

-- The problem: band_members SELECT policy checks "WHERE user_id = auth.uid()"
-- which queries the same table it's protecting, causing infinite recursion

-- ============================================================
-- FIX: Use direct auth.uid() check instead of subquery
-- ============================================================

-- band_members SELECT: Allow users to see their own memberships directly
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- bands SELECT: Simplify to avoid recursion
-- Use EXISTS which is more efficient and avoids full recursion
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      LIMIT 1
    )
  );

-- bands UPDATE: Simplify with EXISTS
DROP POLICY IF EXISTS "Band owners can update" ON bands;
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );

-- bands DELETE: Simplify with EXISTS
DROP POLICY IF EXISTS "Band owners can delete" ON bands;
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );

-- band_members UPDATE: Simplify with EXISTS
DROP POLICY IF EXISTS "Owners and admins can update members" ON band_members;
CREATE POLICY "Owners and admins can update members"
  ON band_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
      LIMIT 1
    )
  );

-- band_members DELETE: Simplify with EXISTS
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
      LIMIT 1
    )
  );

-- band_invites policies that reference band_members
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('owner', 'admin')
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  TO authenticated, anon
  USING (
    (auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM band_members
        WHERE band_members.band_id = band_invites.band_id
        AND band_members.user_id = auth.uid()
        LIMIT 1
      )
      OR invited_email IN (
        SELECT email FROM profiles WHERE id = auth.uid() LIMIT 1
      )
    ))
    OR auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "Owners and admins can revoke invites" ON band_invites;
CREATE POLICY "Owners and admins can revoke invites"
  ON band_invites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('owner', 'admin')
      LIMIT 1
    )
  );
