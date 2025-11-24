-- Debug why invite acceptance isn't working after user logs in

-- 1. Check the invite details
SELECT
  id,
  band_id,
  invited_email,
  invite_token,
  status,
  expires_at
FROM band_invites
WHERE invite_token = '2f2e1630-0a55-4931-b1be-779a16a922ee';

-- 2. Check if a profile exists for stephenpjudy@gmail.com
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE email = 'stephenpjudy@gmail.com';

-- 3. Check if this user is already a band member
-- Replace <band_id> with the band_id from query 1
-- Replace <user_id> with the id from query 2
/*
SELECT
  id,
  band_id,
  user_id,
  role,
  joined_at
FROM band_members
WHERE band_id = '<band_id>'
AND user_id = '<user_id>';
*/

-- 4. Test if the policy would allow this insert
-- This simulates what happens when user tries to join
/*
SELECT EXISTS (
  SELECT 1 FROM band_invites
  WHERE band_invites.band_id = '<band_id>'
  AND band_invites.invited_email = 'stephenpjudy@gmail.com'
  AND band_invites.status = 'pending'
  AND band_invites.expires_at > NOW()
) as policy_would_allow_insert;
*/
