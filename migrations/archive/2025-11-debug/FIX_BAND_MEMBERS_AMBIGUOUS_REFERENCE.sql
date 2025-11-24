-- Fix the ambiguous table reference in band_members INSERT policy
-- The issue: "band_members.band_id" is ambiguous in nested subqueries

-- Current problematic policy
SELECT '=== CURRENT PROBLEMATIC POLICY ===' as section;
SELECT policyname, with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- Drop the ambiguous policy
DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;

-- Create a simpler, clearer policy with explicit references
CREATE POLICY "Allow band member inserts"
  ON band_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Option 1: User has valid invite
    (SELECT has_valid_invite(user_id, band_id))

    OR

    -- Option 2: User is owner/admin (for adding other members)
    (SELECT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    ))

    OR

    -- Option 3: This is the FIRST member of the band (band creator)
    (SELECT NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    ))
  );

-- Verify the new policy
SELECT '=== NEW POLICY ===' as section;
SELECT
  policyname,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

SELECT '=== EXPLANATION ===' as section,
  'Changed "bm.band_id" to "existing.band_id" for clarity' as change1,
  'Wrapped each condition in SELECT for proper evaluation' as change2,
  'Explicit table alias "existing" avoids ambiguity with NEW row "band_members"' as change3;
