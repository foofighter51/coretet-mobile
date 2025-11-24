-- Debug Stephen's invite acceptance issue
-- Invite token: 4454cfbc-7a25-4e5f-a94a-9da8ceadc63b

-- 1. Check if the invite exists and is valid
SELECT
  'INVITE STATUS' as check_type,
  id,
  band_id,
  invited_email,
  status,
  expires_at,
  expires_at > NOW() as is_valid,
  invited_by
FROM band_invites
WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';

-- 2. Check if Stephen has a profile with email stephenpjudy@gmail.com
SELECT
  'STEPHEN PROFILE' as check_type,
  id,
  email,
  name,
  created_at
FROM profiles
WHERE email = 'stephenpjudy@gmail.com';

-- 3. Check if Stephen is already a member of the band
SELECT
  'EXISTING MEMBERSHIP' as check_type,
  bm.id,
  bm.band_id,
  bm.user_id,
  bm.role,
  p.email
FROM band_members bm
JOIN profiles p ON p.id = bm.user_id
WHERE p.email = 'stephenpjudy@gmail.com'
AND bm.band_id = (
  SELECT band_id FROM band_invites
  WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b'
);

-- 4. Check current RLS policy on band_members
SELECT
  'BAND_MEMBERS RLS POLICY' as check_type,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';
