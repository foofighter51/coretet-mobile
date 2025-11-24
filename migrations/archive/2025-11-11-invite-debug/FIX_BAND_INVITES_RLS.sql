-- Fix band_invites RLS Policy
-- NEW PHILOSOPHY: Any band member can invite (democratic collaboration)
-- Only admins/owners can remove members (controlled management)

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Owners and admins can invite" ON band_invites;

-- Recreate as: Any band member can create invites
-- IMPORTANT: Cast user_id to UUID instead of auth.uid() to TEXT
-- This avoids the "uuid = text" operator error
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id::UUID = auth.uid()
    )
  );

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'band_invites';
