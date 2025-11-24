-- Test INSERT as Dan's user to see exact error
-- Dan's UUID: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182

-- First, verify Dan's user exists
SELECT '=== DAN USER CHECK ===' as section;
SELECT id, email FROM auth.users WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- Check Dan's profile
SELECT '=== DAN PROFILE CHECK ===' as section;
SELECT id, email FROM profiles WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- Try to insert as superuser (should work regardless of RLS)
SELECT '=== SUPERUSER INSERT TEST ===' as section;
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Test Band Superuser', '929a7b64-b93e-430e-8a6f-7d0cc2c8d182', false)
RETURNING id, name, created_by;

-- Clean up
DELETE FROM bands WHERE name = 'Test Band Superuser';

-- Now check what the ACTUAL policy definition is
SELECT '=== ACTUAL INSERT POLICY ===' as section;
SELECT
  policyname,
  permissive,
  roles::text[],
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- Check if there are ANY restrictive policies
SELECT '=== CHECK FOR RESTRICTIVE POLICIES ===' as section;
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'bands'
AND permissive = 'RESTRICTIVE'
ORDER BY cmd;
