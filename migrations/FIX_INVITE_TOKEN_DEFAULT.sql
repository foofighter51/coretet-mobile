-- Fix: Add missing default value for invite_token column
-- The migration file says it should have DEFAULT gen_random_uuid()::TEXT
-- but it's missing in the actual database

-- Check current state
SELECT
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'band_invites'
AND column_name = 'invite_token';

-- Add the default value that should have been there
ALTER TABLE band_invites
  ALTER COLUMN invite_token SET DEFAULT gen_random_uuid()::TEXT;

-- Verify it was added
SELECT
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'band_invites'
AND column_name = 'invite_token';

-- Test insert again (should work now)
INSERT INTO band_invites (
  band_id,
  invited_by,
  invited_email
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',
  '506e6736-a353-4ecc-8084-bf68a082e5fb',
  'testdefault@example.com'
) RETURNING id, invite_token, invited_email;
