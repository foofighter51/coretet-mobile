-- ============================================================
-- SIMPLE FIX: Band Members INSERT Policy
-- ============================================================
-- Problem: Complex correlated subqueries in WITH CHECK cause issues
-- Solution: Simplify the policy to use direct column references
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Case 1: Current user is owner/admin of the band they're adding someone to
    EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = NEW.band_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
    -- Case 2: User being added (NEW.user_id) has a valid invite
    OR EXISTS (
      SELECT 1 FROM band_invites bi
      INNER JOIN profiles p ON p.email = bi.invited_email
      WHERE bi.band_id = NEW.band_id
      AND p.id = NEW.user_id
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
    -- Case 3: It's the first member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = NEW.band_id
    )
  );

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT
  'Updated Policy' as status,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test the exact scenario for Stephen
-- Band ID from invite: (we'll get it from the invite)
SELECT
  'Test Case: Stephen accepting invite' as test_name,
  bi.band_id,
  bi.invited_email,
  p.id as stephens_user_id,
  EXISTS (
    SELECT 1 FROM band_invites bi2
    INNER JOIN profiles p2 ON p2.email = bi2.invited_email
    WHERE bi2.band_id = bi.band_id
    AND p2.id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    AND bi2.status = 'pending'
    AND bi2.expires_at > NOW()
  ) as should_pass,
  bi.status,
  bi.expires_at > NOW() as not_expired
FROM band_invites bi
INNER JOIN profiles p ON p.email = bi.invited_email
WHERE bi.invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';
