-- Fix for Dan's user account and band creation issues
-- Run this in Supabase SQL Editor

-- Step 1: Ensure Dan's profile exists
-- First, get Dan's auth user ID
DO $$
DECLARE
  dan_auth_id UUID;
BEGIN
  -- Get Dan's auth user ID
  SELECT id INTO dan_auth_id
  FROM auth.users
  WHERE email = 'dan@vnkle.com';

  IF dan_auth_id IS NOT NULL THEN
    -- Upsert Dan's profile to ensure it exists
    INSERT INTO profiles (id, email, name, created_at, updated_at)
    VALUES (
      dan_auth_id,
      'dan@vnkle.com',
      'Dan',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();

    RAISE NOTICE 'Profile created/updated for Dan (%))', dan_auth_id;
  ELSE
    RAISE NOTICE 'Auth user not found for dan@vnkle.com';
  END IF;
END $$;

-- Step 2: Check current bands INSERT policy
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- Step 3: Fix bands INSERT policy if needed
-- The current policy should allow any authenticated user to create a band
-- But let's make sure it's using UUID type correctly (not TEXT)

DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;

CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Step 4: Verify band_members INSERT policy allows first member
-- This should already be correct from our previous fixes

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- Step 5: Test band creation for Dan
-- Get Dan's user ID and verify policy would pass
SELECT
  au.id as user_id,
  au.email,
  (au.id IS NOT NULL) as "can_create_band",
  (SELECT COUNT(*) FROM profiles WHERE id = au.id) as "profile_exists",
  (SELECT COUNT(*) FROM band_members WHERE user_id = au.id) as "existing_bands"
FROM auth.users au
WHERE au.email = 'dan@vnkle.com';

-- Step 6: Create Dan's personal band if it doesn't exist
DO $$
DECLARE
  dan_auth_id UUID;
  dan_band_id UUID;
  existing_personal_band_count INT;
BEGIN
  -- Get Dan's auth user ID
  SELECT id INTO dan_auth_id
  FROM auth.users
  WHERE email = 'dan@vnkle.com';

  IF dan_auth_id IS NOT NULL THEN
    -- Check if Dan already has a personal band
    SELECT COUNT(*) INTO existing_personal_band_count
    FROM bands b
    INNER JOIN band_members bm ON bm.band_id = b.id
    WHERE bm.user_id = dan_auth_id
    AND b.is_personal = true;

    IF existing_personal_band_count = 0 THEN
      -- Create personal band for Dan
      INSERT INTO bands (name, created_by, is_personal)
      VALUES ('Dan''s Personal Band', dan_auth_id, true)
      RETURNING id INTO dan_band_id;

      -- Add Dan as owner
      INSERT INTO band_members (band_id, user_id, role)
      VALUES (dan_band_id, dan_auth_id, 'owner');

      RAISE NOTICE 'Created personal band for Dan: %', dan_band_id;
    ELSE
      RAISE NOTICE 'Dan already has a personal band';
    END IF;
  ELSE
    RAISE NOTICE 'Auth user not found for dan@vnkle.com';
  END IF;
END $$;

-- Step 7: Verify Dan's setup is complete
SELECT
  'Final Verification' as check_type,
  au.id as user_id,
  au.email as auth_email,
  p.email as profile_email,
  p.name as profile_name,
  COUNT(DISTINCT bm.band_id) as band_count,
  COUNT(DISTINCT CASE WHEN b.is_personal THEN b.id END) as personal_band_count
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN band_members bm ON bm.user_id = au.id
LEFT JOIN bands b ON b.id = bm.band_id
WHERE au.email = 'dan@vnkle.com'
GROUP BY au.id, au.email, p.email, p.name;
