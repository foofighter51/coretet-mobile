-- Check ALL invites for Stephen
SELECT
  'All invites for stephenpjudy@gmail.com' as info,
  id,
  band_id,
  invited_email,
  invite_token,
  status,
  created_at,
  expires_at,
  expires_at > NOW() as is_valid,
  invited_by
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com'
ORDER BY created_at DESC;

-- Check the specific token we're trying to use
SELECT
  'Specific token 4454cfbc...' as info,
  id,
  band_id,
  invited_email,
  invite_token,
  status,
  expires_at,
  expires_at > NOW() as is_valid
FROM band_invites
WHERE invite_token = '4454cfbc-7a25-4e5f-a94a-9da8ceadc63b';

-- If empty, show recently expired invites
SELECT
  'Recently expired or accepted invites' as info,
  id,
  invited_email,
  invite_token,
  status,
  expires_at
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com'
AND (status != 'pending' OR expires_at <= NOW())
ORDER BY created_at DESC
LIMIT 5;
