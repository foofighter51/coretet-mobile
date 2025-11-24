-- ============================================================
-- INLINE: Don't use function, inline the invite check directly
-- ============================================================
-- Maybe the SECURITY DEFINER function isn't working in RLS context
-- Let's inline the exact same logic
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Inline the invite check (same logic as has_valid_invite function)
    EXISTS (
      SELECT 1
      FROM band_invites bi
      INNER JOIN profiles p ON p.email = bi.invited_email
      WHERE p.id = user_id  -- user_id = the NEW row's user_id
      AND bi.band_id = band_id  -- band_id = the NEW row's band_id
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
  );

-- Verify
SELECT
  'Inlined policy' as status,
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Test the exact logic
SELECT
  'Inlined check test' as test,
  EXISTS (
    SELECT 1
    FROM band_invites bi
    INNER JOIN profiles p ON p.email = bi.invited_email
    WHERE p.id = '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
    AND bi.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::uuid
    AND bi.status = 'pending'
    AND bi.expires_at > NOW()
  ) as result;
