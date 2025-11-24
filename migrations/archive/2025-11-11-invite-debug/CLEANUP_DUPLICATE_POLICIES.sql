-- ============================================================
-- CLEANUP: Remove duplicate policies
-- ============================================================

-- BANDS: Remove older/redundant policies
DROP POLICY IF EXISTS "Authenticated users can view bands" ON bands;
DROP POLICY IF EXISTS "Band creators can update bands" ON bands;
DROP POLICY IF EXISTS "Band creators can delete bands" ON bands;

-- BAND_MEMBERS: Remove redundant policies
DROP POLICY IF EXISTS "Authenticated users can view band members" ON band_members;
DROP POLICY IF EXISTS "Authenticated users can manage band members" ON band_members;

-- Verify only one policy per operation remains
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('bands', 'band_members', 'band_invites')
ORDER BY tablename, cmd, policyname;
