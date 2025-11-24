-- ============================================================
-- FIX: DROP function with CASCADE to remove dependencies
-- ============================================================

-- Drop all policies that use is_user_in_band
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
DROP POLICY IF EXISTS "Users can view their bands" ON bands;

-- Now drop the function
DROP FUNCTION IF EXISTS is_user_in_band(uuid, uuid) CASCADE;

-- Recreate the function with proper SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_user_in_band(
  check_band_id UUID,
  check_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO anon;

-- Recreate band_members SELECT policy
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    is_user_in_band(band_id, auth.uid())
  );

-- Recreate bands SELECT policy
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

-- Verify
SELECT
  'Recreated policies' as status,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE (tablename = 'band_members' AND cmd = 'SELECT')
   OR (tablename = 'bands' AND cmd = 'SELECT')
ORDER BY tablename;

-- Test function
SELECT
  'Function test' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '506e6736-a353-4ecc-8084-bf68a082e5fb'::uuid
  ) as result;
