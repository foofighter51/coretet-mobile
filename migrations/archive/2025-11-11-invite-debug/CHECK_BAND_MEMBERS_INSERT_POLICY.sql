-- Check the INSERT policy on band_members
SELECT
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'INSERT';

-- Current policy likely requires user to be owner/admin
-- But when accepting an invite, the NEW user isn't a member yet!
-- This is a chicken-and-egg problem
