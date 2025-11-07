-- ============================================================
-- COMPREHENSIVE FIX: Remove ALL auth.uid()::TEXT casts
-- ============================================================
-- Problem: ALL RLS policies were created with auth.uid()::TEXT
-- but user_id columns are UUID, not TEXT, causing type mismatch errors
-- Solution: Drop and recreate ALL policies without TEXT casting
-- ============================================================

-- ============================================================
-- BANDS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view their bands" ON bands;
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Band owners can update" ON bands;
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Band owners can delete" ON bands;
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================================
-- BAND_MEMBERS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view band members" ON band_members;
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM band_members WHERE band_id = band_members.band_id)
  );

DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- BAND_INVITES TABLE POLICIES
-- ============================================================

-- Drop old restrictive policy (from original migration)
DROP POLICY IF EXISTS "Owners and admins can invite" ON band_invites;

-- Drop our newer policy (may exist from earlier fixes)
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;

-- Create new democratic policy: any band member can invite
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
    OR invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- VERIFICATION: Check all policies were updated correctly
-- ============================================================

-- Check bands policies
SELECT 'BANDS' as table_name, policyname, cmd,
  CASE
    WHEN with_check LIKE '%::TEXT%' OR qual LIKE '%::TEXT%' THEN '❌ HAS TEXT CAST'
    ELSE '✅ CLEAN'
  END as status
FROM pg_policies
WHERE tablename = 'bands'

UNION ALL

-- Check band_members policies
SELECT 'BAND_MEMBERS' as table_name, policyname, cmd,
  CASE
    WHEN with_check LIKE '%::TEXT%' OR qual LIKE '%::TEXT%' THEN '❌ HAS TEXT CAST'
    ELSE '✅ CLEAN'
  END as status
FROM pg_policies
WHERE tablename = 'band_members'

UNION ALL

-- Check band_invites policies
SELECT 'BAND_INVITES' as table_name, policyname, cmd,
  CASE
    WHEN with_check LIKE '%::TEXT%' OR qual LIKE '%::TEXT%' THEN '❌ HAS TEXT CAST'
    ELSE '✅ CLEAN'
  END as status
FROM pg_policies
WHERE tablename = 'band_invites'

ORDER BY table_name, cmd, policyname;

-- All rows should show '✅ CLEAN'
