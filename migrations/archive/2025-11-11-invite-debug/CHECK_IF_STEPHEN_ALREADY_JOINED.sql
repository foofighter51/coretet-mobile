-- Check if Stephen already joined the band (acceptance might have worked)
SELECT
  id,
  band_id,
  user_id,
  role,
  joined_at
FROM band_members
WHERE user_id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f';

-- Check the invite status
SELECT
  id,
  invited_email,
  status,
  accepted_at,
  accepted_by
FROM band_invites
WHERE invite_token = '2f2e1630-0a55-4931-b1be-779a16a922ee';

-- If he's not a member yet, manually add him to test
/*
INSERT INTO band_members (
  band_id,
  user_id,
  role
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',
  '56920ca2-edba-4cac-aefe-bd7f7676fc1f',
  'member'
) RETURNING *;

-- Then update the invite
UPDATE band_invites
SET
  status = 'accepted',
  accepted_at = NOW(),
  accepted_by = '56920ca2-edba-4cac-aefe-bd7f7676fc1f'
WHERE invite_token = '2f2e1630-0a55-4931-b1be-779a16a922ee';
*/
