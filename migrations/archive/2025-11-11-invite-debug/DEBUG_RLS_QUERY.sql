-- Debug query to test the RLS policy logic
-- Run this while logged in as the user trying to create invites

-- Test 1: Check what auth.uid() returns
SELECT
  auth.uid() as current_auth_uid,
  auth.uid()::TEXT as current_auth_uid_text;

-- Test 2: Check if user is in band_members for the band
SELECT
  bm.id,
  bm.band_id,
  bm.user_id,
  bm.role,
  auth.uid() as current_user,
  (bm.user_id = auth.uid()) as matches_directly
FROM band_members bm
WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::UUID; -- Replace with your band ID

-- Test 3: Simulate the exact RLS policy check
SELECT
  EXISTS (
    SELECT 1 FROM band_members
    WHERE band_members.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::UUID
    AND band_members.user_id = auth.uid()
  ) as policy_would_pass;

-- Test 4: Check if there's a type mismatch we're missing
SELECT
  pg_typeof(auth.uid()) as auth_uid_type,
  pg_typeof(user_id) as user_id_type
FROM band_members
LIMIT 1;
