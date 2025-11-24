-- ============================================================
-- FINAL CHECK: What's actually being evaluated?
-- ============================================================

-- 1. Show the exact current policy
SELECT
  '1. Current policy' as step,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- 2. Simulate the EXACT INSERT that will happen
-- Test each clause of the policy separately
SELECT '2. Test Case 1: Valid invite exists' as step,
  EXISTS (
    SELECT 1
    FROM band_invites bi
    WHERE bi.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid  -- NEW row's band_id
    AND bi.invited_email = (
      SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'  -- NEW row's user_id
    )
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  ) as result;

SELECT '3. Test Case 2: User is admin/owner' as step,
  '5184117c-ec73-4626-b1d6-36e9db334004'::uuid IN (
    SELECT bm.band_id
    FROM band_members bm
    WHERE bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'  -- auth.uid() would be this
    AND bm.role IN ('owner', 'admin')
  ) as result;

SELECT '4. Test Case 3: First member' as step,
  NOT EXISTS (
    SELECT 1 FROM band_members bm
    WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
  ) as result;

-- 5. Test combined (should be true if ANY case is true)
SELECT '5. Combined test (should pass)' as step,
  (
    EXISTS (
      SELECT 1
      FROM band_invites bi
      WHERE bi.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
      AND bi.invited_email = (
        SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      )
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
    OR
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND bm.role IN ('owner', 'admin')
    )
    OR
    NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    )
  ) as should_pass;

-- 6. Check if there's a trigger that might be blocking
SELECT '6. Triggers on band_members' as step,
  tgname as trigger_name,
  tgtype as trigger_type,
  tgenabled as is_enabled
FROM pg_trigger
WHERE tgrelid = 'band_members'::regclass
AND tgisinternal = false;

-- 7. One more time - check the invite actually exists with correct token
SELECT '7. Invite with correct token' as step,
  id,
  band_id,
  invited_email,
  status,
  expires_at > NOW() as is_valid
FROM band_invites
WHERE invite_token = '5cfae6f0-9511-488f-9ff7-589c4f63af1b';
