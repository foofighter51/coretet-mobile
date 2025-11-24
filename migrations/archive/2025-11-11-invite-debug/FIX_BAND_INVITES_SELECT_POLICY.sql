-- ============================================================
-- FIX: Make band_invites readable for invite acceptance
-- ============================================================
-- The band_members INSERT policy needs to read from band_invites
-- But band_invites SELECT policy might be blocking this
-- ============================================================

DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;

CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    -- Band members can see all invites for their bands
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
    -- Anyone can see invites addressed to them (even if not authenticated)
    OR invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
    -- Allow reading pending invites (for invite acceptance flow)
    OR status = 'pending'
  );

-- Verify
SELECT
  'Updated band_invites SELECT policy' as info,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- Test if Stephen can now read his invite
-- Simulate auth context
SELECT
  'Can Stephen read his invite?' as test,
  COUNT(*) as invite_count
FROM band_invites
WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b'
AND (
  invited_email IN (
    SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
  )
  OR status = 'pending'
);
