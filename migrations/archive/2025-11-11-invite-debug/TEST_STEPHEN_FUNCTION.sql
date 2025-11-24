-- Test if has_valid_invite function works for Stephen's specific case

-- First, get the band_id from the invite
SELECT 'Invite Details' as test, band_id, invited_email, status, expires_at
FROM band_invites
WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';

-- Test the function directly
SELECT
  'Function Test for Stephen' as test,
  has_valid_invite(
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
    (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
  ) as result_should_be_true;

-- Check what the function sees internally
SELECT
  'What function checks' as test,
  bi.band_id,
  bi.invited_email,
  p.id as profile_id,
  p.email as profile_email,
  bi.status,
  bi.expires_at > NOW() as not_expired
FROM band_invites bi
INNER JOIN profiles p ON p.email = bi.invited_email
WHERE p.id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
AND bi.status = 'pending'
AND bi.expires_at > NOW();

-- Simulate the exact INSERT that will happen
-- This tests if the policy would allow it
SELECT
  'Simulated INSERT check' as test,
  (
    -- Check if this specific INSERT would pass the policy
    EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
      AND bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND bm.role IN ('owner', 'admin')
    )
    OR has_valid_invite(
      '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
      (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    )
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = (SELECT band_id FROM band_invites WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b')
    )
  ) as policy_would_pass;
