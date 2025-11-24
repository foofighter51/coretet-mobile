-- ============================================================
-- FIX: SELECT policy recursion - use SECURITY DEFINER properly
-- ============================================================
-- Problem: The SELECT policy queries band_members, causing recursion
-- Solution: Make is_user_in_band truly bypass RLS, then use it safely
-- ============================================================

-- First, ensure the function bypasses RLS
DROP FUNCTION IF EXISTS is_user_in_band(uuid, uuid);

CREATE OR REPLACE FUNCTION is_user_in_band(
  check_band_id UUID,
  check_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Run as function owner (postgres), bypassing RLS
SET search_path = public  -- Security: prevent search_path attacks
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO anon;

-- Now recreate the SELECT policy using the function
DROP POLICY IF EXISTS "Users can view band members" ON band_members;

CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    -- Use the SECURITY DEFINER function which bypasses RLS
    is_user_in_band(band_id, auth.uid())
  );

-- Verify
SELECT
  'SELECT policy with SECURITY DEFINER function' as status,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- Test the function directly (should work now)
SELECT
  'Function test' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '506e6736-a353-4ecc-8084-bf68a082e5fb'::uuid  -- Your user ID
  ) as result;
