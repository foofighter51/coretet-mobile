-- ============================================================
-- COMPREHENSIVE FIX: Band Invite Acceptance RLS Policy
-- ============================================================
-- Issue: Users cannot accept invites - "new row violates row-level security policy"
-- Root cause: RLS policy on band_members is too restrictive
-- ============================================================

-- First, let's check the current state
SELECT 'Current band_members INSERT policy:' as info;
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- ============================================================
-- FIX: Update band_members INSERT policy
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    -- Case 1: Existing members with owner/admin role can add others
    (
      EXISTS (
        SELECT 1 FROM band_members existing
        WHERE existing.band_id = band_members.band_id
        AND existing.user_id = auth.uid()
        AND existing.role IN ('owner', 'admin')
      )
    )
    -- Case 2: User is accepting a valid invite (NEW user joining via invite)
    -- This checks if the current user's email matches a pending invite
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM band_invites bi
        JOIN profiles p ON p.email = bi.invited_email
        WHERE bi.band_id = band_members.band_id
        AND p.id = auth.uid()
        AND bi.status = 'pending'
        AND bi.expires_at > NOW()
      )
    )
    -- Case 3: User being added matches a valid invite (legacy support)
    OR (
      EXISTS (
        SELECT 1 FROM band_invites bi
        JOIN profiles p ON p.email = bi.invited_email
        WHERE bi.band_id = band_members.band_id
        AND p.id = band_members.user_id
        AND bi.status = 'pending'
        AND bi.expires_at > NOW()
      )
    )
    -- Case 4: First member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members existing
      WHERE existing.band_id = band_members.band_id
    )
  );

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Updated band_members INSERT policy:' as info;
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'band_members' AND cmd = 'INSERT';

-- Test query: Check if specific invite would work
-- Replace '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b' with actual token
SELECT
  'Invite validation for stephenpjudy@gmail.com:' as info,
  bi.invited_email,
  bi.status,
  bi.expires_at > NOW() as is_valid,
  p.id as user_id,
  p.email,
  CASE
    WHEN p.id IS NULL THEN '❌ No profile found'
    WHEN bi.status != 'pending' THEN '❌ Invite not pending'
    WHEN bi.expires_at <= NOW() THEN '❌ Invite expired'
    ELSE '✅ Should work'
  END as can_accept
FROM band_invites bi
LEFT JOIN profiles p ON p.email = bi.invited_email
WHERE bi.invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';
