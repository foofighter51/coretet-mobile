-- ============================================================
-- Check expired invites and how to resend them
-- ============================================================

-- 1. Check all expired pending invites
SELECT
  id,
  invited_email,
  invited_by,
  created_at,
  expires_at,
  status,
  EXTRACT(DAY FROM (NOW() - expires_at)) as days_expired
FROM band_invites
WHERE status = 'pending'
AND expires_at < NOW()
ORDER BY expires_at DESC;

-- 2. To resend an invite, you have two options:

-- OPTION A: Update the existing invite with new expiration and token
-- Replace <invite_id> with the actual ID from query above
/*
UPDATE band_invites
SET
  expires_at = NOW() + INTERVAL '7 days',
  invite_token = gen_random_uuid()::TEXT,
  created_at = NOW()
WHERE id = '<invite_id>'
RETURNING id, invited_email, invite_token, expires_at;
*/

-- OPTION B: Delete old invite and create a new one via the app
-- (This is cleaner - just use the "Invite Members" button in Band Settings)
-- First, delete the expired invite:
/*
DELETE FROM band_invites
WHERE id = '<invite_id>';
*/
-- Then use the app to send a new invite

-- 3. Check all invites for a specific email
-- Replace 'user@example.com' with actual email
/*
SELECT
  id,
  invited_email,
  status,
  created_at,
  expires_at,
  CASE
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as invite_status
FROM band_invites
WHERE invited_email = 'user@example.com'
ORDER BY created_at DESC;
*/
