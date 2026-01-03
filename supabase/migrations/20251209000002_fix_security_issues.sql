-- Migration: Fix Security Issues from Supabase Linter
-- Date: 2025-12-09
-- Purpose: Fix SECURITY DEFINER views and enable RLS on public tables
-- Breaking: No - security hardening only

BEGIN;

-- ============================================================
-- STEP 1: Recreate views with SECURITY INVOKER
-- ============================================================

-- Drop and recreate track_listen_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS track_listen_stats;
CREATE OR REPLACE VIEW track_listen_stats
WITH (security_invoker = true)
AS
SELECT
  tl.track_id,
  tl.version_id,
  COUNT(DISTINCT tl.user_id) as listener_count,
  COUNT(*) as listen_count,
  MAX(tl.listened_at) as last_listened_at
FROM track_listens tl
GROUP BY tl.track_id, tl.version_id;

-- Drop and recreate set_list_details view without SECURITY DEFINER
DROP VIEW IF EXISTS set_list_details;
CREATE OR REPLACE VIEW set_list_details
WITH (security_invoker = true)
AS
SELECT
  sl.id as set_list_id,
  sl.title as set_list_title,
  sl.band_id,
  t.id as track_id,
  t.title as track_title,
  sle.position,
  sle.version_id,
  COUNT(*) OVER (PARTITION BY sl.id) as track_count
FROM set_lists sl
LEFT JOIN set_list_entries sle ON sle.set_list_id = sl.id
LEFT JOIN tracks t ON t.id = sle.track_id
ORDER BY sl.id, sle.position;

-- Drop and recreate keyword_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS keyword_stats;
CREATE OR REPLACE VIEW keyword_stats
WITH (security_invoker = true)
AS
SELECT
  k.id as keyword_id,
  k.name as keyword_name,
  k.band_id,
  COUNT(tk.track_id) as usage_count
FROM keywords k
LEFT JOIN track_keywords tk ON tk.keyword_id = k.id
GROUP BY k.id, k.name, k.band_id;

-- Recreate track_version_groups view without SECURITY DEFINER
DROP VIEW IF EXISTS track_version_groups;
CREATE OR REPLACE VIEW track_version_groups
WITH (security_invoker = true)
AS
SELECT
  vg.id as group_id,
  vg.name as group_name,
  vg.band_id,
  vg.hero_track_id,
  vg.created_at as group_created_at,
  t.id as track_id,
  t.title as track_title,
  t.file_url,
  t.duration_seconds,
  t.created_at as track_created_at,
  (t.id = vg.hero_track_id) as is_hero,
  COUNT(*) OVER (PARTITION BY vg.id) as version_count
FROM version_groups vg
JOIN tracks t ON t.version_group_id = vg.id
ORDER BY vg.id, is_hero DESC, t.created_at;

-- ============================================================
-- STEP 2: Enable RLS on tables missing it
-- ============================================================

-- Enable RLS on set_list_access_grants
ALTER TABLE set_list_access_grants ENABLE ROW LEVEL SECURITY;

-- Policies for set_list_access_grants
CREATE POLICY "Users can view their own access grants"
  ON set_list_access_grants FOR SELECT
  USING (
    claimed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM set_lists
      WHERE set_lists.id = set_list_access_grants.shared_set_list_id
      AND set_lists.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can claim access grants"
  ON set_list_access_grants FOR UPDATE
  USING (claimed_by IS NULL OR claimed_by = auth.uid());

-- Enable RLS on shared_set_lists
ALTER TABLE shared_set_lists ENABLE ROW LEVEL SECURITY;

-- Policies for shared_set_lists
CREATE POLICY "Users can view shared set lists they have access to"
  ON shared_set_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM set_lists
      WHERE set_lists.id = shared_set_lists.set_list_id
      AND (
        set_lists.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM set_list_followers
          WHERE set_list_followers.set_list_id = set_lists.id
          AND set_list_followers.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Set list creators can share their set lists"
  ON shared_set_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM set_lists
      WHERE set_lists.id = shared_set_lists.set_list_id
      AND set_lists.created_by = auth.uid()
    )
  );

-- Enable RLS on sms_credits
ALTER TABLE sms_credits ENABLE ROW LEVEL SECURITY;

-- Policies for sms_credits
CREATE POLICY "Users can view their own SMS credits"
  ON sms_credits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own SMS credits"
  ON sms_credits FOR UPDATE
  USING (user_id = auth.uid());

-- Enable RLS on producer_waitlist
ALTER TABLE producer_waitlist ENABLE ROW LEVEL SECURITY;

-- Policies for producer_waitlist
CREATE POLICY "Anyone can add to waitlist"
  ON producer_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own waitlist entry"
  ON producer_waitlist FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

COMMIT;

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration:
--
-- BEGIN;
-- -- Revert to SECURITY DEFINER views (not recommended)
-- -- Disable RLS (not recommended)
-- ALTER TABLE set_list_access_grants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE shared_set_lists DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sms_credits DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE producer_waitlist DISABLE ROW LEVEL SECURITY;
-- COMMIT;
