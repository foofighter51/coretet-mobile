-- Add DELETE policy for band_invites
-- Allow band owners/admins to revoke pending invites

CREATE POLICY "Owners and admins can revoke invites"
  ON band_invites FOR DELETE
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Verify the policy was created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'DELETE';
