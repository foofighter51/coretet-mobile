-- Test why the band_members INSERT policy is blocking Dan
-- The policy should allow inserting the FIRST member (creator as owner)

-- Current policy logic:
-- 1. has_valid_invite() - Should be FALSE (no invite for new band)
-- 2. User is owner/admin of this band - Should be FALSE (band is new, no members yet)
-- 3. Band has no members yet - Should be TRUE (first member condition)

-- Let's test each condition for a new band

SELECT '=== TESTING BAND_MEMBERS POLICY LOGIC ===' as section;

-- Simulate creating a new band
WITH test_scenario AS (
  SELECT
    '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid as user_id,
    'test-new-band-id'::uuid as new_band_id
)
SELECT
  'Condition 1: has_valid_invite' as condition_name,
  (SELECT has_valid_invite(ts.user_id, ts.new_band_id)) as result,
  'Should be FALSE for new band' as expected
FROM test_scenario ts
UNION ALL
SELECT
  'Condition 2: User is owner/admin',
  (ts.new_band_id IN (
    SELECT bm.band_id FROM band_members bm
    WHERE bm.user_id = ts.user_id
    AND bm.role IN ('owner', 'admin')
  ))::text,
  'Should be FALSE for new band'
FROM test_scenario ts
UNION ALL
SELECT
  'Condition 3: Band has no members',
  (NOT EXISTS (
    SELECT 1 FROM band_members bm
    WHERE bm.band_id = ts.new_band_id
  ))::text,
  'Should be TRUE - FIRST MEMBER ALLOWED'
FROM test_scenario ts;

-- The problem might be with the nested subquery reference
-- In RLS, `band_members.band_id` in the policy refers to the NEW row being inserted
-- But the subquery also references `band_members` table, which might cause confusion

SELECT '=== POTENTIAL ISSUE ===' as section;

SELECT
  'The policy uses "band_members.band_id" inside a subquery that queries "band_members" table' as issue,
  'This creates ambiguous table reference - which band_members are we checking?' as explanation,
  'Postgres might be checking the WRONG band_id' as result;

-- Check the has_valid_invite function definition
SELECT
  '=== has_valid_invite FUNCTION ===' as section,
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'has_valid_invite';

-- The issue: When inserting the FIRST member, the policy checks:
-- "NOT EXISTS (SELECT 1 FROM band_members bm WHERE bm.band_id = band_members.band_id)"
--
-- But which "band_members.band_id" does it mean?
-- - The NEW row being inserted? (correct)
-- - The table being queried in the subquery? (wrong, causes self-reference)

SELECT '=== SOLUTION ===' as section;

SELECT
  'We need to explicitly qualify the table reference in the policy' as solution,
  'Or use a SECURITY DEFINER function to bypass RLS for this check' as alternative;
