-- Comprehensive Migration Verification Script
-- Run this AFTER applying all 6 migrations
-- Purpose: Confirm all schema changes applied correctly

-- ============================================================
-- SECTION 1: Table Existence Check
-- ============================================================

SELECT '=== TABLE EXISTENCE CHECK ===' as section;

SELECT
  table_name,
  CASE
    WHEN table_name IN ('profiles', 'bands', 'tracks', 'playlists', 'playlist_followers') THEN 'PRE-EXISTING'
    WHEN table_name IN ('shared_playlists', 'playlist_access_grants', 'sms_credits', 'producer_waitlist') THEN 'NEWLY CREATED'
    ELSE 'OTHER'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'bands',
    'shared_playlists',
    'playlist_access_grants',
    'playlist_followers',
    'sms_credits',
    'producer_waitlist'
  )
ORDER BY status, table_name;

-- Expected: 7 tables (3 pre-existing, 4 newly created)

-- ============================================================
-- SECTION 2: Profiles Table - New Columns
-- ============================================================

SELECT '=== PROFILES TABLE - NEW COLUMNS ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'phone_number',
    'tier',
    'storage_used',
    'storage_limit',
    'stripe_customer_id',
    'stripe_subscription_id',
    'subscription_status'
  )
ORDER BY column_name;

-- Expected: 7 columns, all exist

-- ============================================================
-- SECTION 3: Profiles Data - Tier Distribution
-- ============================================================

SELECT '=== PROFILES DATA - TIER DISTRIBUTION ===' as section;

SELECT
  tier,
  COUNT(*) as user_count,
  COUNT(phone_number) as users_with_phone,
  COUNT(*) - COUNT(phone_number) as users_without_phone,
  SUM(storage_used) as total_storage_used,
  AVG(storage_limit)::BIGINT as avg_storage_limit
FROM profiles
GROUP BY tier
ORDER BY tier;

-- Expected: All users in 'free' tier, storage_limit = 1073741824 (1GB)

-- ============================================================
-- SECTION 4: Bands Table - New Columns
-- ============================================================

SELECT '=== BANDS TABLE - NEW COLUMNS ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bands'
  AND column_name IN ('storage_used', 'storage_limit', 'max_members')
ORDER BY column_name;

-- Expected: 3 columns exist

-- ============================================================
-- SECTION 5: Bands Data - Storage Limits
-- ============================================================

SELECT '=== BANDS DATA - STORAGE LIMITS ===' as section;

SELECT
  COUNT(*) as total_bands,
  SUM(storage_used) as total_storage_used,
  AVG(storage_limit)::BIGINT as avg_storage_limit,
  AVG(max_members)::INT as avg_max_members
FROM bands;

-- Expected: storage_limit = 26843545600 (25GB), max_members = 10

-- ============================================================
-- SECTION 6: Triggers Check
-- ============================================================

SELECT '=== STORAGE TRIGGERS ===' as section;

SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
  'track_insert_storage_trigger',
  'track_delete_storage_trigger'
)
ORDER BY trigger_name;

-- Expected: 2 triggers on 'tracks' table

-- ============================================================
-- SECTION 7: Functions Check
-- ============================================================

SELECT '=== STORAGE FUNCTIONS ===' as section;

SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name IN (
  'update_storage_on_track_insert',
  'update_storage_on_track_delete'
)
ORDER BY routine_name;

-- Expected: 2 functions, both return 'trigger'

-- ============================================================
-- SECTION 8: New Tables - Shared Playlists
-- ============================================================

SELECT '=== SHARED_PLAYLISTS TABLE ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shared_playlists'
ORDER BY ordinal_position;

-- Expected: id, playlist_id, shared_by, share_token, expires_at, is_active, total_access_grants, total_plays, created_at, updated_at

-- ============================================================
-- SECTION 9: New Tables - Playlist Access Grants
-- ============================================================

SELECT '=== PLAYLIST_ACCESS_GRANTS TABLE ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'playlist_access_grants'
ORDER BY ordinal_position;

-- Expected: id, shared_playlist_id, phone_number_hash, access_code, is_used, first_accessed_at, last_accessed_at, access_count, expires_at, is_revoked, claimed_by, claimed_at, created_at

-- ============================================================
-- SECTION 10: Updated Table - Playlist Followers
-- ============================================================

SELECT '=== PLAYLIST_FOLLOWERS TABLE - SOURCE COLUMN ===' as section;

SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'playlist_followers'
  AND column_name = 'source';

-- Expected: source TEXT DEFAULT 'manual'

-- ============================================================
-- SECTION 11: SMS Credits Table
-- ============================================================

SELECT '=== SMS_CREDITS TABLE ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sms_credits'
ORDER BY ordinal_position;

-- Expected: id, user_id, credits_total, credits_used, credits_remaining, period_start, period_end, created_at

-- ============================================================
-- SECTION 12: SMS Credits Data
-- ============================================================

SELECT '=== SMS_CREDITS DATA - BY TIER ===' as section;

SELECT
  p.tier,
  COUNT(sc.id) as user_count,
  SUM(sc.credits_total) as total_credits,
  SUM(sc.credits_used) as total_used,
  SUM(sc.credits_remaining) as total_remaining
FROM sms_credits sc
JOIN profiles p ON sc.user_id = p.id
WHERE sc.period_end > CURRENT_DATE
GROUP BY p.tier
ORDER BY p.tier;

-- Expected: All free tier users have 10 credits each

-- ============================================================
-- SECTION 13: Producer Waitlist Table
-- ============================================================

SELECT '=== PRODUCER_WAITLIST TABLE ===' as section;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'producer_waitlist'
ORDER BY ordinal_position;

-- Expected: id, email, user_id, name, reason, requested_at

-- ============================================================
-- SECTION 14: Indexes Check
-- ============================================================

SELECT '=== NEW INDEXES ===' as section;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_profiles_phone_unique',
    'idx_profiles_phone',
    'idx_profiles_email',
    'idx_profiles_tier',
    'idx_profiles_subscription_status',
    'idx_bands_storage',
    'idx_shared_playlists_token',
    'idx_shared_playlists_playlist',
    'idx_playlist_access_grants_code',
    'idx_playlist_access_grants_phone',
    'idx_playlist_followers_source',
    'idx_sms_credits_user_period',
    'idx_producer_waitlist_email'
  )
ORDER BY tablename, indexname;

-- Expected: 13 indexes created

-- ============================================================
-- SECTION 15: Phone Number Cleanup Verification
-- ============================================================

SELECT '=== PHONE NUMBER CLEANUP ===' as section;

SELECT
  COUNT(*) as total_users,
  COUNT(phone_number) as users_with_phone,
  COUNT(CASE WHEN phone_number = '' THEN 1 END) as empty_strings,
  COUNT(CASE WHEN phone_number IS NULL THEN 1 END) as nulls
FROM profiles;

-- Expected: empty_strings = 0 (all converted to NULL)

-- ============================================================
-- SECTION 16: Foreign Key Validation
-- ============================================================

SELECT '=== FOREIGN KEY CONSTRAINTS ===' as section;

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'shared_playlists',
    'playlist_access_grants',
    'sms_credits',
    'producer_waitlist'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Expected: All foreign keys reference correct tables (profiles, playlists, shared_playlists)

-- ============================================================
-- SECTION 17: Data Type Validation
-- ============================================================

SELECT '=== DATA TYPE VALIDATION (UUID vs TEXT) ===' as section;

SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('shared_playlists', 'playlist_access_grants', 'sms_credits')
  AND column_name IN ('id', 'user_id', 'shared_by', 'claimed_by', 'shared_playlist_id')
ORDER BY table_name, column_name;

-- Expected: All should be 'uuid' (not 'text')

-- ============================================================
-- FINAL SUMMARY
-- ============================================================

SELECT '=== MIGRATION SUCCESS SUMMARY ===' as section;

SELECT
  'Profiles - phone_number unique index' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_phone_unique'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
UNION ALL
SELECT
  'Profiles - tier column added',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tier'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'Bands - storage columns added',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'bands' AND column_name = 'storage_limit'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'Triggers - track_insert_storage_trigger',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'track_insert_storage_trigger'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'Triggers - track_delete_storage_trigger',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'track_delete_storage_trigger'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'New table - shared_playlists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'shared_playlists'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'New table - playlist_access_grants',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'playlist_access_grants'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'New table - sms_credits',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'sms_credits'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'New table - producer_waitlist',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'producer_waitlist'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'Updated table - playlist_followers.source',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'playlist_followers' AND column_name = 'source'
  ) THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'SMS credits initialized',
  CASE WHEN (SELECT COUNT(*) FROM sms_credits) > 0
  THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT
  'No empty string phone numbers',
  CASE WHEN (SELECT COUNT(*) FROM profiles WHERE phone_number = '') = 0
  THEN '✅ PASS' ELSE '❌ FAIL' END;

-- ============================================================
-- END OF VERIFICATION
-- ============================================================

SELECT '=== VERIFICATION COMPLETE ===' as section;
SELECT 'Review results above. All checks should show ✅ PASS' as instructions;
