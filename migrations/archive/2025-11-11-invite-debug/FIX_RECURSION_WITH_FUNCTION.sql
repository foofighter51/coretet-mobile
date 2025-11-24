-- ============================================================
-- FIX: Infinite recursion using security definer function
-- ============================================================
-- Problem: band_members SELECT policy can't query band_members without recursion
-- Solution: Create a SECURITY DEFINER function that bypasses RLS
-- ============================================================

-- Create a function that checks if user is in a band (bypasses RLS)
CREATE OR REPLACE FUNCTION is_user_in_band(check_band_id UUID, check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Now recreate the band_members SELECT policy using the function
DROP POLICY IF EXISTS "Users can view band members" ON band_members;

CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    is_user_in_band(band_id, auth.uid())
  );

-- Also fix the "Users can view their bands" policy which has same issue
DROP POLICY IF EXISTS "Users can view their bands" ON bands;

CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    is_user_in_band(id, auth.uid())
  );

-- Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('bands', 'band_members')
AND cmd = 'SELECT';
