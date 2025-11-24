-- ============================================================
-- FIX: Drop the OLD restrictive policy with broken type cast
-- Then recreate with correct policy for "any band member can invite"
-- ============================================================

-- THE PROBLEM: The old "Owners and admins can invite" policy still exists
-- and it has auth.uid()::TEXT which causes "operator does not exist: text = uuid"
-- Since ALL policies must pass, the old broken policy is blocking inserts

-- Step 1: Drop the old restrictive policy
DROP POLICY IF EXISTS "Owners and admins can invite" ON band_invites;

-- Step 2: Drop our attempted fix policy (in case it exists)
DROP POLICY IF EXISTS "Band members can invite" ON band_invites;

-- Step 3: Create the new democratic policy with correct types
-- Since user_id is UUID and auth.uid() returns UUID, no casting needed
CREATE POLICY "Band members can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = band_invites.band_id
      AND band_members.user_id = auth.uid()
    )
  );

-- Step 4: Verify the policy was created correctly
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_invites'
AND cmd = 'INSERT';

-- Step 5: You should see ONLY "Band members can invite" policy for INSERT
-- If you see "Owners and admins can invite", the DROP didn't work
