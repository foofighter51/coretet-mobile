-- ============================================================================
-- Migration: Rename clerk_user_id() to current_user_id()
-- ============================================================================
-- Date: 2025-10-21
-- Purpose: Remove misleading Clerk references - we use Supabase native auth
-- Strategy: Create new function, keep old as alias temporarily for safety
--
-- IMPORTANT: This is a rename-only migration. The function logic is unchanged.
-- The function extracts user ID from JWT 'sub' claim, which works with both
-- Clerk JWT and Supabase Auth JWT (we're using Supabase Auth).
-- ============================================================================

-- ============================================================================
-- STEP 1: Create the new function with correct name
-- ============================================================================
-- This function extracts the user ID from JWT claims
-- Works with Supabase Auth (extracts 'sub' claim from JWT)

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.current_user_id() IS
  'Returns the current authenticated user ID from JWT sub claim (Supabase Auth)';

-- ============================================================================
-- STEP 2: Keep old function as alias for backwards compatibility
-- ============================================================================
-- This ensures existing policies continue to work during transition
-- We'll remove this alias in Phase 2 after updating all policies

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT public.current_user_id();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.clerk_user_id() IS
  'DEPRECATED: Use current_user_id() instead. Kept for backwards compatibility.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test that both functions return the same value:
-- SELECT
--   public.current_user_id() as new_function,
--   public.clerk_user_id() as old_function,
--   public.current_user_id() = public.clerk_user_id() as functions_match;
--
-- Expected result when authenticated: both return user ID, functions_match = true
-- Expected result when not authenticated: both return null, functions_match = true

-- ============================================================================
-- PHASE 2 PLAN (Future Migration)
-- ============================================================================
-- After updating all RLS policies to use current_user_id():
-- 1. DROP FUNCTION public.clerk_user_id();
-- 2. Update all policies to use current_user_id()
-- 3. Update all comments/documentation
--
-- For now, both functions work identically.
-- ============================================================================
