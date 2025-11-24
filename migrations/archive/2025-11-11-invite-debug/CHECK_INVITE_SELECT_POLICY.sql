-- Check if the SELECT policy on band_invites allows unauthenticated reads
-- The web invite page needs to read invite details BEFORE user logs in

SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- The current policy requires user to be authenticated
-- But the invite page needs to show invite details to UNAUTHENTICATED users
-- so they can decide whether to sign up

-- Check what the policy says:
-- Current: User must be a band member OR the invited email matches their profile
-- Problem: Unauthenticated users can't read ANY invites!
