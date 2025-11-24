-- ============================================================
-- COMPLETE FIX: Update ALL RLS policies to remove broken TEXT casts
-- ============================================================

-- Problem: Multiple policies have auth.uid()::TEXT which causes type errors
-- Solution: Remove TEXT casts since all user_id columns are UUID

-- ============================================================
-- 1. Fix band_invites SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;

CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
    OR invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 2. Fix band_invites UPDATE policy
-- ============================================================
DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;

CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- 3. Verify all band_invites policies are correct
-- ============================================================
SELECT
  policyname,
  cmd,
  with_check as insert_check,
  qual as select_update_check
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY cmd, policyname;

-- All policies should now have auth.uid() without ::TEXT cast
