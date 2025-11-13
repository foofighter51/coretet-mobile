-- Fix SELECT policy to allow viewing bands you created
-- Date: 2025-11-12
-- Issue: INSERT fails because .select() can't return the band after creation

-- The problem: After INSERT, the code does .select() to get the band back
-- But the user isn't a band_member yet (that happens in next INSERT)
-- So the SELECT policy blocks them from seeing their own newly-created band

DROP POLICY IF EXISTS "authenticated_select_bands" ON bands;
CREATE POLICY "authenticated_select_bands"
  ON bands FOR SELECT
  TO authenticated
  USING (
    -- Can see bands you're a member of
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = bands.id
      AND band_members.user_id = auth.uid()
      LIMIT 1
    )
    OR
    -- Can see bands you just created (even before becoming a member)
    created_by = auth.uid()
  );

SELECT '=== FIXED SELECT POLICY ===' as section;
SELECT policyname, cmd,
  CASE
    WHEN with_check = 'true' THEN 'WITH CHECK: true'
    WHEN qual LIKE '%created_by = auth.uid()%' THEN 'USING: member OR creator'
    ELSE left(qual, 100)
  END as condition
FROM pg_policies
WHERE tablename = 'bands'
ORDER BY cmd;
