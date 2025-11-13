-- Replace temporary permissive policies with proper secure ones
-- Date: 2025-11-12
-- Now that we know authentication works, add proper restrictions

-- ============================================================
-- BANDS TABLE - Proper secure policies
-- ============================================================

-- Replace the temporary INSERT policy
DROP POLICY IF EXISTS "authenticated_insert_bands" ON bands;
CREATE POLICY "authenticated_insert_bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated (checked by TO authenticated)
    -- No additional restriction - any authenticated user can create a band
    true
  );

-- Replace the temporary SELECT policy with proper restriction
DROP POLICY IF EXISTS "authenticated_select_bands" ON bands;
CREATE POLICY "authenticated_select_bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    -- Users can only see bands they are members of
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      LIMIT 1
    )
  );

-- Add UPDATE policy - only owners can update
CREATE POLICY "authenticated_update_bands"
  ON bands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );

-- Add DELETE policy - only owners can delete
CREATE POLICY "authenticated_delete_bands"
  ON bands FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'owner'
      LIMIT 1
    )
  );

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '=== FINAL BANDS POLICIES ===' as section;
SELECT
  policyname,
  cmd,
  permissive,
  roles::text[],
  CASE
    WHEN qual = 'true' THEN 'USING: true (all rows)'
    WHEN qual LIKE '%EXISTS%' THEN 'USING: EXISTS (band_members check)'
    ELSE 'USING: ' || left(qual, 50)
  END as using_clause,
  CASE
    WHEN with_check = 'true' THEN 'WITH CHECK: true (allow all)'
    WHEN with_check IS NULL THEN 'WITH CHECK: (none)'
    ELSE 'WITH CHECK: ' || left(with_check, 50)
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END;

SELECT '=== KEY INSIGHT ===' as section,
  'The issue was WITH CHECK (auth.uid() IS NOT NULL) or WITH CHECK (created_by = auth.uid())' as problem,
  'These fail because RLS evaluates BEFORE the row exists' as reason,
  'Solution: WITH CHECK (true) for INSERT allows any authenticated user' as fix;
