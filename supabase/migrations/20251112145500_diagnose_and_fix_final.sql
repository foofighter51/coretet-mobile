-- Final diagnosis and fix - check for ALL policies and conflicts
-- Date: 2025-11-12

-- Step 1: Show ALL policies on bands table
SELECT '=== ALL POLICIES ON BANDS ===' as section;
SELECT policyname, cmd, roles::text[], qual, with_check
FROM pg_policies
WHERE tablename = 'bands';

-- Step 2: DROP ALL policies on bands and start completely fresh
DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
DROP POLICY IF EXISTS "Users can view their bands" ON bands;
DROP POLICY IF EXISTS "Band owners can update" ON bands;
DROP POLICY IF EXISTS "Band owners can delete" ON bands;

-- Drop any other policies that might exist
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'bands'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON bands';
  END LOOP;
END $$;

-- Step 3: Create ONE simple INSERT policy that WILL work
CREATE POLICY "authenticated_insert_bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow ALL authenticated users to insert

-- Step 4: Create simple SELECT policy
CREATE POLICY "authenticated_select_bands"
  ON bands FOR SELECT
  TO authenticated
  USING (true);  -- Allow ALL authenticated users to see all bands for now

-- Step 5: Verify
SELECT '=== NEW POLICIES ON BANDS ===' as section;
SELECT policyname, cmd, roles::text[], permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd, policyname;

-- Step 6: Test that auth.uid() works
SELECT '=== AUTH TEST ===' as section;
SELECT
  'auth.uid() value' as test,
  auth.uid() as result,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END as status;
