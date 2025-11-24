-- Debug: Why does app fail but SQL editor succeeds?
-- Possible reasons:
-- 1. App uses different auth context
-- 2. There's a SELECT policy blocking the RETURNING clause
-- 3. There's a trigger or function interfering

-- Check ALL policies on band_invites (including SELECT)
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY cmd, policyname;

-- Try insert WITHOUT .select() to see if SELECT policy is the issue
-- This should work if the problem is with SELECT policy
INSERT INTO band_invites (
  band_id,
  invited_by,
  invited_email,
  invite_token
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',
  auth.uid(),
  'testwithtoken@example.com',
  gen_random_uuid()::TEXT
);

-- Don't use RETURNING - just check if insert succeeds
-- Then manually query to see if it was created
SELECT id, invited_email, invite_token
FROM band_invites
WHERE invited_email = 'testwithtoken@example.com';
