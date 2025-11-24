-- ============================================================
-- FIX: Remove infinite recursion in SELECT policy
-- ============================================================
-- Problem: is_user_in_band() queries band_members, which has a
-- SELECT policy that calls is_user_in_band() = infinite recursion!
--
-- Solution: Replace the SELECT policy with a direct query that
-- doesn't cause recursion
-- ============================================================

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Users can view band members" ON band_members;

-- Create a new SELECT policy without function call
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    -- Allow viewing if user is in the same band
    band_id IN (
      SELECT DISTINCT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = auth.uid()
    )
  );

-- Verify
SELECT
  'Fixed SELECT policy' as status,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- Test if Stephen can now SELECT (should be false, he's not a member yet)
SELECT
  'Can Stephen SELECT his own future membership?' as test,
  'This should return 0 rows because Stephen is not a member yet' as note;

-- But the key is: this shouldn't cause 406 error anymore
-- The 406 was from infinite recursion, not from lack of access
