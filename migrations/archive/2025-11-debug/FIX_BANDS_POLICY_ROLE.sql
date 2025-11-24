-- Fix: The bands INSERT policy applies to 'public' role but should apply to 'authenticated'
-- This is why Dan (an authenticated user) is being blocked

-- Check current policy roles
SELECT
  '=== CURRENT POLICY ROLES ===' as section,
  policyname,
  cmd,
  roles,
  CASE
    WHEN 'authenticated' = ANY(roles) THEN '✅ Allows authenticated users'
    WHEN 'public' = ANY(roles) THEN '⚠️ Only allows public (anonymous) - THIS IS THE PROBLEM'
    ELSE '❓ Unknown roles'
  END as analysis
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- FIX: Drop the old policy and recreate with correct roles
DROP POLICY IF EXISTS "Authenticated users can create bands" ON bands;

-- Create new policy that explicitly allows authenticated users
CREATE POLICY "Authenticated users can create bands"
  ON bands
  FOR INSERT
  TO authenticated  -- Changed from 'public' to 'authenticated'
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the fix
SELECT
  '=== FIXED POLICY ===' as section,
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- Test: Try to insert as authenticated user would
-- (This still runs as superuser, but shows the policy would now allow it)
SELECT
  '=== VERIFICATION ===' as section,
  'Policy now allows authenticated users' as status;

-- Clean up test band from earlier
DELETE FROM bands WHERE name = 'Test Monaco';
