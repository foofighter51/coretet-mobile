-- ============================================================
-- DEBUG: Check auth context and RLS evaluation
-- ============================================================
-- This will help us understand what auth.uid() returns during the INSERT
-- ============================================================

-- First, check if there are any other conflicting policies
SELECT
  'All band_members policies' as check,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
ORDER BY cmd, policyname;

-- Check if RLS is enabled
SELECT
  'RLS Status' as check,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'band_members';

-- Check if there are any RESTRICTIVE policies that might block
SELECT
  'Restrictive Policies' as check,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'band_members'
AND permissive = 'RESTRICTIVE';

-- Test the function with all invites for Stephen
SELECT
  'All Stephens invites' as check,
  bi.band_id,
  bi.invited_email,
  bi.status,
  bi.expires_at > NOW() as valid,
  has_valid_invite('97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid, bi.band_id) as function_result
FROM band_invites bi
WHERE bi.invited_email = 'stephenpjudy@gmail.com';
