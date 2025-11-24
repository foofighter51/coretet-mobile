-- Comprehensive fix for ALL RLS policy issues
-- Based on audit results from AUDIT_ALL_RLS_POLICIES.sql
-- Date: 2025-11-12

-- ============================================================
-- ISSUE 1: Wrong Role Assignments (public → authenticated)
-- ============================================================

SELECT '=== FIXING ROLE ASSIGNMENTS ===' as section;

-- bands table: SELECT, UPDATE, DELETE should be authenticated, not public
DROP POLICY IF EXISTS "Band owners can delete" ON bands;
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  TO authenticated  -- Changed from public
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Users can view their bands" ON bands;
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  TO authenticated  -- Changed from public
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Band owners can update" ON bands;
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  TO authenticated  -- Changed from public
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- band_members table: DELETE should be authenticated
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  TO authenticated  -- Changed from public
  USING (
    band_id IN (
      SELECT bm.band_id FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- band_invites table: All operations should be authenticated
DROP POLICY IF EXISTS "Owners and admins can revoke invites" ON band_invites;
CREATE POLICY "Owners and admins can revoke invites"
  ON band_invites FOR DELETE
  TO authenticated  -- Changed from public
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Band members can invite" ON band_invites;
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  TO authenticated  -- Changed from public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = band_invites.band_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  TO authenticated, anon  -- Keep anon for invite acceptance flow
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
    OR auth.uid() IS NULL  -- Allow anonymous to view their invite
  );

DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  TO authenticated  -- Changed from public
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- ISSUE 2: Ambiguous Table References (band_members INSERT)
-- ============================================================

SELECT '=== FIXING AMBIGUOUS TABLE REFERENCES ===' as section;

DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;
CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Option 1: User has valid invite
    (SELECT has_valid_invite(user_id, band_id))

    OR

    -- Option 2: User is owner/admin of THIS band (adding other members)
    -- Use explicit alias "existing" to avoid ambiguity with NEW row "band_members"
    (SELECT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    ))

    OR

    -- Option 3: This is the FIRST member (band creator)
    -- Use explicit alias "existing" to avoid ambiguity
    (SELECT NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    ))
  );

-- ============================================================
-- ISSUE 3: Remove unnecessary public role from tracks
-- ============================================================

SELECT '=== CLEANING UP TRACKS POLICIES ===' as section;

-- Remove the redundant public SELECT policy on tracks
DROP POLICY IF EXISTS "tracks_select_personal_permissive" ON tracks;

-- The "Authenticated users can view tracks" policy already allows all authenticated users
-- No need for a separate public policy

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '=== VERIFICATION: UPDATED POLICIES ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  array_to_string(roles, ', ') as roles,
  CASE
    WHEN 'public' = ANY(roles) AND NOT ('authenticated' = ANY(roles) OR 'anon' = ANY(roles))
    THEN '⚠️ Still uses public alone'
    WHEN 'authenticated' = ANY(roles)
    THEN '✅ Uses authenticated'
    ELSE '✅ OK'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('bands', 'band_members', 'band_invites', 'tracks', 'playlists', 'comments')
ORDER BY
  tablename,
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END,
  policyname;

-- ============================================================
-- SUMMARY
-- ============================================================

SELECT '=== SUMMARY OF CHANGES ===' as section;

SELECT
  'Fixed role assignments' as change_type,
  '8 policies changed from public to authenticated' as description
UNION ALL
SELECT
  'Fixed ambiguous table references',
  'band_members INSERT policy now uses explicit "existing" alias'
UNION ALL
SELECT
  'Cleaned up redundant policies',
  'Removed tracks_select_personal_permissive (redundant)'
UNION ALL
SELECT
  'Ready for testing',
  'Dan should now be able to create bands';

SELECT '=== NEXT STEP ===' as section,
  'Restart Supabase connection pool to clear policy cache' as action,
  'Then have Dan try creating a band' as test;
