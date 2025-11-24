-- ============================================================
-- DEBUG: Why is RLS still failing when validation passes?
-- ============================================================
-- The validation query works, but the actual INSERT fails
-- This means we need to check what auth.uid() returns during INSERT
-- ============================================================

-- Check what the RLS policy actually sees
-- This simulates what happens during the INSERT operation

-- First, verify the policy exists and is correct
SELECT
  'Current RLS Policy' as check_type,
  policyname,
  cmd,
  CASE
    WHEN with_check LIKE '%auth.uid()%' THEN '✅ Uses auth.uid()'
    ELSE '❌ Missing auth.uid()'
  END as has_auth,
  CASE
    WHEN with_check LIKE '%band_invites%' THEN '✅ Checks invites'
    ELSE '❌ Missing invite check'
  END as has_invite_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Now let's manually test the exact conditions
-- Simulate Stephen's user context: 97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01

-- TEST: Does Stephen have a valid invite for this band?
SELECT
  'Stephen Invite Check' as test_name,
  bi.band_id,
  bi.invited_email,
  bi.status,
  bi.expires_at > NOW() as is_valid,
  p.id as stephens_user_id,
  p.email as stephens_email,
  EXISTS (
    SELECT 1 FROM band_invites bi2
    JOIN profiles p2 ON p2.email = bi2.invited_email
    WHERE bi2.band_id = bi.band_id
    AND p2.id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
    AND bi2.status = 'pending'
    AND bi2.expires_at > NOW()
  ) as would_pass_rls
FROM band_invites bi
JOIN profiles p ON p.email = bi.invited_email
WHERE bi.invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';

-- TEST: Check if there's any ambiguity in the subquery
SELECT
  'Subquery Test' as test_name,
  bi.band_id,
  bi.invited_email,
  p.id as profile_id,
  p.email as profile_email
FROM band_invites bi
JOIN profiles p ON p.email = bi.invited_email
WHERE bi.invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b'
AND bi.status = 'pending'
AND bi.expires_at > NOW();

-- TEST: Is there a duplicate profile or invite issue?
SELECT
  'Duplicate Check' as test_name,
  COUNT(*) as profile_count
FROM profiles
WHERE email = 'stephenpjudy@gmail.com';

SELECT
  'Active Invites for Stephen' as test_name,
  COUNT(*) as invite_count
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com'
AND status = 'pending'
AND expires_at > NOW();
