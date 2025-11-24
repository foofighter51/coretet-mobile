-- Comprehensive analysis of ALL table policies for potential issues
-- Date: 2025-11-12

SELECT '=== TABLES WITH INSERT + SELECT PATTERNS ===' as section;

-- Check all tables that have both INSERT and SELECT policies
WITH table_policies AS (
  SELECT
    tablename,
    array_agg(DISTINCT cmd ORDER BY cmd) as commands
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT
  tablename,
  commands::text[]
FROM table_policies
WHERE 'INSERT' = ANY(commands)
  AND 'SELECT' = ANY(commands)
ORDER BY tablename;

SELECT '=== ALL INSERT POLICIES (Check WITH CHECK clauses) ===' as section;

SELECT
  tablename,
  policyname,
  roles::text[],
  CASE
    WHEN with_check = 'true' THEN '✅ WITH CHECK: true (simple)'
    WHEN with_check IS NULL THEN '⚠️ WITH CHECK: (none - uses USING)'
    WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%created_by%' THEN '✅ Checks auth.uid() existence'
    WHEN with_check LIKE '%created_by = auth.uid()%' THEN '⚠️ Checks created_by = auth.uid() (was problematic for bands)'
    ELSE '🔍 Complex: ' || left(with_check, 80)
  END as with_check_analysis
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'INSERT'
ORDER BY tablename, policyname;

SELECT '=== ALL SELECT POLICIES (Check for member/creator patterns) ===' as section;

SELECT
  tablename,
  policyname,
  CASE
    WHEN qual = 'true' THEN '⚠️ USING: true (allows all - might be too permissive)'
    WHEN qual LIKE '%user_id = auth.uid()%' THEN '✅ Direct user_id check'
    WHEN qual LIKE '%created_by = auth.uid()%' AND qual NOT LIKE '%OR%' THEN '⚠️ Only creator (no OR member clause)'
    WHEN qual LIKE '%created_by = auth.uid()%' AND qual LIKE '%OR%' THEN '✅ Creator OR member pattern'
    WHEN qual LIKE '%EXISTS%band_members%' THEN '✅ Band member check'
    WHEN qual LIKE '%IN (SELECT%' THEN '🔍 Subquery pattern'
    ELSE '🔍 Complex: ' || left(qual, 80)
  END as using_analysis,
  left(qual, 150) as using_clause_preview
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

SELECT '=== POTENTIAL CHICKEN-AND-EGG ISSUES ===' as section;

-- Tables where INSERT might create a row but SELECT can't see it yet
SELECT
  i.tablename,
  i.policyname as insert_policy,
  s.policyname as select_policy,
  '⚠️ CHECK: Does SELECT allow viewing just-inserted rows?' as warning
FROM pg_policies i
JOIN pg_policies s ON i.tablename = s.tablename
WHERE i.cmd = 'INSERT'
  AND s.cmd = 'SELECT'
  AND i.tablename IN (
    -- Tables that use .insert().select() pattern
    'profiles', 'tracks', 'playlists', 'playlist_tracks',
    'band_members', 'band_invites', 'comments', 'feedback'
  )
ORDER BY i.tablename;

SELECT '=== TABLES WITH RLS ENABLED ===' as section;

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

SELECT '=== RECURSION RISK CHECK ===' as section;

-- SELECT policies that query their own table (recursion risk)
SELECT
  tablename,
  policyname,
  cmd,
  '⚠️ May cause recursion if USING queries same table' as warning
FROM pg_policies
WHERE cmd = 'SELECT'
  AND (
    (tablename = 'band_members' AND qual LIKE '%band_members%')
    OR (tablename = 'tracks' AND qual LIKE '%tracks%')
    OR (tablename = 'profiles' AND qual LIKE '%profiles%')
    OR (tablename = 'comments' AND qual LIKE '%comments%')
  )
ORDER BY tablename;
