-- Fix Supabase Security Advisor warnings
-- Date: 2025-11-12

-- ============================================================
-- ISSUE: Function Search Path Mutable (Security Risk)
-- ============================================================
-- Functions without SET search_path are vulnerable to search_path attacks
-- Fix: Add SET search_path = public to all SECURITY DEFINER functions

-- Note: Using DO block with dynamic SQL to handle functions that may or may not exist
DO $$
DECLARE
  func_exists boolean;
BEGIN
  -- 1. current_user_id function
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'current_user_id') INTO func_exists;
  IF func_exists THEN
    ALTER FUNCTION current_user_id() SET search_path = public;
  END IF;

  -- 2. clerk_user_id function
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'clerk_user_id') INTO func_exists;
  IF func_exists THEN
    ALTER FUNCTION clerk_user_id() SET search_path = public;
  END IF;

  -- 3. notify_admin_new_profile function
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'notify_admin_new_profile') INTO func_exists;
  IF func_exists THEN
    ALTER FUNCTION notify_admin_new_profile() SET search_path = public;
  END IF;

  -- 4. update_updated_at_column function (trigger function)
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') INTO func_exists;
  IF func_exists THEN
    ALTER FUNCTION update_updated_at_column() SET search_path = public;
  END IF;

  -- 5. get_band_member_count function
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_band_member_count') INTO func_exists;
  IF func_exists THEN
    EXECUTE 'ALTER FUNCTION get_band_member_count(uuid) SET search_path = public';
  END IF;

  -- 6. get_version_rating_counts function
  SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_version_rating_counts') INTO func_exists;
  IF func_exists THEN
    EXECUTE 'ALTER FUNCTION get_version_rating_counts(uuid) SET search_path = public';
  END IF;

  -- Functions with multiple signatures - try each
  -- 7. is_band_member function
  BEGIN
    ALTER FUNCTION is_band_member(uuid) SET search_path = public;
  EXCEPTION WHEN undefined_function THEN
    NULL; -- Function doesn't exist, skip
  END;

  -- 8. is_band_admin function
  BEGIN
    ALTER FUNCTION is_band_admin(uuid) SET search_path = public;
  EXCEPTION WHEN undefined_function THEN
    NULL; -- Function doesn't exist, skip
  END;

  -- 9. has_valid_invite function
  BEGIN
    ALTER FUNCTION has_valid_invite(uuid, uuid) SET search_path = public;
  EXCEPTION WHEN undefined_function THEN
    NULL; -- Function doesn't exist, skip
  END;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================

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
-- MANUAL STEP REQUIRED
-- ============================================================
-- NOTE: Leaked Password Protection must be enabled manually in Supabase Dashboard
-- Go to: Authentication → Policies → Password Protection
-- Enable: "Check for leaked passwords using HaveIBeenPwned"
