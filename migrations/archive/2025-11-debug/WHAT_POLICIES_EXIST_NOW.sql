-- Simple check: What INSERT policies exist on bands RIGHT NOW?

SELECT
  policyname as name,
  roles::text[] as who_can_use,
  with_check as condition
FROM pg_policies
WHERE tablename = 'bands'
AND cmd = 'INSERT';
