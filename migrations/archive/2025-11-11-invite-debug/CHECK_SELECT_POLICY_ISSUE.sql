-- ============================================================
-- CHECK: Why are SELECT queries returning 406?
-- ============================================================
-- 406 Not Acceptable suggests the SELECT policy might be broken
-- ============================================================

-- Check the SELECT policy on band_members
SELECT
  'band_members SELECT policy' as check,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- Check if the is_user_in_band function has issues
SELECT
  'is_user_in_band function' as check,
  proname,
  prosrc as source_code,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'is_user_in_band';

-- Test if the SELECT policy actually works
SELECT
  'Can Stephen SELECT from band_members?' as test,
  EXISTS (
    SELECT 1 FROM band_members
    WHERE user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    AND band_id = '5184117c-ec73-4626-b1d6-36e9db334004'
  ) as result;

-- Test is_user_in_band directly
SELECT
  'is_user_in_band test' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
  ) as result;

-- Check band_invites SELECT policy
SELECT
  'band_invites SELECT policy' as check,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';
