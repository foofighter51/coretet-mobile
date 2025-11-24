-- ============================================================
-- COMPREHENSIVE DIAGNOSTIC: Check EVERYTHING
-- ============================================================
-- This will identify ALL potential issues, not just the first one
-- ============================================================

-- ============================================================
-- SECTION 1: Table and Column Configuration
-- ============================================================

SELECT '=== SECTION 1: Table Configuration ===' as section;

-- Check if band_members table exists and RLS is enabled
SELECT
  '1.1 Table exists and RLS status' as check_id,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables
WHERE tablename = 'band_members';

-- Check column types
SELECT
  '1.2 Column data types' as check_id,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'band_members'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT
  '1.3 Foreign key constraints' as check_id,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'band_members';

-- Check indexes
SELECT
  '1.4 Indexes on band_members' as check_id,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'band_members';

-- ============================================================
-- SECTION 2: RLS Policies - ALL tables involved
-- ============================================================

SELECT '=== SECTION 2: RLS Policies ===' as section;

-- All policies on band_members
SELECT
  '2.1 ALL band_members policies' as check_id,
  policyname,
  cmd,
  permissive,
  roles::text,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
ORDER BY cmd, policyname;

-- Count policies by type
SELECT
  '2.2 Policy count by type' as check_id,
  cmd,
  permissive,
  COUNT(*) as count
FROM pg_policies
WHERE tablename = 'band_members'
GROUP BY cmd, permissive
ORDER BY cmd;

-- All policies on band_invites (needed for subquery)
SELECT
  '2.3 band_invites policies' as check_id,
  policyname,
  cmd,
  permissive,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- All policies on profiles (needed for subquery)
SELECT
  '2.4 profiles policies' as check_id,
  policyname,
  cmd,
  permissive,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd = 'SELECT';

-- ============================================================
-- SECTION 3: Functions
-- ============================================================

SELECT '=== SECTION 3: Functions ===' as section;

-- Check has_valid_invite function
SELECT
  '3.1 has_valid_invite function' as check_id,
  proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  prosecdef as is_security_definer,
  prorettype::regtype as return_type,
  prosrc as source_code
FROM pg_proc p
WHERE proname = 'has_valid_invite';

-- Check function permissions
SELECT
  '3.2 has_valid_invite permissions' as check_id,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'has_valid_invite';

-- Check is_user_in_band function (used in SELECT policy)
SELECT
  '3.3 is_user_in_band function' as check_id,
  proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  prosecdef as is_security_definer,
  prosrc as source_code
FROM pg_proc p
WHERE proname = 'is_user_in_band';

-- Check auth.uid() function
SELECT
  '3.4 auth.uid function' as check_id,
  n.nspname as schema,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth' AND p.proname = 'uid';

-- ============================================================
-- SECTION 4: Data Validation
-- ============================================================

SELECT '=== SECTION 4: Data Validation ===' as section;

-- Check Stephen's profile
SELECT
  '4.1 Stephens profile' as check_id,
  id,
  email,
  name,
  created_at,
  pg_typeof(id) as id_type
FROM profiles
WHERE email = 'stephenpjudy@gmail.com';

-- Check the specific invite
SELECT
  '4.2 Stephens invite' as check_id,
  id,
  band_id,
  invited_email,
  status,
  expires_at,
  expires_at > NOW() as is_valid,
  invited_by,
  created_at,
  pg_typeof(band_id) as band_id_type
FROM band_invites
WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';

-- Check if Stephen is already a member
SELECT
  '4.3 Is Stephen already a member?' as check_id,
  COUNT(*) as existing_membership_count
FROM band_members
WHERE user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
AND band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b');

-- Check who else is in the band
SELECT
  '4.4 Current band members' as check_id,
  bm.user_id,
  p.email,
  p.name,
  bm.role
FROM band_members bm
JOIN profiles p ON p.id = bm.user_id
WHERE bm.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b');

-- ============================================================
-- SECTION 5: Policy Logic Tests
-- ============================================================

SELECT '=== SECTION 5: Policy Logic Tests ===' as section;

-- Test has_valid_invite function directly
SELECT
  '5.1 has_valid_invite function test' as check_id,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as result;

-- Test the subquery that's in the policy
SELECT
  '5.2 Inline subquery test' as check_id,
  EXISTS (
    SELECT 1
    FROM band_invites bi
    WHERE bi.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    AND bi.invited_email = (
      SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    )
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  ) as result;

-- Test each part of the subquery separately
SELECT
  '5.3 Subquery parts test' as check_id,
  (SELECT COUNT(*) FROM band_invites WHERE band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')) as invites_for_band,
  (SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01') as stephens_email,
  (SELECT COUNT(*) FROM band_invites WHERE invited_email = 'stephenpjudy@gmail.com') as invites_for_stephen,
  (SELECT COUNT(*) FROM band_invites WHERE status = 'pending') as pending_invites,
  (SELECT COUNT(*) FROM band_invites WHERE expires_at > NOW()) as non_expired_invites;

-- ============================================================
-- SECTION 6: Permissions and Roles
-- ============================================================

SELECT '=== SECTION 6: Permissions and Roles ===' as section;

-- Check table ownership
SELECT
  '6.1 band_members table owner' as check_id,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'band_members';

-- Check grants on band_members
SELECT
  '6.2 Grants on band_members' as check_id,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_name = 'band_members'
AND grantee IN ('anon', 'authenticated', 'service_role', 'public');

-- Check grants on band_invites
SELECT
  '6.3 Grants on band_invites' as check_id,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'band_invites'
AND grantee IN ('anon', 'authenticated', 'service_role', 'public');

-- Check grants on profiles
SELECT
  '6.4 Grants on profiles' as check_id,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'profiles'
AND grantee IN ('anon', 'authenticated', 'service_role', 'public');

-- ============================================================
-- SECTION 7: Policy Text Analysis
-- ============================================================

SELECT '=== SECTION 7: Current INSERT Policy Analysis ===' as section;

-- Get the exact text of the current INSERT policy
SELECT
  '7.1 Current INSERT policy text' as check_id,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Check if policy references are qualified correctly
SELECT
  '7.2 Policy references analysis' as check_id,
  CASE
    WHEN with_check LIKE '%band_members.band_id%' THEN 'Uses qualified reference (band_members.band_id)'
    WHEN with_check LIKE '%band_id%' THEN 'Uses unqualified reference (band_id)'
    ELSE 'No band_id reference'
  END as band_id_reference,
  CASE
    WHEN with_check LIKE '%band_members.user_id%' THEN 'Uses qualified reference (band_members.user_id)'
    WHEN with_check LIKE '%user_id%' THEN 'Uses unqualified reference (user_id)'
    ELSE 'No user_id reference'
  END as user_id_reference
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- ============================================================
-- SECTION 8: Potential Issues Summary
-- ============================================================

SELECT '=== SECTION 8: Potential Issues ===' as section;

-- Check for multiple INSERT policies (AND logic might be applied)
SELECT
  '8.1 Multiple INSERT policies?' as check_id,
  COUNT(*) as insert_policy_count,
  CASE
    WHEN COUNT(*) > 1 THEN '⚠️ Multiple INSERT policies may be combined with AND'
    ELSE '✓ Single INSERT policy'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Check for RESTRICTIVE policies
SELECT
  '8.2 Restrictive policies?' as check_id,
  COUNT(*) as restrictive_count,
  CASE
    WHEN COUNT(*) > 0 THEN '⚠️ RESTRICTIVE policies will block even if PERMISSIVE passes'
    ELSE '✓ No RESTRICTIVE policies'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT'
AND permissive = 'RESTRICTIVE';

-- Check if profiles SELECT is permissive enough for subquery
SELECT
  '8.3 Can policy read profiles?' as check_id,
  COUNT(*) as permissive_profile_policies,
  CASE
    WHEN COUNT(*) = 0 THEN '⚠️ No SELECT policy on profiles - subquery may fail'
    ELSE '✓ SELECT policy exists on profiles'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd = 'SELECT';

-- Check if band_invites SELECT allows reading pending invites
SELECT
  '8.4 Can policy read band_invites?' as check_id,
  COUNT(*) as policies,
  CASE
    WHEN COUNT(*) = 0 THEN '⚠️ No SELECT policy on band_invites - subquery may fail'
    ELSE '✓ SELECT policy exists on band_invites'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- ============================================================
-- FINAL SUMMARY
-- ============================================================

SELECT '=== DIAGNOSTIC COMPLETE ===' as section;

SELECT
  'SUMMARY: Review all sections above to identify issues' as summary,
  'Look for ⚠️ warnings in Section 8' as action_needed;
