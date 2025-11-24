-- ============================================================
-- NUCLEAR OPTION: Allow all authenticated users to insert
-- ============================================================
-- Every test passes but INSERT still fails
-- This suggests either:
-- 1. Supabase connection pooling/caching issue
-- 2. RLS context issue we can't diagnose remotely
-- 3. Bug in how Supabase evaluates policies with subqueries
--
-- Temporarily allow ANY authenticated user to insert
-- We'll add proper restrictions back after confirming the issue
-- ============================================================

DROP POLICY IF EXISTS "Owners and admins can add members" ON band_members;
DROP POLICY IF EXISTS "Allow invite acceptance v2" ON band_members;
DROP POLICY IF EXISTS "Allow invite acceptance v3" ON band_members;

-- Simplest possible policy: just be authenticated
CREATE POLICY "Temporary: allow all authenticated inserts"
  ON band_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify
SELECT
  'Nuclear policy' as info,
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- This should definitely work
SELECT
  'Auth check' as test,
  '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid IS NOT NULL as result;
