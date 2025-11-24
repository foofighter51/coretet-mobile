-- FINAL FIX for band_invites RLS policy
-- The issue: user_id (TEXT) needs explicit cast to UUID

-- First, completely drop the broken policy
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;

-- Recreate with EXPLICIT casting using parentheses to ensure it's applied
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND (band_members.user_id)::UUID = auth.uid()
    )
  );

-- Verify the policy shows the ::UUID cast
SELECT
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_invites'
AND policyname = 'Band members can invite';
