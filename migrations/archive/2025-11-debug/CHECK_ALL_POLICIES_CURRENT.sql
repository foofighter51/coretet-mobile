-- Check ALL current RLS policies to see what's actually on the server
SELECT
  tablename,
  policyname,
  cmd,
  array_to_string(roles, ', ') as roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('bands', 'band_members', 'band_invites')
ORDER BY
  tablename,
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END,
  policyname;
