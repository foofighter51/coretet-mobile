-- Check Dan's specific account state
-- User ID: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182

-- 1. Check if Dan's profile exists in profiles table
SELECT
  '1. Profile Check' as step,
  id,
  email,
  name,
  phone,
  created_at
FROM profiles
WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- 2. Check Dan's band memberships
SELECT
  '2. Band Memberships' as step,
  bm.id,
  bm.band_id,
  bm.user_id,
  bm.role,
  bm.joined_at,
  b.name as band_name,
  b.is_personal,
  b.created_by
FROM band_members bm
JOIN bands b ON b.id = bm.band_id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
ORDER BY bm.joined_at;

-- 3. Check if Dan has a personal band
SELECT
  '3. Personal Band Check' as step,
  b.id as band_id,
  b.name,
  b.is_personal,
  b.created_at,
  bm.role
FROM bands b
JOIN band_members bm ON bm.band_id = b.id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
AND b.is_personal = true;

-- 4. Check all bands Dan created
SELECT
  '4. Bands Created by Dan' as step,
  id,
  name,
  is_personal,
  created_by,
  created_at
FROM bands
WHERE created_by = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
ORDER BY created_at;

-- 5. Simulate the INSERT policy check
SELECT
  '5. INSERT Policy Simulation' as step,
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID as user_id,
  ('929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID IS NOT NULL) as "auth.uid() check passes",
  (SELECT COUNT(*) FROM profiles WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182') as "profile exists";

-- 6. Check current bands INSERT policy
SELECT
  '6. Current Bands INSERT Policy' as step,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- 7. Check if Dan has any tracks (old data indicator)
SELECT
  '7. Dan''s Tracks (legacy data check)' as step,
  COUNT(*) as track_count
FROM tracks
WHERE user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- 8. Test actual INSERT as Dan (if we had his session)
-- This simulates what the policy would evaluate
SELECT
  '8. Would INSERT Work?' as step,
  CASE
    WHEN '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::UUID IS NOT NULL THEN 'YES - Policy should allow'
    ELSE 'NO - Policy would block'
  END as result;
