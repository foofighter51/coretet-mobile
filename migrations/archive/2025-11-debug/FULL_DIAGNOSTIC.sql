-- Complete diagnostic - what's actually on the server RIGHT NOW
-- Date: 2025-11-12

SELECT '=== 1. ALL POLICIES ON BANDS TABLE ===' as section;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles::text[] as roles,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd, policyname;

SELECT '=== 2. RLS STATUS ON BANDS ===' as section;
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'bands';

SELECT '=== 3. BANDS TABLE STRUCTURE ===' as section;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bands'
ORDER BY ordinal_position;

SELECT '=== 4. CHECK CONSTRAINTS ON BANDS ===' as section;
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'bands'::regclass;

SELECT '=== 5. TRIGGERS ON BANDS ===' as section;
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bands';

SELECT '=== 6. TEST AUTH.UID() ===' as section;
SELECT
  auth.uid() as current_user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED as ' || auth.uid()::text
  END as status;

SELECT '=== 7. COUNT EXISTING BANDS ===' as section;
SELECT COUNT(*) as total_bands FROM bands;

SELECT '=== 8. CHECK IF MONACO EXISTS ===' as section;
SELECT id, name, created_by, is_personal
FROM bands
WHERE name ILIKE '%monaco%'
ORDER BY created_at DESC;
