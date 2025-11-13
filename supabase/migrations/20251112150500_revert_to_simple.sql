-- Revert to the simple INSERT policy that worked
-- Date: 2025-11-12
-- The previous secure policy broke again, reverting to what worked

-- Keep INSERT simple - this is what worked for "Monaco"
DROP POLICY IF EXISTS "authenticated_insert_bands" ON bands;
CREATE POLICY "authenticated_insert_bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep SELECT, UPDATE, DELETE as they are (those are fine)

SELECT '=== REVERTED TO WORKING INSERT POLICY ===' as section;
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'bands'
AND cmd = 'INSERT';
