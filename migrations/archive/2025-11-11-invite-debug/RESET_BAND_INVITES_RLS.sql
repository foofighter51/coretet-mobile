-- Complete reset of band_invites RLS policies
-- This drops ALL policies and recreates from scratch

-- Drop ALL existing policies on band_invites (in case there are multiple)
DROP POLICY IF EXISTS "Owners and admins can invite" ON band_invites;
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;
DROP POLICY IF EXISTS "Users can accept/decline invites" ON band_invites;

-- Recreate SELECT policy (for viewing invites)
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    -- Users can see invites for bands they're in OR invites sent to their email
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id::UUID = auth.uid()
    )
    OR invited_email IN (
      SELECT email FROM profiles WHERE id::UUID = auth.uid()
    )
  );

-- Recreate INSERT policy (for creating invites)
-- NEW: Any band member can invite (not just admins)
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id::UUID = auth.uid()
    )
  );

-- Recreate UPDATE policy (for accepting/declining invites)
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id::UUID = auth.uid()
    )
  );

-- Verify policies were created
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY policyname;
