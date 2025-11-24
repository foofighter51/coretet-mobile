-- Simple fix for Dan's band creation issue
-- User ID: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182

-- DIAGNOSIS FIRST
-- Run this section to see what's wrong

SELECT '=== DIAGNOSIS ===' as section;

-- Check 1: Does Dan's profile exist?
SELECT
  'Dan Profile Exists?' as check_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ YES' ELSE '❌ NO' END as result,
  COUNT(*) as count
FROM profiles
WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- Check 2: Does Dan have a personal band?
SELECT
  'Dan Has Personal Band?' as check_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ YES' ELSE '❌ NO - THIS IS THE PROBLEM' END as result,
  COUNT(*) as count
FROM bands b
JOIN band_members bm ON bm.band_id = b.id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
AND b.is_personal = true;

-- Check 3: What bands does Dan have?
SELECT
  'Dan''s Current Bands' as check_name,
  b.name,
  b.is_personal,
  bm.role
FROM bands b
JOIN band_members bm ON bm.band_id = b.id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- Check 4: Current bands INSERT policy
SELECT
  'Current Bands INSERT Policy' as check_name,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

SELECT '=== FIX ===' as section;

-- FIX: Create Dan's personal band if missing
DO $$
DECLARE
  dan_user_id UUID := '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';
  dan_personal_band_id UUID;
  personal_band_exists INT;
BEGIN
  -- Check if personal band exists
  SELECT COUNT(*) INTO personal_band_exists
  FROM bands b
  JOIN band_members bm ON bm.band_id = b.id
  WHERE bm.user_id = dan_user_id
  AND b.is_personal = true;

  IF personal_band_exists = 0 THEN
    -- Create personal band
    INSERT INTO bands (name, created_by, is_personal)
    VALUES ('Personal', dan_user_id, true)
    RETURNING id INTO dan_personal_band_id;

    -- Add Dan as owner
    INSERT INTO band_members (band_id, user_id, role)
    VALUES (dan_personal_band_id, dan_user_id, 'owner');

    RAISE NOTICE '✅ Created personal band for Dan: %', dan_personal_band_id;
  ELSE
    RAISE NOTICE '✅ Dan already has a personal band';
  END IF;
END $$;

-- VERIFY THE FIX
SELECT '=== VERIFICATION ===' as section;

-- Verify Dan now has a personal band
SELECT
  'Dan Has Personal Band Now?' as check_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ YES - FIXED!' ELSE '❌ STILL NO' END as result,
  b.id as band_id,
  b.name as band_name
FROM bands b
JOIN band_members bm ON bm.band_id = b.id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
AND b.is_personal = true
GROUP BY b.id, b.name;

-- Show all Dan's bands
SELECT
  'All Dan''s Bands After Fix' as check_name,
  b.id,
  b.name,
  b.is_personal,
  bm.role,
  b.created_at
FROM bands b
JOIN band_members bm ON bm.band_id = b.id
WHERE bm.user_id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'
ORDER BY b.created_at;
