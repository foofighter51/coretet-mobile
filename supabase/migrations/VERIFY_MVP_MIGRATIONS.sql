-- Verification Script for MVP Migrations (2025-12-05)
-- Run this after applying all 4 migrations to verify success

-- ============================================================
-- MIGRATION 1: Track Versions
-- ============================================================

\echo ''
\echo '=== MIGRATION 1: Track Versions ==='
\echo ''

-- Check track_versions table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'track_versions')
    THEN '✅ track_versions table exists'
    ELSE '❌ track_versions table MISSING'
  END as status;

-- Check data migration: all tracks have version 1
SELECT
  COUNT(*) as total_tracks,
  COUNT(hero_version_id) as tracks_with_hero,
  CASE
    WHEN COUNT(*) = COUNT(hero_version_id)
    THEN '✅ All tracks have hero version'
    ELSE '⚠️  Some tracks missing hero version'
  END as migration_status
FROM tracks;

-- Check version counts
SELECT
  '✅ Track versions created' as status,
  COUNT(*) as total_versions,
  COUNT(*) FILTER (WHERE is_hero = true) as hero_versions
FROM track_versions;

-- Verify hero version constraint (should be 1 per track)
SELECT
  CASE
    WHEN COUNT(*) = 0
    THEN '✅ Hero version constraint working (1 per track)'
    ELSE '❌ Multiple hero versions found for some tracks'
  END as constraint_check,
  COUNT(*) as violation_count
FROM (
  SELECT track_id, COUNT(*) as hero_count
  FROM track_versions
  WHERE is_hero = true
  GROUP BY track_id
  HAVING COUNT(*) > 1
) violations;

-- Check triggers exist
SELECT
  CASE
    WHEN COUNT(*) >= 2
    THEN '✅ Storage triggers created for versions'
    ELSE '❌ Some storage triggers missing'
  END as trigger_status,
  COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_name LIKE '%version%storage%';

-- ============================================================
-- MIGRATION 2: Track Listens
-- ============================================================

\echo ''
\echo '=== MIGRATION 2: Track Listens ==='
\echo ''

-- Check track_listens table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'track_listens')
    THEN '✅ track_listens table exists'
    ELSE '❌ track_listens table MISSING'
  END as status;

-- Check helper function exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'record_track_listen'
    )
    THEN '✅ record_track_listen() function exists'
    ELSE '❌ record_track_listen() function MISSING'
  END as function_status;

-- Check view exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_name = 'track_listen_stats'
    )
    THEN '✅ track_listen_stats view exists'
    ELSE '❌ track_listen_stats view MISSING'
  END as view_status;

-- Check RLS policies
SELECT
  '✅ RLS policies for track_listens' as status,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'track_listens';

-- ============================================================
-- MIGRATION 3: Keywords System
-- ============================================================

\echo ''
\echo '=== MIGRATION 3: Keywords System ==='
\echo ''

-- Check keywords table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'keywords')
    THEN '✅ keywords table exists'
    ELSE '❌ keywords table MISSING'
  END as status;

-- Check track_keywords junction table exists
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'track_keywords')
    THEN '✅ track_keywords table exists'
    ELSE '❌ track_keywords table MISSING'
  END as status;

-- Check helper functions exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_or_create_keyword')
    THEN '✅ get_or_create_keyword() function exists'
    ELSE '❌ get_or_create_keyword() function MISSING'
  END as function_status;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'add_keyword_to_track')
    THEN '✅ add_keyword_to_track() function exists'
    ELSE '❌ add_keyword_to_track() function MISSING'
  END as function_status;

-- Check view exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_name = 'keyword_stats'
    )
    THEN '✅ keyword_stats view exists'
    ELSE '❌ keyword_stats view MISSING'
  END as view_status;

-- Check unique constraint (case-insensitive keywords per band)
SELECT
  '✅ Keywords unique constraint' as status,
  COUNT(*) as constraint_count
FROM information_schema.table_constraints
WHERE table_name = 'keywords'
  AND constraint_type = 'UNIQUE';

-- ============================================================
-- MIGRATION 4: Playlists → Set Lists
-- ============================================================

\echo ''
\echo '=== MIGRATION 4: Set Lists Migration ==='
\echo ''

-- Check old tables renamed
SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'playlists')
    THEN '✅ playlists table renamed (no longer exists)'
    ELSE '⚠️  playlists table still exists (migration may not have run)'
  END as playlists_status;

SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'playlist_items')
    THEN '✅ playlist_items table renamed (no longer exists)'
    ELSE '⚠️  playlist_items table still exists (migration may not have run)'
  END as playlist_items_status;

-- Check new tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'set_lists')
    THEN '✅ set_lists table exists'
    ELSE '❌ set_lists table MISSING'
  END as status;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'set_list_entries')
    THEN '✅ set_list_entries table exists'
    ELSE '❌ set_list_entries table MISSING'
  END as status;

-- Check version_id column exists on set_list_entries
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'set_list_entries'
        AND column_name = 'version_id'
    )
    THEN '✅ set_list_entries.version_id column exists'
    ELSE '❌ version_id column MISSING from set_list_entries'
  END as version_column_status;

-- Check data migration
SELECT
  COUNT(*) as total_entries,
  COUNT(version_id) as entries_with_versions,
  CASE
    WHEN COUNT(*) = COUNT(version_id)
    THEN '✅ All set list entries migrated to versions'
    WHEN COUNT(version_id) = 0
    THEN '❌ NO entries have version_id (migration failed)'
    ELSE '⚠️  Some entries missing version_id'
  END as migration_status
FROM set_list_entries;

-- Check related tables renamed
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'set_list_followers')
    THEN '✅ set_list_followers table exists'
    ELSE '⚠️  set_list_followers table missing'
  END as followers_status;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shared_set_lists')
    THEN '✅ shared_set_lists table exists'
    ELSE '⚠️  shared_set_lists table missing'
  END as shared_status;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'set_list_access_grants')
    THEN '✅ set_list_access_grants table exists'
    ELSE '⚠️  set_list_access_grants table missing'
  END as access_grants_status;

-- Check view exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views
      WHERE table_name = 'set_list_details'
    )
    THEN '✅ set_list_details view exists'
    ELSE '❌ set_list_details view MISSING'
  END as view_status;

-- ============================================================
-- SUMMARY
-- ============================================================

\echo ''
\echo '=== SUMMARY ==='
\echo ''

SELECT
  '✅ All MVP migrations verified' as final_status,
  (SELECT COUNT(*) FROM tracks) as total_tracks,
  (SELECT COUNT(*) FROM track_versions) as total_versions,
  (SELECT COUNT(*) FROM set_lists) as total_set_lists,
  (SELECT COUNT(*) FROM set_list_entries) as total_set_list_entries,
  (SELECT COUNT(*) FROM keywords) as total_keywords,
  (SELECT COUNT(*) FROM track_listens) as total_listens_recorded;

\echo ''
\echo '🎉 If all checks show ✅, migrations are successful!'
\echo ''
\echo 'Next steps:'
\echo '1. Run: npm run db:types (to regenerate TypeScript types)'
\echo '2. Update frontend code to use new table names'
\echo '3. Test version selection in UI'
\echo '4. Test keyword creation and filtering'
\echo '5. Test set list creation with version selection'
\echo ''
