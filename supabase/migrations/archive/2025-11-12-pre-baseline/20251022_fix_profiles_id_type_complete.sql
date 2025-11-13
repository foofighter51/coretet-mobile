-- ============================================================================
-- Migration: Fix profiles.id type from TEXT to UUID for Supabase Auth
-- ============================================================================
-- Date: 2025-10-22
-- Purpose: Supabase Auth uses UUID user IDs, not TEXT
-- This fixes "operator does not exist: uuid = text" errors
--
-- Generated from complete foreign key analysis
-- ============================================================================

-- Step 1: Drop ALL dependent foreign keys
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

-- Step 2: Alter profiles.id to UUID
ALTER TABLE profiles
  ALTER COLUMN id TYPE UUID USING id::uuid;

-- Step 3: Alter ALL foreign key columns to UUID
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

-- Step 4: Recreate ALL foreign key constraints
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
