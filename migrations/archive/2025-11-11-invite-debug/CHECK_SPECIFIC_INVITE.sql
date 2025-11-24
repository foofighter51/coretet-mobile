-- Check the specific invite token from the link
SELECT
  id,
  band_id,
  invited_email,
  invited_by,
  invite_token,
  status,
  created_at,
  expires_at,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN status != 'pending' THEN 'ALREADY USED'
    ELSE 'VALID'
  END as invite_status,
  EXTRACT(HOUR FROM (expires_at - NOW())) as hours_remaining
FROM band_invites
WHERE invite_token = '2f2e1630-0a55-4931-b1be-779a16a922ee';

-- Also check if this email has any other invites
SELECT
  id,
  invited_email,
  invite_token,
  status,
  created_at,
  expires_at,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN status != 'pending' THEN 'ALREADY USED'
    ELSE 'VALID'
  END as invite_status
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com'
ORDER BY created_at DESC;
