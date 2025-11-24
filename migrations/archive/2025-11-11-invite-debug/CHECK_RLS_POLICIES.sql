-- Check all RLS policies on band_invites table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY policyname;

-- Also check if RLS is enabled on the table
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'band_invites';
