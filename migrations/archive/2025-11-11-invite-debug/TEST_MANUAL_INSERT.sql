-- Test manual insert with your actual user ID
-- This bypasses the application code and tests RLS directly

-- First, verify your auth context
SELECT
  auth.uid() as my_id,
  auth.role() as my_role;

-- Try to insert with minimal columns (let defaults handle the rest)
INSERT INTO band_invites (
  band_id,
  invited_by,
  invited_email
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',
  '506e6736-a353-4ecc-8084-bf68a082e5fb',
  'test@example.com'
) RETURNING *;

-- If above works, the issue is with invite_token column
-- If above fails, run this to see all required columns:
SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'band_invites'
AND is_nullable = 'NO'
AND column_default IS NULL;
