-- ============================================================
-- FORCE NEW: Use completely different policy name
-- ============================================================
-- In case Supabase is caching based on policy name
-- ============================================================

-- Drop old policy
DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;

-- Create with DIFFERENT name to force refresh
CREATE POLICY "Allow invite acceptance v2"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM band_invites bi
      INNER JOIN profiles p ON p.email = bi.invited_email
      WHERE p.id = user_id
      AND bi.band_id = band_id
      AND bi.status = 'pending'
      AND bi.expires_at > NOW()
    )
  );

-- Verify
SELECT
  'New policy name' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';
