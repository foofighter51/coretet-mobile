-- Debug why Dan's band creation fails despite being authenticated
-- The RLS policy check is failing even though Dan is logged in

-- 1. What is the EXACT bands INSERT policy?
SELECT
  '=== CURRENT BANDS INSERT POLICY ===' as section;

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- 2. Test if the policy would pass for Dan
-- Simulate: WITH CHECK (auth.uid() IS NOT NULL)
SELECT
  '=== POLICY SIMULATION ===' as section,
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid as dans_user_id,
  ('929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid IS NOT NULL) as "IS NOT NULL check",
  CASE
    WHEN '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid IS NOT NULL THEN '✅ SHOULD PASS'
    ELSE '❌ WOULD FAIL'
  END as result;

-- 3. Check what columns are being inserted
SELECT
  '=== BANDS TABLE SCHEMA ===' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bands'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if there are any OTHER INSERT policies on bands
SELECT
  '=== ALL POLICIES ON BANDS ===' as section,
  policyname,
  cmd,
  permissive,
  roles,
  CASE
    WHEN cmd = 'INSERT' THEN with_check
    ELSE qual
  END as policy_check
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd, policyname;

-- 5. Check if there are triggers that might interfere
SELECT
  '=== TRIGGERS ON BANDS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bands'
AND event_object_schema = 'public';

-- 6. Try to manually INSERT as Dan (THIS IS THE KEY TEST)
-- Run this with Dan's auth context
SELECT '=== MANUAL INSERT TEST ===' as section;

-- This query shows what WOULD happen if we try to insert
-- (Don't actually insert, just check the policy)
EXPLAIN (VERBOSE, COSTS OFF)
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Test Band', '929a7b64-b93e-430e-8a6f-7d0cc2c8d182', false);

-- 7. Check if RLS is enabled
SELECT
  '=== RLS STATUS ===' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE pt.tablename = 'bands'
AND pt.schemaname = 'public';
