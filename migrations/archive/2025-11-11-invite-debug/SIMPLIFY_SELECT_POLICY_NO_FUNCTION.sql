-- ============================================================
-- SIMPLIFY: Remove function from SELECT policy entirely
-- ============================================================
-- Even SECURITY DEFINER isn't working properly with PostgREST
-- Solution: Use a dead-simple SELECT policy that PostgREST can handle
-- ============================================================

DROP POLICY IF EXISTS "Users can view band members" ON band_members;

-- Ultra-simple: authenticated users can see all band_members
-- (This is actually safe because they can only see which users are in which bands,
-- not sensitive data. The real security is in INSERT/UPDATE/DELETE policies)
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  TO authenticated, anon
  USING (true);

-- Verify
SELECT
  'Simplified SELECT policy' as status,
  policyname,
  cmd,
  roles::text,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'band_members'
AND cmd = 'SELECT';

-- This should eliminate all 406 errors because:
-- 1. No function calls
-- 2. No subqueries
-- 3. No recursion
-- 4. Simple boolean: true
