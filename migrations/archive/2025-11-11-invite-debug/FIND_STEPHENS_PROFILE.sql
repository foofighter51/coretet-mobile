-- Find if Stephen created a profile with a different email or name

-- Check all profiles created recently (last 24 hours)
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Also check auth.users to see if account was created
-- (profiles might not have been synced)
SELECT
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email ILIKE '%stephen%'
   OR email ILIKE '%judy%'
ORDER BY created_at DESC;

-- Check for any profile matching the name
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE name ILIKE '%stephen%'
   OR name ILIKE '%judy%'
ORDER BY created_at DESC;
