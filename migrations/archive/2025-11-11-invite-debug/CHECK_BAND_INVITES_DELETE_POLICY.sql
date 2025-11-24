-- Check if there's a DELETE policy on band_invites
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'DELETE';

-- If no results, we need to create a DELETE policy
