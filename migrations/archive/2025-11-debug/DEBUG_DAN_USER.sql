-- Diagnostic SQL to check Dan's user state
-- Run this in Supabase SQL Editor

-- 1. Check if auth user exists
SELECT
  'Auth User' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'dan@vnkle.com';

-- 2. Check if profile exists
SELECT
  'Profile' as check_type,
  id,
  email,
  name,
  phone,
  created_at,
  updated_at
FROM profiles
WHERE email = 'dan@vnkle.com';

-- 3. Check if there's a profile with the auth user's ID
SELECT
  'Profile by Auth ID' as check_type,
  p.id,
  p.email,
  p.name,
  au.email as auth_email
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'dan@vnkle.com';

-- 4. Check band_members for this user
SELECT
  'Band Membership' as check_type,
  bm.id,
  bm.band_id,
  bm.user_id,
  bm.role,
  b.name as band_name
FROM auth.users au
LEFT JOIN band_members bm ON bm.user_id = au.id
LEFT JOIN bands b ON b.id = bm.band_id
WHERE au.email = 'dan@vnkle.com';

-- 5. Test if the bands INSERT policy would work
-- (This simulates what happens when creating a band)
SELECT
  'Policy Check' as check_type,
  au.id as user_id,
  au.email,
  (au.id IS NOT NULL) as "auth.uid() is not null",
  (SELECT COUNT(*) FROM profiles WHERE id = au.id) as "profile_exists"
FROM auth.users au
WHERE au.email = 'dan@vnkle.com';

-- 6. Check for any pending invites
SELECT
  'Pending Invites' as check_type,
  id,
  band_id,
  invited_email,
  status,
  expires_at,
  created_at
FROM band_invites
WHERE invited_email = 'dan@vnkle.com'
ORDER BY created_at DESC;
