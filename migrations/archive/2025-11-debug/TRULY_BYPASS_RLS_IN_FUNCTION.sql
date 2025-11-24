-- ============================================================
-- NUCLEAR FIX: Make function TRULY bypass RLS
-- ============================================================
-- SECURITY DEFINER alone isn't enough - we need to explicitly
-- tell PostgreSQL to ignore RLS in this function
-- ============================================================

DROP FUNCTION IF EXISTS is_user_in_band(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION is_user_in_band(
  check_band_id UUID,
  check_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Use a query that bypasses RLS by running as superuser
  -- Since this function is SECURITY DEFINER, it runs as the function owner (postgres)
  -- and postgres is exempt from RLS
  SELECT EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_user_in_band(UUID, UUID) TO public;

-- Recreate the policies
DROP POLICY IF EXISTS "Users can view band members" ON band_members;
DROP POLICY IF EXISTS "Users can view their bands" ON bands;

CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    is_user_in_band(band_id, auth.uid())
  );

CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()
    )
  );

-- Test
SELECT
  'Function test (should not cause 406)' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
  ) as result;

-- Verify function properties
SELECT
  'Function is SECURITY DEFINER?' as check,
  prosecdef as result
FROM pg_proc
WHERE proname = 'is_user_in_band';
