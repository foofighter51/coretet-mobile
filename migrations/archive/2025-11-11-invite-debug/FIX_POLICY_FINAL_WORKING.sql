-- ============================================================
-- FINAL FIX: Correct the bi.band_id = bi.band_id bug
-- ============================================================
-- The policy has: WHERE bi.band_id = bi.band_id (always true!)
-- Should be: WHERE bi.band_id = band_id (new row's band_id)
-- ============================================================

DROP POLICY IF EXISTS "Allow invite acceptance v3" ON band_members;

CREATE POLICY "Allow band member inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User being inserted has a valid pending invite
    EXISTS (
      SELECT 1
      FROM band_invites bi
      WHERE bi.band_id = band_id  -- NEW row's band_id (unqualified)
      AND bi.invited_email = (
        SELECT email FROM profiles WHERE id = user_id  -- NEW row's user_id (unqualified)
      )
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
    -- Case 2: Current authenticated user is admin/owner of the band
    OR band_id IN (
      SELECT bm.band_id
      FROM band_members bm
      WHERE bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
    -- Case 3: First member (band creation)
    OR NOT EXISTS (
      SELECT 1 FROM band_members bm WHERE bm.band_id = band_id
    )
  );

-- Verify
SELECT
  'Final policy' as status,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test with correct token
SELECT
  'Test with correct token' as test,
  EXISTS (
    SELECT 1
    FROM band_invites bi
    WHERE bi.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    AND bi.invited_email = (
      SELECT email FROM profiles WHERE id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'
    )
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  ) as should_be_true;
