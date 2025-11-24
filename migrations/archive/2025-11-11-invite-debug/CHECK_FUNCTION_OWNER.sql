-- Check who owns the is_user_in_band function
SELECT
  'Function owner' as check,
  n.nspname as schema,
  p.proname as function_name,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'is_user_in_band';

-- Check if RLS is enabled on band_members
SELECT
  'RLS status' as check,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'band_members';

-- The issue: If the function owner is 'postgres' and prosecdef is true,
-- then the function should run as postgres and bypass RLS.
-- If owner is NOT postgres, that's the problem!
