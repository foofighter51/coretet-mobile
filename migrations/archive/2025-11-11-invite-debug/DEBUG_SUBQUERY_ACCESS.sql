-- ============================================================
-- DEBUG: Check if RLS policies allow the subqueries to work
-- ============================================================
-- The WITH CHECK clause includes subqueries that need to read from
-- band_invites and profiles tables. If those tables have restrictive
-- SELECT policies, the subqueries might fail silently.
-- ============================================================

-- 1. Check all policies on tables involved in the INSERT check
SELECT
  'All relevant policies' as info,
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies
WHERE tablename IN ('band_members', 'band_invites', 'profiles')
ORDER BY tablename, cmd, policyname;

-- 2. Test if the subquery in has_valid_invite can be executed
-- This simulates what happens during the INSERT WITH CHECK evaluation
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01"}';

-- Test if we can read from band_invites (needed by has_valid_invite function)
SELECT
  'Can read band_invites?' as test,
  COUNT(*) as invite_count
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com'
AND status = 'pending'
AND expires_at > NOW();

-- Test if we can read from profiles (needed by has_valid_invite function)
SELECT
  'Can read profiles?' as test,
  COUNT(*) as profile_count
FROM profiles
WHERE email = 'stephenpjudy@gmail.com';

RESET ROLE;
