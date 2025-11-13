-- Fix bands INSERT policy - WITH CHECK must allow the insert
-- Date: 2025-11-12
-- Issue: Band creation still failing with 403

-- The problem: WITH CHECK clause might be too restrictive or checking wrong things
-- Solution: Simplify to just verify user is authenticated

DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;
CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Simply verify the user is authenticated and created_by matches their ID
    created_by = auth.uid()
  );

-- Verification query
SELECT
  'bands INSERT policy' as policy,
  'WITH CHECK: created_by = auth.uid()' as condition,
  'Should allow any authenticated user to create a band if created_by matches their ID' as description;
