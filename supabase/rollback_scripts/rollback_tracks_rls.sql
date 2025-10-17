-- ============================================================================
-- EMERGENCY ROLLBACK: Disable Tracks RLS
-- ============================================================================
-- Use this if Phase 1 RLS causes any issues
-- This reverts to the pre-RLS state (INSECURE but functional)
--
-- WHEN TO USE:
-- - Users report missing tracks
-- - Uploads are failing
-- - Playlists show empty
-- - Any 406 errors in logs
--
-- HOW TO USE:
-- psql $DATABASE_URL < rollback_scripts/rollback_tracks_rls.sql
--
-- Or in Supabase SQL Editor, copy and run this entire file
-- ============================================================================

-- Step 1: Disable RLS (makes table accessible again)
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all policies (cleanup)
DROP POLICY IF EXISTS "tracks_select_own" ON tracks;
DROP POLICY IF EXISTS "tracks_select_band_member" ON tracks;
DROP POLICY IF EXISTS "tracks_select_followed_playlist" ON tracks;
DROP POLICY IF EXISTS "tracks_select_personal_permissive" ON tracks;
DROP POLICY IF EXISTS "tracks_insert_own" ON tracks;
DROP POLICY IF EXISTS "tracks_update_own" ON tracks;
DROP POLICY IF EXISTS "tracks_delete_own" ON tracks;

-- Step 3: Verify tracks are accessible
SELECT 'Rollback complete. Track count:' as message, COUNT(*) as total_tracks FROM tracks;

-- ============================================================================
-- AFTER ROLLBACK
-- ============================================================================
-- 1. Document what went wrong
-- 2. Test the policies in a development database
-- 3. Fix the issue
-- 4. Re-apply the corrected migration
--
-- DO NOT leave RLS disabled permanently - this is insecure!
-- ============================================================================
