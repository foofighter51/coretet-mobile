-- Migration: Fix comment_views RLS policy
-- Date: 2025-12-09
-- Purpose: Allow users to mark comments as viewed
-- Breaking: No

BEGIN;

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can only view their own comment views" ON comment_views;
DROP POLICY IF EXISTS "Users can insert their own comment views" ON comment_views;

-- Allow users to insert their own comment views
CREATE POLICY "Users can mark comments as viewed"
  ON comment_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own comment views
CREATE POLICY "Users can view their own comment views"
  ON comment_views FOR SELECT
  USING (user_id = auth.uid());

COMMIT;
