-- Comprehensive audit of ALL RLS policies to find common issues
-- Issues we've encountered:
-- 1. Wrong role assignment (public vs authenticated)
-- 2. Ambiguous table references (table.column inside subquery that queries same table)
-- 3. UUID vs TEXT casting issues
-- 4. Recursive policy checks

-- ============================================================
-- ISSUE 1: Wrong Role Assignment
-- ============================================================
SELECT '=== ISSUE 1: WRONG ROLE ASSIGNMENT ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  roles,
  CASE
    -- Policies with "authenticated" or "user" in name but assigned to public
    WHEN (policyname ILIKE '%authenticated%' OR policyname ILIKE '%user%')
         AND 'public' = ANY(roles)
         AND NOT ('authenticated' = ANY(roles))
    THEN '⚠️ POLICY NAME SUGGESTS authenticated BUT USES public ROLE'

    -- Policies with "admin" or "owner" in name but assigned to wrong role
    WHEN (policyname ILIKE '%admin%' OR policyname ILIKE '%owner%')
         AND 'public' = ANY(roles)
    THEN '⚠️ ADMIN/OWNER POLICY USING public ROLE'

    ELSE '✅ OK'
  END as issue,
  array_to_string(roles, ', ') as assigned_roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN (policyname ILIKE '%authenticated%' OR policyname ILIKE '%user%')
         AND 'public' = ANY(roles) THEN 1
    ELSE 2
  END,
  tablename, policyname;

-- ============================================================
-- ISSUE 2: Ambiguous Table References
-- ============================================================
SELECT '=== ISSUE 2: AMBIGUOUS TABLE REFERENCES ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    -- Check for self-referencing subqueries (table.column where table is in FROM clause)
    WHEN qual LIKE '%' || tablename || '.%'
         AND qual LIKE '%FROM ' || tablename || '%'
    THEN '⚠️ POSSIBLY AMBIGUOUS - qual references ' || tablename || ' inside subquery'

    WHEN with_check LIKE '%' || tablename || '.%'
         AND with_check LIKE '%FROM ' || tablename || '%'
    THEN '⚠️ POSSIBLY AMBIGUOUS - with_check references ' || tablename || ' inside subquery'

    ELSE '✅ No obvious ambiguity'
  END as issue,
  CASE WHEN cmd = 'SELECT' THEN qual ELSE with_check END as policy_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual LIKE '%' || tablename || '.%'
    OR with_check LIKE '%' || tablename || '.%'
  )
ORDER BY
  CASE
    WHEN qual LIKE '%FROM ' || tablename || '%'
         OR with_check LIKE '%FROM ' || tablename || '%' THEN 1
    ELSE 2
  END,
  tablename, policyname;

-- ============================================================
-- ISSUE 3: TEXT Casting Issues
-- ============================================================
SELECT '=== ISSUE 3: UUID vs TEXT CASTING ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual LIKE '%::text%' OR with_check LIKE '%::text%'
    THEN '⚠️ USES ::TEXT CAST - May cause type mismatch'
    ELSE '✅ No text casting'
  END as issue,
  CASE
    WHEN qual LIKE '%auth.uid()::text%' THEN 'auth.uid()::text found'
    WHEN with_check LIKE '%auth.uid()::text%' THEN 'auth.uid()::text found'
    ELSE 'Other ::text usage'
  END as details
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%::text%' OR with_check LIKE '%::text%')
ORDER BY tablename, policyname;

-- ============================================================
-- ISSUE 4: Policies That Query Same Table (Recursion Risk)
-- ============================================================
SELECT '=== ISSUE 4: RECURSIVE POLICY RISK ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN cmd = 'SELECT'
         AND qual LIKE '%FROM ' || tablename || '%'
    THEN '⚠️ SELECT policy queries its own table - RECURSION RISK'

    WHEN cmd = 'INSERT'
         AND with_check LIKE '%FROM ' || tablename || '%'
    THEN '⚠️ INSERT policy queries its own table - may cause issues'

    WHEN cmd = 'UPDATE'
         AND (qual LIKE '%FROM ' || tablename || '%'
              OR with_check LIKE '%FROM ' || tablename || '%')
    THEN '⚠️ UPDATE policy queries its own table - may cause issues'

    ELSE '✅ No recursion risk'
  END as issue,
  CASE WHEN cmd = 'SELECT' THEN qual ELSE with_check END as policy_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN cmd = 'SELECT' AND qual LIKE '%FROM ' || tablename || '%' THEN 1
    ELSE 2
  END,
  tablename, policyname;

-- ============================================================
-- ISSUE 5: Missing Explicit Table Qualification
-- ============================================================
SELECT '=== ISSUE 5: MISSING EXPLICIT TABLE NAMES ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    -- Look for unqualified column names in policies with subqueries
    WHEN (qual LIKE '%SELECT%' OR with_check LIKE '%SELECT%')
         AND (qual LIKE '%(band_id%' OR with_check LIKE '%(band_id%')
         AND NOT (qual LIKE '%' || tablename || '.band_id%'
                  OR with_check LIKE '%' || tablename || '.band_id%')
    THEN '⚠️ Unqualified band_id in policy with subquery'

    WHEN (qual LIKE '%SELECT%' OR with_check LIKE '%SELECT%')
         AND (qual LIKE '%(user_id%' OR with_check LIKE '%(user_id%')
         AND NOT (qual LIKE '%' || tablename || '.user_id%'
                  OR with_check LIKE '%' || tablename || '.user_id%')
    THEN '⚠️ Unqualified user_id in policy with subquery'

    ELSE '✅ Columns appear qualified'
  END as issue
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%SELECT%' OR with_check LIKE '%SELECT%')
ORDER BY
  CASE
    WHEN (qual LIKE '%(band_id%' OR with_check LIKE '%(band_id%')
         OR (qual LIKE '%(user_id%' OR with_check LIKE '%(user_id%') THEN 1
    ELSE 2
  END,
  tablename, policyname;

-- ============================================================
-- SUMMARY: All Tables and Their Policy Counts
-- ============================================================
SELECT '=== SUMMARY: POLICY COUNTS BY TABLE ===' as section;

SELECT
  tablename,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- SPECIFIC TABLES TO CHECK (Our main tables)
-- ============================================================
SELECT '=== KEY TABLES DETAILED CHECK ===' as section;

SELECT
  tablename,
  policyname,
  cmd,
  array_to_string(roles, ', ') as roles,
  SUBSTRING(COALESCE(with_check, qual), 1, 100) as policy_snippet
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('bands', 'band_members', 'band_invites', 'tracks', 'playlists', 'comments', 'profiles')
ORDER BY
  CASE tablename
    WHEN 'bands' THEN 1
    WHEN 'band_members' THEN 2
    WHEN 'band_invites' THEN 3
    WHEN 'tracks' THEN 4
    WHEN 'playlists' THEN 5
    WHEN 'comments' THEN 6
    WHEN 'profiles' THEN 7
  END,
  cmd, policyname;
