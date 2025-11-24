-- ============================================================
-- FINAL FIX: Use USING clause instead of WITH CHECK
-- ============================================================
-- Issue: WITH CHECK might be evaluating differently than expected
-- Solution: RLS policies can use USING for INSERT when combined with FOR ALL
-- ============================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

-- Create new policy using USING clause (works for INSERT)
CREATE POLICY "Allow band member inserts"
  ON band_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Option 1: Current user is admin/owner
    EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
    OR
    -- Option 2: User being inserted has a valid invite
    (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM band_invites bi
        JOIN profiles p ON p.email = bi.invited_email
        WHERE bi.band_id = band_members.band_id
        AND p.id = band_members.user_id
        AND bi.status = 'pending'
        AND bi.expires_at > NOW()
      )
    )
    OR
    -- Option 3: First member (band creation)
    NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    )
  );

-- Verify
SELECT
  'New policy' as check,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test if Stephen's INSERT would work now
SELECT
  'Would Stephens INSERT pass?' as test,
  (
    -- Simulate: auth.uid() = Stephen's ID
    EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
      AND existing.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND existing.role IN ('owner', 'admin')
    )
    OR
    (
      '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01' IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM band_invites bi
        JOIN profiles p ON p.email = bi.invited_email
        WHERE bi.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
        AND p.id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
        AND bi.status = 'pending'
        AND bi.expires_at > NOW()
      )
    )
    OR
    NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    )
  ) as should_be_true;
