-- ============================================================
-- FIX: Use unqualified column names in WITH CHECK
-- ============================================================
-- In PostgreSQL RLS WITH CHECK clauses for INSERT:
-- - Qualified names (band_members.user_id) refer to the TABLE
-- - Unqualified names (user_id) refer to the NEW ROW being inserted
-- This is the critical difference!
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: Current user (person doing the INSERT) is owner/admin
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_id  -- band_id (unqualified) = NEW row's band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 2: The user being inserted has a valid invite
    -- Use unqualified column names to refer to the NEW row
    OR has_valid_invite(user_id, band_id)
    -- Case 3: First member
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_id  -- band_id (unqualified) = NEW row's band_id
    )
  );

-- Verify
SELECT
  'New policy with unqualified columns' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test the function directly (should still work)
SELECT
  'Function test' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as should_be_true;
