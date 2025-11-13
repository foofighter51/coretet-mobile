-- ============================================================================
-- PHASE 1: Enable Tracks RLS with Permissive Policies
-- ============================================================================
-- Date: 2025-10-17
-- Purpose: Re-enable RLS on tracks table while maintaining all functionality
-- Strategy: Use permissive policies first, tighten in Phase 2
-- Rollback: See rollback_tracks_rls.sql
--
-- BASELINE DATA (2025-10-16):
-- - Total tracks: 235
-- - Band tracks: 223 (94.9%)
-- - Personal tracks: 12 (5.1%)
-- - Tracks in playlists: 184 (78.3%)
--
-- SUCCESS CRITERIA:
-- - All 235 tracks remain visible to appropriate users
-- - Band members can see all band tracks
-- - Playlist followers can see playlist tracks
-- - Creators can manage their own tracks
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure clerk_user_id function exists
-- ============================================================================
-- This function extracts the Clerk user ID from JWT claims
-- It's idempotent (safe to run multiple times)

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Create SELECT Policies (Read Access)
-- ============================================================================
-- These policies determine who can VIEW tracks
-- We use multiple policies that OR together (any matching policy grants access)

-- Policy 1: Users can view their own tracks
-- This ensures creators always see tracks they uploaded
CREATE POLICY "tracks_select_own" ON tracks
  FOR SELECT
  USING (created_by::text = public.clerk_user_id());

COMMENT ON POLICY "tracks_select_own" ON tracks IS
  'Users can view tracks they created';

-- Policy 2: Users can view tracks in their bands
-- This is CRITICAL - ensures band collaboration works
-- Based on baseline: 223/235 tracks are band tracks
CREATE POLICY "tracks_select_band_member" ON tracks
  FOR SELECT
  USING (
    band_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM band_members bm
      WHERE bm.band_id = tracks.band_id
        AND bm.user_id::text = public.clerk_user_id()
    )
  );

COMMENT ON POLICY "tracks_select_band_member" ON tracks IS
  'Users can view tracks in bands they are members of';

-- Policy 3: Users can view tracks in playlists they follow
-- This is CRITICAL - ensures playlist sharing works
-- Based on baseline: 184/235 tracks are in playlists
CREATE POLICY "tracks_select_followed_playlist" ON tracks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM playlist_items pi
      JOIN playlist_followers pf ON pf.playlist_id = pi.playlist_id
      WHERE pi.track_id = tracks.id
        AND pf.user_id::text = public.clerk_user_id()
    )
  );

COMMENT ON POLICY "tracks_select_followed_playlist" ON tracks IS
  'Users can view tracks in playlists they follow';

-- Policy 4: TEMPORARY - Permissive personal tracks access
-- This is intentionally loose for Phase 1 to ensure nothing breaks
-- In Phase 2, we'll tighten this to only show personal tracks:
--   - To the creator
--   - To users with playlists containing the track
-- Based on baseline: Only 12/235 tracks are personal
CREATE POLICY "tracks_select_personal_permissive" ON tracks
  FOR SELECT
  USING (
    band_id IS NULL
  );

COMMENT ON POLICY "tracks_select_personal_permissive" ON tracks IS
  'TEMPORARY: Permissive access to personal tracks - will tighten in Phase 2';

-- ============================================================================
-- STEP 3: Create INSERT Policies (Upload Access)
-- ============================================================================
-- These policies determine who can CREATE new tracks

-- Only allow users to upload tracks as themselves
CREATE POLICY "tracks_insert_own" ON tracks
  FOR INSERT
  WITH CHECK (created_by::text = public.clerk_user_id());

COMMENT ON POLICY "tracks_insert_own" ON tracks IS
  'Users can only upload tracks as themselves (prevents impersonation)';

-- ============================================================================
-- STEP 4: Create UPDATE Policies (Edit Access)
-- ============================================================================
-- These policies determine who can MODIFY tracks

-- Only allow users to update their own tracks
-- Prevents users from editing others' track metadata
CREATE POLICY "tracks_update_own" ON tracks
  FOR UPDATE
  USING (created_by::text = public.clerk_user_id())
  WITH CHECK (created_by::text = public.clerk_user_id());

COMMENT ON POLICY "tracks_update_own" ON tracks IS
  'Users can only update tracks they created';

-- ============================================================================
-- STEP 5: Create DELETE Policies (Delete Access)
-- ============================================================================
-- These policies determine who can DELETE tracks

-- Only allow users to delete their own tracks
-- Prevents users from deleting band content uploaded by others
CREATE POLICY "tracks_delete_own" ON tracks
  FOR DELETE
  USING (created_by::text = public.clerk_user_id());

COMMENT ON POLICY "tracks_delete_own" ON tracks IS
  'Users can only delete tracks they created';

-- ============================================================================
-- STEP 6: Enable RLS on tracks table
-- ============================================================================
-- This is the critical step that activates all policies above

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: Verify permissions are granted
-- ============================================================================
-- Ensure authenticated users can perform operations
-- (Supabase usually handles this, but we verify to be safe)

GRANT SELECT, INSERT, UPDATE, DELETE ON tracks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after applying migration)
-- ============================================================================
-- Run these as different users to verify policies work:

-- 1. Count total tracks visible to current user (should see tracks you have access to)
-- SELECT COUNT(*) FROM tracks;

-- 2. Check band tracks are visible (should see your band's tracks)
-- SELECT COUNT(*) FROM tracks WHERE band_id IS NOT NULL;

-- 3. Check personal tracks are visible
-- SELECT COUNT(*) FROM tracks WHERE band_id IS NULL;

-- 4. Try to insert a track (should succeed if you're authenticated)
-- This is safe - just creates a test track you can delete
-- INSERT INTO tracks (title, file_url, created_by)
-- VALUES ('RLS Test Track', 'test.mp3', public.clerk_user_id())
-- RETURNING id, title;

-- 5. Try to delete the test track (should succeed)
-- DELETE FROM tracks WHERE title = 'RLS Test Track' AND created_by::text = public.clerk_user_id();

-- ============================================================================
-- SUCCESS METRICS (Compare to baseline)
-- ============================================================================
-- After enabling RLS, these should match the baseline:
--
-- Total tracks: 235 (sum of what all users can see may vary by user)
-- Band tracks: 223
-- Personal tracks: 12
-- Tracks in playlists: 184
--
-- If counts differ significantly, investigate before proceeding to Phase 2

-- ============================================================================
-- NOTES FOR PHASE 2
-- ============================================================================
-- After monitoring Phase 1 for 7 days with no issues:
-- 1. Remove "tracks_select_personal_permissive" policy
-- 2. Replace with restrictive personal tracks policy:
--    - Personal tracks visible to creator only
--    - OR visible if in a followed playlist
-- 3. Monitor for another 7 days
-- 4. Proceed to file upload validation (Phase 3)
