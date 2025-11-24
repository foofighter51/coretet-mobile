-- ============================================================
-- FIX: Band Members INSERT Policy (No NEW keyword)
-- ============================================================
-- PostgreSQL RLS doesn't support NEW in WITH CHECK
-- We need to use column references directly from the target table
-- The trick: in WITH CHECK, unqualified column names refer to the NEW row
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Case 1: Current user is owner/admin of the band
    band_id IN (
      SELECT bm.band_id FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 2: User being added has a valid invite for this band
    OR (
      user_id IN (
        SELECT p.id FROM profiles p
        INNER JOIN band_invites bi ON bi.invited_email = p.email
        WHERE bi.band_id = band_members.band_id
        AND bi.status = 'pending'
        AND bi.expires_at > NOW()
      )
    )
    -- Case 3: First member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
    )
  );

-- Alternative simpler version: Function-based approach
-- Create a helper function to check if user has valid invite
CREATE OR REPLACE FUNCTION has_valid_invite(
  p_user_id UUID,
  p_band_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM band_invites bi
    INNER JOIN profiles p ON p.email = bi.invited_email
    WHERE p.id = p_user_id
    AND bi.band_id = p_band_id
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now use the function in the policy
DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Case 1: Current user is owner/admin
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 2: User has valid invite (using function to avoid correlation issues)
    OR has_valid_invite(band_members.user_id, band_members.band_id)
    -- Case 3: First member
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = band_members.band_id
    )
  );

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_valid_invite(UUID, UUID) TO authenticated;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check the function works
SELECT
  'Function Test' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as should_be_true;

-- Check the policy
SELECT
  'Policy Status' as check,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';
