-- ============================================================
-- FIX: RLS Infinite Recursion
-- The problem: "Users can view their bands" checks band_members,
-- but "Users can view band members" checks bands (circular!)
-- ============================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
DROP POLICY IF EXISTS "Users can view band members" ON band_members;

-- Fix: band_members policy shouldn't need to check bands
-- Users can see band members of any band they're in
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    user_id = auth.uid()::TEXT
    OR band_id IN (
      SELECT bm.band_id FROM band_members bm
      WHERE bm.user_id = auth.uid()::TEXT
    )
  );

-- Now bands can safely check band_members
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );
