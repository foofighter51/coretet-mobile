-- ============================================================
-- FIX: Explicitly qualify all column references in RLS policy
-- ============================================================
-- The function call has_valid_invite(user_id, band_id) might be ambiguous
-- Let's be completely explicit about which columns we're referencing
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: Current user is owner/admin
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 2: User being inserted has valid invite (explicitly qualify columns)
    OR has_valid_invite(band_members.user_id, band_members.band_id)
    -- Case 3: First member
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
    )
  );

-- Verify the policy was created correctly
SELECT
  'Updated policy' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test again
SELECT
  'Test with explicit columns' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as function_result,
  (
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
      AND bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND bm.role IN ('owner', 'admin')
    )
    OR has_valid_invite(
      '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
      (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    )
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    )
  ) as full_policy_check;
