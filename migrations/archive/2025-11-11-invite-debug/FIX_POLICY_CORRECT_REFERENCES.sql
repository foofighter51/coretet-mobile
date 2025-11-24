-- ============================================================
-- FIX: Correctly reference new row columns in WITH CHECK
-- ============================================================
-- The issue: bm.band_id = bm.band_id (always true!)
-- Solution: Use a different approach - move the column reference
-- outside the subquery or use explicit NEW table reference
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

-- Use NEW table reference (PostgreSQL supports this in RLS)
-- Or use column references in the outer WHERE condition
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: Current user is owner/admin of the band being inserted into
    band_id IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 2: User being inserted has valid invite
    OR has_valid_invite(user_id, band_id)
    -- Case 3: First member (no existing members for this band)
    OR NOT EXISTS (
      SELECT 1
      FROM band_members bm
      WHERE bm.band_id = band_members.band_id
    )
  );

-- Verify the policy
SELECT
  'Fixed policy' as status,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test simulation
SELECT
  'Would Stephens INSERT pass?' as test,
  (
    -- Simulate the policy check for Stephen's INSERT
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND bm.role IN ('owner', 'admin')
    )
    OR has_valid_invite(
      '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
      '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    )
    OR NOT EXISTS (
      SELECT 1
      FROM band_members bm
      WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    )
  ) as should_pass;
