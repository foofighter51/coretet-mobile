-- Check what the policy actually says now
SELECT
  'Current INSERT policy' as info,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Also check if the issue is with the SELECT policy
-- (the 406 error on the initial check)
SELECT
  'SELECT policy' as info,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- Test each condition separately
SELECT 'Case 1: Is Stephen admin?' as test,
  '5184117c-ec73-4626-b1d6-36e9db334004'::uuid IN (
    SELECT bm.band_id
    FROM band_members bm
    WHERE bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    AND bm.role IN ('owner', 'admin')
  ) as result;

SELECT 'Case 2: Does Stephen have valid invite?' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
  ) as result;

SELECT 'Case 3: Is this the first member?' as test,
  NOT EXISTS (
    SELECT 1
    FROM band_members bm
    WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
  ) as result;

-- Check if the is_user_in_band function exists and works
SELECT 'is_user_in_band function test' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
  ) as result;
