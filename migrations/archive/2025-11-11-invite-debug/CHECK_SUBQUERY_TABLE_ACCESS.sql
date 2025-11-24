-- ============================================================
-- CRITICAL CHECK: Can RLS policies access band_invites and profiles?
-- ============================================================
-- The INSERT policy has a subquery that reads from band_invites and profiles
-- If those tables have restrictive SELECT policies, the subquery will return no rows
-- even if the data exists!
-- ============================================================

-- Check profiles SELECT policies
SELECT
  'profiles SELECT policies' as info,
  policyname,
  cmd,
  roles,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd = 'SELECT';

-- Check band_invites SELECT policies
SELECT
  'band_invites SELECT policies' as info,
  policyname,
  cmd,
  roles,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- THIS IS LIKELY THE ISSUE:
-- If band_invites has a SELECT policy that requires you to be a band member,
-- then Stephen (who isn't a member yet) can't read the invite,
-- so the EXISTS subquery returns false!
