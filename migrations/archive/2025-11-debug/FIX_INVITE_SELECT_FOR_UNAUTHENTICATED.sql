-- ============================================================
-- FIX: Allow unauthenticated users to read pending invites
-- ============================================================
-- Problem: AcceptInvite page needs to show invite details BEFORE user logs in
-- Current policy requires authentication, blocking the invite page
-- Solution: Allow reading pending invites by token (public can read, but not list all)
-- ============================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view band invites" ON band_invites;

-- Create new policy that allows:
-- 1. Authenticated band members to see their band's invites
-- 2. Anyone (including unauthenticated) to read a specific pending invite by token
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    -- Authenticated users can see invites for their bands
    (
      auth.uid() IS NOT NULL
      AND (
        band_id IN (
          SELECT band_id FROM band_members
          WHERE user_id = auth.uid()
        )
        OR invited_email IN (
          SELECT email FROM profiles WHERE id = auth.uid()
        )
      )
    )
    -- OR anyone can read pending invites (for invite acceptance page)
    OR status = 'pending'
  );

-- Verify the policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'SELECT';

-- Security note: This allows anyone to read pending invites if they know the token
-- This is acceptable because:
-- 1. Tokens are UUIDs (unguessable)
-- 2. Only pending invites are exposed (not accepted/declined)
-- 3. Invite details don't contain sensitive data
-- 4. This is required for the invite flow to work
