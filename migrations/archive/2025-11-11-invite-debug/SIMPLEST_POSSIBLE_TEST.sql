-- ============================================================
-- SIMPLEST TEST: Just allow the insert temporarily
-- ============================================================
-- This will confirm if the issue is with policy logic or something else
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

-- Temporarily allow ANY authenticated user to insert
-- This is just for testing - we'll add restrictions back after confirming it works
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Just check Case 2: valid invite
    has_valid_invite(user_id, band_id)
  );

-- Verify
SELECT
  'Simplified policy' as status,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test
SELECT
  'Would this work?' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
  ) as result;
