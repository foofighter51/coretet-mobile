-- ============================================================
-- STEP 4: Wrap security functions in SELECT for better caching
-- ============================================================
-- According to Supabase docs, wrapping function calls in SELECT
-- causes PostgreSQL optimizer to cache results instead of
-- re-evaluating on each row
-- ============================================================

DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;
DROP POLICY IF EXISTS "Temporary allow all authenticated" ON band_members;

CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User being inserted has a valid pending invite
    -- Wrap the function call in SELECT for caching
    (SELECT has_valid_invite(band_members.user_id, band_members.band_id))
    -- Case 2: Current authenticated user is admin/owner of the band
    OR band_members.band_id IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 3: First member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm WHERE bm.band_id = band_members.band_id
    )
  );

-- Verify
SELECT
  'Policy with wrapped function' as status,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test that function still works
SELECT
  'Function test' as test,
  (SELECT has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
  )) as result;
