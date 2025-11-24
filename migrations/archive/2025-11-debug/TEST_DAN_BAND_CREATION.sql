-- Test Dan's band creation manually to isolate the issue
-- User ID: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182

-- 1. Check current RLS policies on bands table
SELECT
  '=== BANDS TABLE POLICIES ===' as section;

SELECT
  policyname,
  cmd,
  CASE
    WHEN cmd = 'INSERT' THEN 'WITH CHECK: ' || COALESCE(with_check, 'NULL')
    WHEN cmd = 'SELECT' THEN 'USING: ' || COALESCE(qual, 'NULL')
    WHEN cmd = 'UPDATE' THEN 'USING: ' || COALESCE(qual, 'NULL') || ' | WITH CHECK: ' || COALESCE(with_check, 'NULL')
    WHEN cmd = 'DELETE' THEN 'USING: ' || COALESCE(qual, 'NULL')
  END as policy_definition
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd, policyname;

-- 2. Try to manually INSERT a test band as Dan
-- This will either succeed or show the exact policy violation
SELECT
  '=== MANUAL INSERT TEST ===' as section;

-- First, let's see what would happen (dry run)
SELECT
  'Test Band Creation' as test_name,
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID as user_id,
  'Test Band for Dan' as band_name,
  ('929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID IS NOT NULL) as "passes_with_check",
  (SELECT COUNT(*) FROM profiles WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182') as "profile_exists";

-- 3. Check band_members INSERT policy
-- Because band creation also inserts into band_members
SELECT
  '=== BAND_MEMBERS TABLE POLICIES ===' as section;

SELECT
  policyname,
  cmd,
  CASE
    WHEN cmd = 'INSERT' THEN 'WITH CHECK: ' || COALESCE(with_check, 'NULL')
    ELSE 'USING: ' || COALESCE(qual, 'NULL')
  END as policy_definition
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT'
ORDER BY policyname;

-- 4. Test if band_members INSERT would work
SELECT
  '=== BAND_MEMBERS INSERT TEST ===' as section;

-- Check the complex band_members INSERT policy
WITH test_user AS (
  SELECT '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID as user_id,
         'test-band-id'::UUID as test_band_id
)
SELECT
  'Band Members Policy Check' as test_name,
  tu.user_id,
  -- Check 1: Has valid invite (should be false for new band)
  (SELECT EXISTS(
    SELECT 1 FROM band_invites bi
    WHERE bi.band_id = tu.test_band_id
    AND bi.invited_email = (SELECT email FROM profiles WHERE id = tu.user_id)
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  )) as "has_valid_invite",
  -- Check 2: Is admin of this band (should be false for new band)
  (tu.test_band_id IN (
    SELECT bm.band_id FROM band_members bm
    WHERE bm.user_id = tu.user_id
    AND bm.role IN ('owner', 'admin')
  )) as "is_admin_of_band",
  -- Check 3: Band has no members yet (should be true for new band)
  (NOT EXISTS (
    SELECT 1 FROM band_members bm WHERE bm.band_id = tu.test_band_id
  )) as "band_has_no_members",
  -- Overall: Would pass?
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM band_members bm WHERE bm.band_id = tu.test_band_id)
    THEN '✅ YES - first member condition passes'
    ELSE '❌ NO - policy would block'
  END as "would_insert_work"
FROM test_user tu;

-- 5. Check if there's a problem with the profiles table
SELECT
  '=== PROFILES TABLE CHECK ===' as section;

SELECT
  id,
  email,
  name,
  created_at,
  updated_at
FROM profiles
WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- 6. Actual test: Try to create a real test band for Dan
-- (UNCOMMENT TO RUN - this will actually create a band)
/*
SELECT '=== ACTUAL INSERT TEST ===' as section;

BEGIN;

-- Insert band
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Dan Test Band', '929a7b64-b93e-430e-8a6f-7d0cc2c8d182', false)
RETURNING id, name, created_by, created_at;

-- If above succeeds, try adding Dan as owner
INSERT INTO band_members (band_id, user_id, role)
SELECT
  (SELECT id FROM bands WHERE name = 'Dan Test Band' AND created_by = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182' ORDER BY created_at DESC LIMIT 1),
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182',
  'owner'
RETURNING id, band_id, user_id, role, joined_at;

ROLLBACK; -- Remove this to actually create the band
*/

-- 7. Final check: What's Dan's current auth state in Supabase?
SELECT
  '=== AUTH STATE ===' as section;

SELECT
  id as user_id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  (last_sign_in_at > NOW() - INTERVAL '1 day') as "signed_in_recently"
FROM auth.users
WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';
