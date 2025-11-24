-- Check if the policy actually updated or if it still has the bug
SELECT
  'Current INSERT policy text' as check,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Check if it still has the bi.band_id = bi.band_id bug
SELECT
  'Has bi.band_id = bi.band_id bug?' as check,
  CASE
    WHEN with_check LIKE '%bi.band_id = bi.band_id%' THEN '❌ YES - Bug still present'
    WHEN with_check LIKE '%bi.band_id = band_id%' THEN '✅ NO - Bug is fixed'
    ELSE '? Unknown'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Manually test what the policy SHOULD evaluate to
SELECT
  'Manual policy test for Stephen' as test,
  (
    -- Case 1: Valid invite exists
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
    -- Case 2: User is admin/owner
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
      AND bm.role IN ('owner', 'admin')
    )
    OR
    -- Case 3: First member
    NOT EXISTS (
      SELECT 1 FROM band_members bm
      WHERE bm.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    )
  ) as should_pass;
