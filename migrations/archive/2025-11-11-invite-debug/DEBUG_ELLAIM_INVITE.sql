-- Debug ellaim2979@gmail.com invite acceptance issue

-- 1. Check the invite
SELECT
  id,
  band_id,
  invited_email,
  invite_token,
  status,
  expires_at
FROM band_invites
WHERE invite_token = 'd1c38483-9db0-44af-aee3-0733ea045726';

-- 2. Check if profile exists with correct email
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE email = 'ellaim2979@gmail.com';

-- 3. Check for profiles with similar name
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE name ILIKE '%ella%'
   OR name ILIKE '%ella%'
ORDER BY created_at DESC;

-- 4. Check recent profiles (last hour)
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
