-- ============================================================
-- SIMPLIFY: Don't join with profiles, just match email directly
-- ============================================================
-- The JOIN with profiles might be causing RLS issues
-- Instead, get the user's email and compare directly
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;
DROP POLICY IF EXISTS "Allow invite acceptance v2" ON band_members;

CREATE POLICY "Allow invite acceptance v3"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Check if there's a pending invite for this band with this user's email
    EXISTS (
      SELECT 1
      FROM band_invites bi
      WHERE bi.band_id = band_id  -- NEW row's band_id
      AND bi.invited_email = (
        SELECT email FROM profiles WHERE id = user_id  -- NEW row's user_id
      )
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
  );

-- Verify
SELECT
  'Simplified policy without JOIN' as info,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test
SELECT
  'Test simplified logic' as test,
  EXISTS (
    SELECT 1
    FROM band_invites bi
    WHERE bi.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    AND bi.invited_email = (
      SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    )
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  ) as result;
