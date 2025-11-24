-- Fix Supabase Security Advisor warnings
-- Date: 2025-11-12

-- ============================================================
-- ISSUE 1: Function Search Path Mutable (Security Risk)
-- ============================================================
-- Functions without SET search_path are vulnerable to search_path attacks
-- Fix: Add SET search_path = public to all SECURITY DEFINER functions

SELECT '=== FIXING FUNCTION SEARCH PATHS ===' as section;

-- 1. current_user_id function
ALTER FUNCTION current_user_id() SET search_path = public;

-- 2. clerk_user_id function
ALTER FUNCTION clerk_user_id() SET search_path = public;

-- 3. is_band_member function
ALTER FUNCTION is_band_member(uuid) SET search_path = public;

-- 4. is_band_admin function
ALTER FUNCTION is_band_admin(uuid) SET search_path = public;

-- 5. has_valid_invite function
ALTER FUNCTION has_valid_invite(uuid, uuid) SET search_path = public;

-- 6. notify_admin_new_profile function
ALTER FUNCTION notify_admin_new_profile() SET search_path = public;

-- 7. get_version_rating_counts function
ALTER FUNCTION get_version_rating_counts(uuid) SET search_path = public;

-- 8. update_updated_at_column function (trigger function)
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- ============================================================
-- ISSUE 2: Leaked Password Protection Disabled
-- ============================================================
-- Auth password protection should be enabled for security

SELECT '=== PASSWORD PROTECTION WARNING ===' as section;

SELECT
  'Leaked Password Protection is disabled' as warning,
  'This should be enabled in Supabase Dashboard' as action,
  'Go to: Authentication → Policies → Password Protection' as location,
  'Enable: Check for leaked passwords using HaveIBeenPwned' as fix;

-- Note: This cannot be fixed via SQL, must be enabled in Supabase Dashboard

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '=== VERIFICATION: FUNCTION SECURITY ===' as section;

SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config,
  CASE
    WHEN prosecdef = true AND proconfig IS NULL THEN '⚠️ SECURITY DEFINER without search_path - VULNERABLE'
    WHEN prosecdef = true AND proconfig IS NOT NULL THEN '✅ SECURITY DEFINER with search_path - SECURE'
    ELSE '✅ Not SECURITY DEFINER'
  END as security_status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'current_user_id',
    'clerk_user_id',
    'is_band_member',
    'is_band_admin',
    'has_valid_invite',
    'notify_admin_new_profile',
    'get_version_rating_counts',
    'update_updated_at_column'
  )
ORDER BY proname;

-- ============================================================
-- SUMMARY
-- ============================================================

SELECT '=== SUMMARY ===' as section;

SELECT
  'Fixed function search paths' as fix_type,
  '8 functions now have SET search_path = public' as description
UNION ALL
SELECT
  'Password protection warning',
  'Must be enabled manually in Supabase Dashboard → Authentication → Policies';

SELECT '=== NEXT STEPS ===' as section,
  '1. Verify all functions show "SECURE" status above' as step1,
  '2. Enable leaked password protection in Supabase Dashboard' as step2,
  '3. Re-run Security Advisor to confirm all warnings resolved' as step3;
