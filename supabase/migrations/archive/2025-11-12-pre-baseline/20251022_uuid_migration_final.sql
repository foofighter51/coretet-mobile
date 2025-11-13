-- ============================================================================
-- Migration: Fix profiles.id type from TEXT to UUID for Supabase Auth
-- ============================================================================
-- Date: 2025-10-22
-- Purpose: Supabase Auth uses UUID user IDs, not TEXT
-- This fixes "operator does not exist: uuid = text" errors
--
-- Strategy: Drop ALL policies, change types, recreate simple policies
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL RLS policies on ALL tables
-- ============================================================================

-- band_invites policies
DROP POLICY IF EXISTS "Band admins can create invites" ON band_invites;
DROP POLICY IF EXISTS "Band admins can delete pending invites" ON band_invites;
DROP POLICY IF EXISTS "Band members can view their band invites" ON band_invites;
DROP POLICY IF EXISTS "Public can view invite by valid token" ON band_invites;
DROP POLICY IF EXISTS "Users can accept invites" ON band_invites;

-- band_members policies
DROP POLICY IF EXISTS "Authenticated users can add band members" ON band_members;
DROP POLICY IF EXISTS "Authenticated users can view band members" ON band_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;

-- bands policies
DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
DROP POLICY IF EXISTS "Authenticated users can view bands" ON bands;
DROP POLICY IF EXISTS "Band owners can delete" ON bands;
DROP POLICY IF EXISTS "Band owners can update" ON bands;

-- comment_views policies
DROP POLICY IF EXISTS "Users can insert their own comment views" ON comment_views;
DROP POLICY IF EXISTS "Users can update their own comment views" ON comment_views;
DROP POLICY IF EXISTS "Users can view their own comment views" ON comment_views;

-- comments policies
DROP POLICY IF EXISTS "Comments visible based on track access" ON comments;
DROP POLICY IF EXISTS "Users can comment on accessible tracks" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

-- feedback policies
DROP POLICY IF EXISTS "Anyone can view feedback" ON feedback;
DROP POLICY IF EXISTS "Authenticated users can update feedback status" ON feedback;
DROP POLICY IF EXISTS "Users can archive their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON feedback;

-- feedback_comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can create comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON feedback_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON feedback_comments;

-- feedback_votes policies
DROP POLICY IF EXISTS "Anyone can view votes" ON feedback_votes;
DROP POLICY IF EXISTS "Users can remove their votes" ON feedback_votes;
DROP POLICY IF EXISTS "Users can vote" ON feedback_votes;

-- file_uploads policies
DROP POLICY IF EXISTS "Anyone can create uploads" ON file_uploads;
DROP POLICY IF EXISTS "Anyone can delete uploads" ON file_uploads;
DROP POLICY IF EXISTS "Anyone can update uploads" ON file_uploads;
DROP POLICY IF EXISTS "Anyone can view uploads" ON file_uploads;

-- playlist_followers policies
DROP POLICY IF EXISTS "Users can follow public playlists" ON playlist_followers;
DROP POLICY IF EXISTS "Users can unfollow their follows" ON playlist_followers;
DROP POLICY IF EXISTS "Users can view their own follows" ON playlist_followers;

-- playlist_items policies
DROP POLICY IF EXISTS "Playlist tracks visible based on playlist access" ON playlist_items;
DROP POLICY IF EXISTS "Users can add tracks to accessible playlists" ON playlist_items;
DROP POLICY IF EXISTS "Users can remove tracks from accessible playlists" ON playlist_items;
DROP POLICY IF EXISTS "Users can update playlist tracks" ON playlist_items;

-- playlists policies
DROP POLICY IF EXISTS "Authenticated users can create playlists" ON playlists;
DROP POLICY IF EXISTS "Playlist creators can delete their playlists" ON playlists;
DROP POLICY IF EXISTS "Playlist creators can update their playlists" ON playlists;
DROP POLICY IF EXISTS "Playlists visible based on band membership or public sharing" ON playlists;

-- profiles policies
DROP POLICY IF EXISTS "Anyone can create profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- ratings policies
DROP POLICY IF EXISTS "Ratings visible based on track access" ON ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can rate accessible tracks" ON ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON ratings;

-- track_ratings policies
DROP POLICY IF EXISTS "Allow all operations on track_ratings for MVP" ON track_ratings;

-- tracks policies (including old Clerk-based ones)
DROP POLICY IF EXISTS "Authenticated users can create tracks" ON tracks;
DROP POLICY IF EXISTS "Track creators can delete their tracks" ON tracks;
DROP POLICY IF EXISTS "Track creators can update their tracks" ON tracks;
DROP POLICY IF EXISTS "Tracks visible based on band membership" ON tracks;
DROP POLICY IF EXISTS "tracks_delete_own" ON tracks;
DROP POLICY IF EXISTS "tracks_insert_own" ON tracks;
DROP POLICY IF EXISTS "tracks_select_band_member" ON tracks;
DROP POLICY IF EXISTS "tracks_select_followed_playlist" ON tracks;
DROP POLICY IF EXISTS "tracks_select_own" ON tracks;
DROP POLICY IF EXISTS "tracks_select_public" ON tracks;
DROP POLICY IF EXISTS "tracks_update_own" ON tracks;

-- ============================================================================
-- STEP 2: Drop dependent foreign keys
-- ============================================================================

ALTER TABLE band_invites DROP CONSTRAINT IF EXISTS band_invites_accepted_by_fkey;
ALTER TABLE band_invites DROP CONSTRAINT IF EXISTS band_invites_invited_by_fkey;
ALTER TABLE band_members DROP CONSTRAINT IF EXISTS band_members_user_id_fkey;
ALTER TABLE bands DROP CONSTRAINT IF EXISTS bands_created_by_fkey;
ALTER TABLE comment_views DROP CONSTRAINT IF EXISTS comment_views_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE feedback_comments DROP CONSTRAINT IF EXISTS feedback_comments_user_id_fkey;
ALTER TABLE feedback_votes DROP CONSTRAINT IF EXISTS feedback_votes_user_id_fkey;
ALTER TABLE file_uploads DROP CONSTRAINT IF EXISTS file_uploads_user_id_fkey;
ALTER TABLE playlist_followers DROP CONSTRAINT IF EXISTS playlist_followers_user_id_fkey;
ALTER TABLE playlist_items DROP CONSTRAINT IF EXISTS playlist_items_added_by_fkey;
ALTER TABLE playlists DROP CONSTRAINT IF EXISTS playlists_created_by_fkey;
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE track_ratings DROP CONSTRAINT IF EXISTS track_ratings_user_id_fkey;
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_created_by_fkey;

-- ============================================================================
-- STEP 3: Alter profiles.id to UUID
-- ============================================================================

ALTER TABLE profiles ALTER COLUMN id TYPE UUID USING id::uuid;

-- ============================================================================
-- STEP 4: Alter ALL foreign key columns to UUID
-- ============================================================================

ALTER TABLE band_invites ALTER COLUMN accepted_by TYPE UUID USING accepted_by::uuid;
ALTER TABLE band_invites ALTER COLUMN invited_by TYPE UUID USING invited_by::uuid;
ALTER TABLE band_members ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE bands ALTER COLUMN created_by TYPE UUID USING created_by::uuid;
ALTER TABLE comment_views ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE comments ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE feedback ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE feedback_comments ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE feedback_votes ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE file_uploads ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE playlist_followers ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE playlist_items ALTER COLUMN added_by TYPE UUID USING added_by::uuid;
ALTER TABLE playlists ALTER COLUMN created_by TYPE UUID USING created_by::uuid;
ALTER TABLE ratings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE track_ratings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE tracks ALTER COLUMN created_by TYPE UUID USING created_by::uuid;

-- ============================================================================
-- STEP 5: Recreate ALL foreign key constraints
-- ============================================================================

ALTER TABLE band_invites ADD CONSTRAINT band_invites_accepted_by_fkey
  FOREIGN KEY (accepted_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE band_invites ADD CONSTRAINT band_invites_invited_by_fkey
  FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE band_members ADD CONSTRAINT band_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bands ADD CONSTRAINT bands_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comment_views ADD CONSTRAINT comment_views_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE feedback ADD CONSTRAINT feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE feedback_comments ADD CONSTRAINT feedback_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE feedback_votes ADD CONSTRAINT feedback_votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE file_uploads ADD CONSTRAINT file_uploads_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE playlist_followers ADD CONSTRAINT playlist_followers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE playlist_items ADD CONSTRAINT playlist_items_added_by_fkey
  FOREIGN KEY (added_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE playlists ADD CONSTRAINT playlists_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE ratings ADD CONSTRAINT ratings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE track_ratings ADD CONSTRAINT track_ratings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tracks ADD CONSTRAINT tracks_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 6: Recreate simplified RLS policies for MVP (using auth.uid())
-- ============================================================================

-- Profiles: Open for MVP
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Anyone can create profiles" ON profiles FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON profiles FOR UPDATE TO authenticated, anon USING (true);

-- Bands: Authenticated users only
CREATE POLICY "Authenticated users can view bands" ON bands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create bands" ON bands FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Band creators can update bands" ON bands FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Band creators can delete bands" ON bands FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Band Members: Open for authenticated
CREATE POLICY "Authenticated users can view band members" ON band_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage band members" ON band_members FOR ALL TO authenticated USING (true);

-- Tracks: Authenticated users only
CREATE POLICY "Authenticated users can view tracks" ON tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tracks" ON tracks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Track creators can update tracks" ON tracks FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Track creators can delete tracks" ON tracks FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Playlists: Authenticated users only
CREATE POLICY "Authenticated users can view playlists" ON playlists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create playlists" ON playlists FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Playlist creators can update playlists" ON playlists FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Playlist creators can delete playlists" ON playlists FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Playlist Items: Open for authenticated
CREATE POLICY "Authenticated users can view playlist items" ON playlist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage playlist items" ON playlist_items FOR ALL TO authenticated USING (true);

-- Comments: Authenticated users only
CREATE POLICY "Authenticated users can view comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Ratings: Authenticated users only
CREATE POLICY "Authenticated users can view ratings" ON ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can rate" ON ratings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their ratings" ON ratings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their ratings" ON ratings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Track Ratings: Open for MVP
CREATE POLICY "Anyone can manage track ratings" ON track_ratings FOR ALL TO authenticated, anon USING (true);

-- File Uploads: Open for MVP
CREATE POLICY "Anyone can manage file uploads" ON file_uploads FOR ALL TO authenticated, anon USING (true);

-- Feedback: Authenticated users only
CREATE POLICY "Anyone can view feedback" ON feedback FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Authenticated users can create feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their feedback" ON feedback FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their feedback" ON feedback FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Note: Band invites, playlist followers, comment views, feedback comments/votes
-- are left without policies for MVP simplicity. Add as needed.
