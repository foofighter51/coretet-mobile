-- Test if the RLS policy would allow Ella to join

-- 1. Get the invite and band details
SELECT
  id,
  band_id,
  invited_email,
  status,
  expires_at,
  expires_at > NOW() as is_not_expired
FROM band_invites
WHERE invite_token = 'd1c38483-9db0-44af-aee3-0733ea045726';

-- 2. Test the exact policy logic
-- This simulates what the INSERT policy checks
SELECT EXISTS (
  SELECT 1 FROM band_invites
  WHERE band_invites.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'  -- Replace with actual band_id from query 1
  AND band_invites.invited_email IN (
    SELECT email FROM profiles
    WHERE id = 'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb'
  )
  AND band_invites.status = 'pending'
  AND band_invites.expires_at > NOW()
) as policy_would_allow;

-- 3. Check if user is already a member
SELECT
  id,
  band_id,
  user_id,
  role
FROM band_members
WHERE user_id = 'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb';

-- 4. Manually test the INSERT (as if we're the authenticated user)
-- This will show the actual RLS error if it fails
/*
SET SESSION "request.jwt.claim.sub" = 'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb';

INSERT INTO band_members (
  band_id,
  user_id,
  role
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',  -- Replace with actual band_id
  'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb',
  'member'
);
*/
