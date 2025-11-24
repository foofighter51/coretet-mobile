-- Fix Stephen's profile by adding the correct email

-- First, verify this is the right user by checking auth.users
SELECT
  id,
  email,
  created_at
FROM auth.users
WHERE id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f';

-- Update the profile with the correct email
UPDATE profiles
SET email = 'stephenpjudy@gmail.com'
WHERE id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f';

-- Verify the update
SELECT
  id,
  email,
  name,
  created_at
FROM profiles
WHERE id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f';

-- Now test if the invite acceptance would work
SELECT EXISTS (
  SELECT 1 FROM band_invites
  WHERE band_invites.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'
  AND band_invites.invited_email IN (
    SELECT email FROM profiles
    WHERE id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f'
  )
  AND band_invites.status = 'pending'
  AND band_invites.expires_at > NOW()
) as can_accept_invite;
