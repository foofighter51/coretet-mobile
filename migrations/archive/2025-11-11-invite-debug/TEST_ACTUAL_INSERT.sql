-- ============================================================
-- TEST: Try the actual INSERT in SQL
-- ============================================================
-- This will tell us if the issue is with the policy or with
-- how the JavaScript client is making the request
-- ============================================================

-- First, verify current policy
SELECT
  'Current policy' as info,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Set the auth context to Stephen's user
-- This simulates what happens when Stephen makes the request
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" TO '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01';

-- Try the INSERT (this will either succeed or show us the real error)
-- IMPORTANT: Run this carefully - it will actually insert if it works
INSERT INTO band_members (band_id, user_id, role)
VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
  '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid,
  'member'
)
RETURNING *;

-- Reset
RESET ROLE;

-- Check if it worked
SELECT 'Did it insert?' as check, COUNT(*) as count
FROM band_members
WHERE user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
AND band_id = '5184117c-ec73-4626-b1d6-36e9db334004';
