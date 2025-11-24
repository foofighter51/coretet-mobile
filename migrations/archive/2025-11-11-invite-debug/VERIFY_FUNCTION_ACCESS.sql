-- ============================================================
-- VERIFY: Function is accessible and policy uses it correctly
-- ============================================================

-- 1. Check if function exists and is in correct schema
SELECT
  'Function exists?' as check,
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'has_valid_invite';

-- 2. Check function permissions
SELECT
  'Function permissions' as check,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'has_valid_invite';

-- 3. Test function directly (as if we're Stephen)
-- This simulates what happens during RLS check
SELECT
  'Direct function call' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as result;

-- 4. Check the current policy text
SELECT
  'Current policy WITH CHECK clause' as check,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- 5. Try the exact INSERT that's failing (will fail due to RLS, but shows us the error)
-- Comment this out if you don't want to try it
-- INSERT INTO band_members (band_id, user_id, role)
-- VALUES (
--   (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b'),
--   '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01',
--   'member'
-- );
