-- ============================================================================
-- Database Verification Queries for Storage Quota System
-- Run these in Supabase SQL Editor to verify everything is set up correctly
-- ============================================================================

-- ============================================================================
-- STEP 1: Check if storage columns exist in profiles table
-- ============================================================================
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('storage_used', 'storage_limit', 'tier')
ORDER BY column_name;

-- Expected result:
-- storage_limit | bigint | 1073741824 | NO
-- storage_used  | bigint | 0          | NO
-- tier          | text   | 'free'     | NO

-- ============================================================================
-- STEP 2: Check your specific user's quota data
-- ============================================================================
SELECT
  id,
  email,
  name,
  storage_used,
  storage_limit,
  tier,
  CASE
    WHEN storage_limit > 0 THEN (storage_used::float / storage_limit::float * 100)
    ELSE 0
  END as percent_used,
  pg_size_pretty(storage_used::bigint) as used_formatted,
  pg_size_pretty(storage_limit::bigint) as limit_formatted
FROM profiles
WHERE email = 'ericexley@gmail.com';

-- Expected result:
-- You should see your email with storage_used and storage_limit values
-- If storage_used or storage_limit is NULL, the migration wasn't applied

-- ============================================================================
-- STEP 3: Check how many tracks you have and their total size
-- ============================================================================
SELECT
  p.email,
  COUNT(t.id) as track_count,
  COALESCE(SUM(t.file_size), 0) as actual_track_storage,
  p.storage_used as profile_reports,
  p.storage_used - COALESCE(SUM(t.file_size), 0) as discrepancy,
  pg_size_pretty(COALESCE(SUM(t.file_size), 0)::bigint) as total_size_formatted
FROM profiles p
LEFT JOIN tracks t ON t.created_by = p.id
WHERE p.email = 'ericexley@gmail.com'
GROUP BY p.id, p.email, p.storage_used;

-- Expected result:
-- track_count: Number of tracks you've uploaded
-- actual_track_storage: Sum of all your track file sizes
-- profile_reports: What profiles.storage_used says
-- discrepancy: Should be 0 or very close to 0 (< 1000 bytes)

-- ============================================================================
-- STEP 4: If migration was NOT applied, run this to fix it
-- ============================================================================
-- ONLY RUN THIS IF STEP 1 SHOWED NULL VALUES

DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'storage_used'
  ) THEN
    ALTER TABLE profiles ADD COLUMN storage_used BIGINT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'storage_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN storage_limit BIGINT DEFAULT 1073741824; -- 1GB
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'free'
      CHECK (tier IN ('free', 'band', 'producer'));
  END IF;
END $$;

-- Update existing users to have proper values
UPDATE profiles
SET
  storage_used = COALESCE(storage_used, 0),
  storage_limit = COALESCE(storage_limit, 1073741824),
  tier = COALESCE(tier, 'free')
WHERE storage_used IS NULL
   OR storage_limit IS NULL
   OR tier IS NULL;

-- ============================================================================
-- STEP 5: Recalculate storage for your user (sync with actual tracks)
-- ============================================================================
-- Run this to fix any discrepancies between profile.storage_used and actual track sizes

UPDATE profiles p
SET storage_used = (
  SELECT COALESCE(SUM(t.file_size), 0)
  FROM tracks t
  WHERE t.created_by = p.id
)
WHERE p.email = 'ericexley@gmail.com';

-- Verify it worked
SELECT
  email,
  storage_used,
  storage_limit,
  (storage_used::float / storage_limit::float * 100) as percent_used,
  pg_size_pretty(storage_used::bigint) as used_formatted,
  pg_size_pretty(storage_limit::bigint) as limit_formatted,
  (SELECT COUNT(*) FROM tracks WHERE created_by = profiles.id) as track_count
FROM profiles
WHERE email = 'ericexley@gmail.com';

-- ============================================================================
-- STEP 6: Check ALL users' quota accuracy (optional - for admin)
-- ============================================================================
SELECT
  p.id,
  p.email,
  p.storage_used as quota_tracking,
  COALESCE(SUM(t.file_size), 0) as actual_storage,
  p.storage_used - COALESCE(SUM(t.file_size), 0) as discrepancy,
  CASE
    WHEN ABS(p.storage_used - COALESCE(SUM(t.file_size), 0)) < 1000 THEN '✅ Accurate'
    ELSE '❌ Discrepancy'
  END as status,
  pg_size_pretty(p.storage_used::bigint) as quota_formatted,
  pg_size_pretty(COALESCE(SUM(t.file_size), 0)::bigint) as actual_formatted
FROM profiles p
LEFT JOIN tracks t ON t.created_by = p.id
GROUP BY p.id, p.email, p.storage_used
HAVING ABS(p.storage_used - COALESCE(SUM(t.file_size), 0)) > 0
ORDER BY ABS(p.storage_used - COALESCE(SUM(t.file_size), 0)) DESC
LIMIT 20;

-- ============================================================================
-- STEP 7: Fix ALL users' quota discrepancies (if found in Step 6)
-- ============================================================================
-- ONLY RUN THIS IF STEP 6 SHOWED DISCREPANCIES

UPDATE profiles p
SET storage_used = (
  SELECT COALESCE(SUM(t.file_size), 0)
  FROM tracks t
  WHERE t.created_by = p.id
);

-- Verify fix worked - should return 0 rows
SELECT
  email,
  storage_used,
  (SELECT COALESCE(SUM(file_size), 0) FROM tracks WHERE created_by = profiles.id) as calc_storage,
  storage_used - (SELECT COALESCE(SUM(file_size), 0) FROM tracks WHERE created_by = profiles.id) as diff
FROM profiles
WHERE storage_used != (SELECT COALESCE(SUM(file_size), 0) FROM tracks WHERE created_by = profiles.id)
LIMIT 10;

-- ============================================================================
-- SUMMARY CHECK - Run this last to verify everything is working
-- ============================================================================
SELECT
  '✅ Columns exist' as check_name,
  CASE
    WHEN COUNT(*) = 3 THEN 'PASS'
    ELSE 'FAIL - Run Step 4'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('storage_used', 'storage_limit', 'tier')

UNION ALL

SELECT
  '✅ Your profile has quota data' as check_name,
  CASE
    WHEN storage_used IS NOT NULL AND storage_limit IS NOT NULL THEN 'PASS'
    ELSE 'FAIL - Run Step 4'
  END as status
FROM profiles
WHERE email = 'ericexley@gmail.com'

UNION ALL

SELECT
  '✅ Quota matches actual storage' as check_name,
  CASE
    WHEN ABS(
      p.storage_used - COALESCE((
        SELECT SUM(t.file_size)
        FROM tracks t
        WHERE t.created_by = p.id
      ), 0)
    ) < 1000 THEN 'PASS'
    ELSE 'FAIL - Run Step 5'
  END as status
FROM profiles p
WHERE p.email = 'ericexley@gmail.com';

-- ============================================================================
-- Expected Final Result:
-- ============================================================================
-- ✅ Columns exist                    | PASS
-- ✅ Your profile has quota data      | PASS
-- ✅ Quota matches actual storage     | PASS
--
-- If all three say PASS, your database is ready!
-- If any say FAIL, run the step indicated in the status column.
