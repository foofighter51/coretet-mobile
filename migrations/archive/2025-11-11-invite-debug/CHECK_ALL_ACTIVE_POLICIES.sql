-- ============================================================
-- CHECK: What policies are ACTUALLY active on band_members?
-- ============================================================
-- There might be multiple INSERT policies and they might be
-- combined with AND logic causing the failure
-- ============================================================

-- Get ALL policies on band_members
SELECT
  'All band_members policies' as check,
  policyname,
  permissive as permissive_or_restrictive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
ORDER BY cmd, permissive DESC, policyname;

-- Count how many INSERT policies exist
SELECT
  'INSERT policy count' as check,
  COUNT(*) as count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Check if RLS is even enabled
SELECT
  'RLS enabled?' as check,
  schemaname,
  tablename,
  rowsecurity as is_enabled
FROM pg_tables
WHERE tablename = 'band_members';
