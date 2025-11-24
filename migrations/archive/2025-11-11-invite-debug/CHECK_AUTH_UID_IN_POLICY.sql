-- ============================================================
-- DEBUG: What does auth.uid() return in different contexts?
-- ============================================================

-- Check what auth.uid() returns when called directly
SELECT 'Direct auth.uid() call' as test, auth.uid() as result;

-- Check the function definition for auth.uid()
SELECT
  'auth.uid() function' as info,
  proname,
  prosrc as source
FROM pg_proc
WHERE proname = 'uid'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

-- Check if there's a different auth function we should be using
SELECT
  'All auth functions' as info,
  n.nspname as schema,
  p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth'
ORDER BY p.proname;
