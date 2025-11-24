-- ============================================================
-- NUCLEAR OPTION: Simplest possible policy for testing
-- ============================================================
-- Let's create the absolute simplest policy to see if it works
-- Then we can gradually add complexity back
-- ============================================================

-- First, let's see ALL policies on band_members (maybe there's a conflict?)
SELECT
  'All band_members policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
ORDER BY cmd, policyname;

-- Drop ALL policies on band_members
DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON band_members;
DROP POLICY IF EXISTS "Allow band member inserts" ON band_members;

-- Create the SIMPLEST possible INSERT policy - just allow authenticated users
CREATE POLICY "Allow authenticated inserts"
  ON band_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow everything for now

-- Recreate the SELECT policy (needed to verify membership)
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

-- Verify
SELECT
  'After simple policy' as info,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
ORDER BY cmd, policyname;
