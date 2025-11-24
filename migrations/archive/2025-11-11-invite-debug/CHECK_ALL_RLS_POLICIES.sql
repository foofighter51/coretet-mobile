-- Check ALL RLS policies on band_invites table
-- This will help identify if multiple policies are conflicting

SELECT
  schemaname,
  tablename,
  policyname,
  permissive, -- 'PERMISSIVE' or 'RESTRICTIVE'
  roles,
  cmd, -- SELECT, INSERT, UPDATE, DELETE, ALL
  qual, -- USING clause (for SELECT, UPDATE, DELETE)
  with_check -- WITH CHECK clause (for INSERT, UPDATE)
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY cmd, policyname;

-- Also check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'band_invites';
