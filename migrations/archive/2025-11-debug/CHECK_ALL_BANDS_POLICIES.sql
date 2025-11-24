-- Check ALL policies on bands table - there might be multiple or conflicting ones

-- 1. Show ALL policies on bands (not just INSERT)
SELECT
  '=== ALL POLICIES ON BANDS TABLE ===' as section,
  policyname,
  cmd,
  permissive,
  roles,
  CASE
    WHEN cmd = 'SELECT' THEN 'USING: ' || COALESCE(qual, 'NULL')
    WHEN cmd = 'INSERT' THEN 'WITH CHECK: ' || COALESCE(with_check, 'NULL')
    WHEN cmd = 'UPDATE' THEN 'USING: ' || COALESCE(qual, 'NULL') || ' | WITH CHECK: ' || COALESCE(with_check, 'NULL')
    WHEN cmd = 'DELETE' THEN 'USING: ' || COALESCE(qual, 'NULL')
    ELSE 'UNKNOWN'
  END as policy_definition
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd, policyname;

-- 2. Count INSERT policies specifically
SELECT
  '=== INSERT POLICY COUNT ===' as section,
  COUNT(*) as total_insert_policies,
  CASE
    WHEN COUNT(*) = 0 THEN '❌ NO INSERT POLICY - Everything blocked by default'
    WHEN COUNT(*) = 1 THEN '✅ One INSERT policy'
    WHEN COUNT(*) > 1 THEN '⚠️ MULTIPLE INSERT POLICIES - Might conflict'
  END as status
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- 3. Check if RLS is actually enabled
SELECT
  '=== RLS STATUS ===' as section,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity = true THEN '✅ RLS is enabled'
    ELSE '❌ RLS is DISABLED'
  END as status
FROM pg_tables
WHERE tablename = 'bands';

-- 4. Test if the issue is with band_members policy (second step)
-- Band creation requires TWO inserts: bands + band_members
SELECT
  '=== BAND_MEMBERS INSERT POLICIES ===' as section,
  policyname,
  permissive,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- 5. Check if Dan can INSERT into band_members
-- This is also required for band creation
SELECT
  '=== BAND_MEMBERS POLICY ANALYSIS ===' as section,
  policyname,
  CASE
    WHEN 'authenticated' = ANY(roles) THEN '✅ Allows authenticated'
    WHEN 'public' = ANY(roles) THEN '⚠️ Only allows public'
    ELSE '❓ Unknown role'
  END as role_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- 6. Nuclear option: Temporarily disable RLS to test
-- (Don't actually run this unless we're sure)
/*
ALTER TABLE bands DISABLE ROW LEVEL SECURITY;
-- Test band creation here
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
*/

SELECT '=== NEXT STEP ===' as section,
       'If INSERT policy count is 0 or multiple, that is the problem' as note;
