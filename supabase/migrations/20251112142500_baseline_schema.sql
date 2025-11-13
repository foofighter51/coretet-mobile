-- Baseline migration created 2025-11-12
-- Represents the current production schema state after Build 23
-- This migration is for tracking purposes only - schema already exists in production

-- NOTE: This file documents the baseline state.
-- All tables, policies, functions, and triggers are already applied to production.
-- Moving forward, all schema changes MUST go through the migration system.

-- ============================================================
-- BASELINE STATE (Already Applied to Production)
-- ============================================================

-- Tables: profiles, bands, band_members, band_invites, tracks, track_versions,
--         track_ratings, track_comments, comment_views, feedback, feedback_screenshots,
--         playlists, playlist_tracks, playlist_followers

-- RLS Policies: All tables have comprehensive RLS policies with proper role assignments
-- Functions: current_user_id, is_band_member, is_band_admin, has_valid_invite, etc.
-- Triggers: updated_at triggers, notification triggers
-- Storage: Buckets for tracks, avatars, feedback-screenshots

-- All RLS policies fixed as of 2025-11-12:
-- - Proper role assignments (authenticated vs public)
-- - Fixed ambiguous table references
-- - UUID type consistency

-- ============================================================
-- NEXT STEPS
-- ============================================================

-- Future migrations will be applied from this baseline.
-- Use: supabase migration new <descriptive_name>
-- Test: supabase db reset (requires Docker)
-- Apply: supabase db push

SELECT 'Baseline migration - schema already exists in production' as status;
