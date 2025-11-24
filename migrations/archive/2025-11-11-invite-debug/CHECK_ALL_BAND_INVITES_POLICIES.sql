-- Check ALL policies on band_invites (not just INSERT)
-- Sometimes SELECT policies can block INSERT if they're too restrictive

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
