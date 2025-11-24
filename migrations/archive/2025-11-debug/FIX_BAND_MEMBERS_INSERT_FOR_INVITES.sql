-- ============================================================
-- FIX: Allow users to join bands via accepted invites
-- ============================================================
-- Problem: INSERT policy on band_members requires user to be owner/admin
-- But invited users aren't members yet - chicken-and-egg problem
-- Solution: Allow INSERT if there's a valid pending invite for that email
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Existing members with owner/admin role can add others
    (
      band_id IN (
        SELECT band_id FROM band_members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
      )
    )
    -- OR user is accepting a valid invite (NEW user joining via invite)
    OR (
      EXISTS (
        SELECT 1 FROM band_invites
        WHERE band_invites.band_id = band_members.band_id
        AND band_invites.invited_email IN (
          SELECT email FROM profiles WHERE id = auth.uid()
        )
        AND band_invites.status = 'pending'
        AND band_invites.expires_at > NOW()
      )
    )
    -- OR it's the first member (band creation)
    OR NOT EXISTS (SELECT 1 FROM band_members WHERE band_id = band_members.band_id)
  );

-- Verify the policy
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';
