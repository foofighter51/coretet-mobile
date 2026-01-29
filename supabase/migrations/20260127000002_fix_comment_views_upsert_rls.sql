-- Migration: Fix comment_views RLS for upsert operations
-- The upsert operation requires both INSERT and UPDATE policies
-- Previous migration only had INSERT policy, causing 403 errors on conflict

-- Add UPDATE policy for comment_views
-- This allows users to update their own comment view records when upserting
CREATE POLICY "Users can update their own comment views"
  ON comment_views FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
