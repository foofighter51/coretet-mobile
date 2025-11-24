-- Find all users who are missing personal bands
-- This can happen if:
-- 1. User signed up before personal bands migration
-- 2. Migration didn't run correctly for some users
-- 3. User's profile exists but personal band wasn't created

-- Check 1: Users with profiles but no personal band
SELECT
  '1. Users Missing Personal Bands' as check_type,
  p.id as user_id,
  p.email,
  p.name,
  p.created_at as profile_created,
  (SELECT COUNT(*) FROM band_members WHERE user_id = p.id) as total_bands,
  (SELECT COUNT(*) FROM bands b JOIN band_members bm ON bm.band_id = b.id WHERE bm.user_id = p.id AND b.is_personal = true) as personal_bands
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM bands b
  JOIN band_members bm ON bm.band_id = b.id
  WHERE bm.user_id = p.id
  AND b.is_personal = true
)
ORDER BY p.created_at;

-- Check 2: Auth users without profiles (different problem)
SELECT
  '2. Auth Users Without Profiles' as check_type,
  au.id as user_id,
  au.email,
  au.created_at as auth_created,
  au.last_sign_in_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ORDER BY au.created_at;

-- Check 3: Summary stats
SELECT
  '3. Summary Statistics' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(DISTINCT created_by) FROM bands WHERE is_personal = true) as users_with_personal_bands,
  (SELECT COUNT(*) FROM profiles WHERE NOT EXISTS (
    SELECT 1 FROM bands b JOIN band_members bm ON bm.band_id = b.id
    WHERE bm.user_id = profiles.id AND b.is_personal = true
  )) as users_missing_personal_bands;

-- Check 4: Dan specifically
SELECT
  '4. Dan Specific Check' as check_type,
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182' as user_id,
  'dan@vnkle.com' as email,
  (SELECT COUNT(*) FROM profiles WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182') as has_profile,
  (SELECT COUNT(*) FROM bands b JOIN band_members bm ON bm.band_id = b.id
   WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182' AND b.is_personal = true) as has_personal_band,
  (SELECT COUNT(*) FROM band_members WHERE user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182') as total_bands;
