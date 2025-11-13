-- Fix RLS policies for proper role assignments and ambiguous references
-- Date: 2025-11-12
-- Issue: Band creation failing with 403 - policies using wrong roles

-- ============================================================
-- BANDS TABLE - Fix role assignments
-- ============================================================

-- INSERT policy: Must be authenticated
DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  TO authenticated  -- Explicitly authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT policy: Must be authenticated
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE policy: Must be authenticated
DROP POLICY IF EXISTS "Band owners can update" ON bands;
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- DELETE policy: Must be authenticated
DROP POLICY IF EXISTS "Band owners can delete" ON bands;
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================
-- BAND_MEMBERS TABLE - Fix ambiguous references
-- ============================================================

-- INSERT policy: Fix ambiguous table reference
DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;
CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Option 1: User has valid invite
    (EXISTS (
      SELECT 1 FROM band_invites
      WHERE band_invites.band_id = band_members.band_id
      AND band_invites.invited_email IN (
        SELECT email FROM profiles WHERE id = band_members.user_id
      )
      AND band_invites.status = 'pending'
    ))

    OR

    -- Option 2: User is owner/admin of THIS band (adding other members)
    (EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    ))

    OR

    -- Option 3: This is the FIRST member (band creator)
    (NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    ))
  );

-- SELECT policy: Must be authenticated
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  TO authenticated
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE policy: Must be authenticated
DROP POLICY IF EXISTS "Owners and admins can update members" ON band_members;
CREATE POLICY "Owners and admins can update members"
  ON band_members FOR UPDATE
  TO authenticated
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- DELETE policy: Must be authenticated
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  TO authenticated
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- BAND_INVITES TABLE - Fix role assignments
-- ============================================================

-- INSERT policy: Must be authenticated
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = band_invites.band_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- SELECT policy: Allow both authenticated and anon for invite flow
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  TO authenticated, anon
  USING (
    (auth.uid() IS NOT NULL AND (
      band_id IN (
        SELECT band_id FROM band_members
        WHERE user_id = auth.uid()
      )
      OR invited_email IN (
        SELECT email FROM profiles WHERE id = auth.uid()
      )
    ))
    OR auth.uid() IS NULL
  );

-- UPDATE policy: Must be authenticated
DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  TO authenticated
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- DELETE policy: Must be authenticated
DROP POLICY IF EXISTS "Owners and admins can revoke invites" ON band_invites;
CREATE POLICY "Owners and admins can revoke invites"
  ON band_invites FOR DELETE
  TO authenticated
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
