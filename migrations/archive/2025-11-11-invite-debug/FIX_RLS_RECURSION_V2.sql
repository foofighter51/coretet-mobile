-- ============================================================
-- FIX: RLS Infinite Recursion (V2 - Simpler approach)
-- Solution: Disable RLS temporarily for verification, or use simpler policies
-- ============================================================

-- Drop all the problematic policies
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
DROP POLICY IF EXISTS "Users can view band members" ON band_members;

-- Temporary: Allow all authenticated users to view bands and members
-- (We'll add proper scoping in the application layer first)
CREATE POLICY "Authenticated users can view bands"
  ON bands FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view band members"
  ON band_members FOR SELECT
  USING (auth.uid() IS NOT NULL);
