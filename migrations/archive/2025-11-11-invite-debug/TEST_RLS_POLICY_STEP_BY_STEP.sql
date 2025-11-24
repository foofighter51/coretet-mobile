-- ============================================================
-- RLS POLICY DEBUG: Step-by-step testing
-- Run these queries ONE AT A TIME in Supabase SQL Editor
-- Make sure you're logged in as the user trying to create invites
-- ============================================================

-- STEP 1: Verify you're authenticated
-- Expected: Should return your user ID (506e6736-a353-4ecc-8084-bf68a082e5fb)
SELECT
  auth.uid() as my_user_id,
  auth.uid() IS NOT NULL as am_i_authenticated;

-- STEP 2: Check your band membership
-- Replace BAND_ID with: 5184117c-ec73-4626-b1d6-36e9db334004
SELECT
  id,
  band_id,
  user_id,
  role,
  (user_id = auth.uid()) as is_this_me
FROM band_members
WHERE band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::UUID;

-- STEP 3: Test the exact EXISTS clause from the policy
-- This should return TRUE if policy should pass
SELECT EXISTS (
  SELECT 1 FROM band_members
  WHERE band_members.band_id = '5184117c-ec73-4626-b1d6-36e9db334004'::UUID
  AND band_members.user_id = auth.uid()
) as should_policy_pass;

-- STEP 4: Check ALL policies on band_invites
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'band_invites'
ORDER BY policyname;

-- STEP 5: Try a manual INSERT to see exact error
-- This mimics what the app is trying to do
INSERT INTO band_invites (
  band_id,
  invited_by,
  invited_email,
  invite_token,
  status,
  expires_at
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004'::UUID,
  auth.uid(),
  'test@example.com',
  gen_random_uuid()::TEXT,
  'pending',
  NOW() + INTERVAL '7 days'
);

-- If step 5 fails, try this variation:
-- STEP 6: Insert with explicit user ID (replace with your ID)
INSERT INTO band_invites (
  band_id,
  invited_by,
  invited_email,
  invite_token,
  status,
  expires_at
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004'::UUID,
  '506e6736-a353-4ecc-8084-bf68a082e5fb'::UUID,
  'test2@example.com',
  gen_random_uuid()::TEXT,
  'pending',
  NOW() + INTERVAL '7 days'
);

-- STEP 7: Check if there are MULTIPLE policies conflicting
-- (Sometimes one policy passes but another blocks)
SELECT
  policyname,
  permissive,
  cmd,
  CASE
    WHEN cmd = 'INSERT' THEN 'Uses WITH CHECK'
    WHEN cmd = 'SELECT' THEN 'Uses USING'
    ELSE 'Uses BOTH'
  END as which_clause_matters
FROM pg_policies
WHERE tablename = 'band_invites';
