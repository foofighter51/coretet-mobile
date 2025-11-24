-- Check if the function is actually SECURITY DEFINER
SELECT
  'Function properties' as check,
  proname,
  prosecdef as is_security_definer,
  proconfig as settings
FROM pg_proc
WHERE proname = 'is_user_in_band';

-- Check what the SELECT policy actually says
SELECT
  'SELECT policy' as check,
  tablename,
  policyname,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- Try to manually call the function as if we're Stephen
-- This should NOT cause recursion
SELECT
  'Manual function call' as test,
  is_user_in_band(
    '5184117c-ec73-4626-b1d6-36e9db334004'::uuid,
    '97a9eeb5-bdbb-4c68-a80e-3eb845ef4c01'::uuid
  ) as result;

-- Check if there's still recursion somewhere
SELECT
  'Check for recursion pattern' as check,
  CASE
    WHEN qual LIKE '%is_user_in_band%' AND qual LIKE '%band_members%' THEN '⚠️ Potential recursion'
    ELSE '✓ No obvious recursion'
  END as diagnosis
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';
