-- Check Dan's auth status and why login might be failing
-- Email: dan@vnkle.com
-- FIXED VERSION (removed FULL JOIN)

SELECT '=== DAN AUTH STATUS ===' as section;

-- 1. Check auth.users record
SELECT
  'Auth User Record' as check_name,
  id,
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed - THIS COULD BE THE PROBLEM'
  END as email_status,
  banned_until,
  CASE
    WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN '❌ BANNED'
    ELSE '✅ Not Banned'
  END as ban_status,
  created_at,
  last_sign_in_at,
  CASE
    WHEN last_sign_in_at IS NULL THEN '⚠️ Never signed in'
    WHEN last_sign_in_at < NOW() - INTERVAL '30 days' THEN '⚠️ Last login over 30 days ago'
    ELSE '✅ Signed in recently'
  END as sign_in_status,
  confirmation_sent_at,
  CASE
    WHEN confirmation_token IS NOT NULL THEN '⚠️ Has pending confirmation'
    ELSE '✅ No pending confirmation'
  END as confirmation_status
FROM auth.users
WHERE email = 'dan@vnkle.com';

-- 2. Check for any auth issues
SELECT
  'Potential Auth Issues' as check_name,
  CASE
    WHEN au.email_confirmed_at IS NULL THEN 'Email not confirmed'
    WHEN au.banned_until IS NOT NULL AND au.banned_until > NOW() THEN 'Account is banned'
    WHEN au.deleted_at IS NOT NULL THEN 'Account is deleted'
    WHEN au.last_sign_in_at < NOW() - INTERVAL '90 days' THEN 'Account inactive for 90+ days'
    ELSE '✅ No obvious auth issues'
  END as issue
FROM auth.users au
WHERE au.email = 'dan@vnkle.com';

-- 3. Check if password is set (encrypted_password should not be null)
SELECT
  'Password Set?' as check_name,
  CASE
    WHEN encrypted_password IS NOT NULL AND encrypted_password != '' THEN '✅ Yes'
    ELSE '❌ No - THIS IS THE PROBLEM'
  END as status,
  LENGTH(encrypted_password) as password_hash_length
FROM auth.users
WHERE email = 'dan@vnkle.com';

-- 4. Check recovery/confirmation tokens
SELECT
  'Token Status' as check_name,
  CASE WHEN confirmation_token IS NOT NULL THEN 'Has confirmation token' ELSE 'No confirmation token' END as confirmation,
  CASE WHEN recovery_token IS NOT NULL THEN 'Has recovery token' ELSE 'No recovery token' END as recovery,
  CASE WHEN email_change_token_new IS NOT NULL THEN 'Has email change token' ELSE 'No email change token' END as email_change
FROM auth.users
WHERE email = 'dan@vnkle.com';

-- 5. Check if this is a duplicate email situation
SELECT
  'Duplicate Email Check' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 1 THEN '❌ DUPLICATE EMAILS - THIS IS A PROBLEM'
    WHEN COUNT(*) = 1 THEN '✅ Unique'
    ELSE '❌ No user found'
  END as status
FROM auth.users
WHERE email = 'dan@vnkle.com';

-- 6. Show all auth.users with this email (if duplicates exist)
SELECT
  'All Records for dan@vnkle.com' as section,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE WHEN deleted_at IS NOT NULL THEN '❌ DELETED' ELSE '✅ Active' END as status
FROM auth.users
WHERE email = 'dan@vnkle.com'
ORDER BY created_at;

-- 7. Check if Dan's profile is connected to the right auth user
SELECT
  'Profile-Auth Link' as check_name,
  p.id as profile_id,
  p.email as profile_email,
  au.id as auth_id,
  au.email as auth_email,
  CASE
    WHEN p.id = au.id THEN '✅ IDs match'
    ELSE '❌ ID MISMATCH - THIS IS A PROBLEM'
  END as id_match_status
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.email = 'dan@vnkle.com';

-- 7b. Check reverse (auth user without profile)
SELECT
  'Auth Without Profile?' as check_name,
  au.id as auth_id,
  au.email as auth_email,
  p.id as profile_id,
  CASE
    WHEN p.id IS NULL THEN '❌ AUTH USER HAS NO PROFILE'
    ELSE '✅ Profile exists'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'dan@vnkle.com';
