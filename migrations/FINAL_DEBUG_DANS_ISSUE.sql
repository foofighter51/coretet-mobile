-- Final debug: Everything looks correct on client, so let's check server-side RLS
-- Dan's user ID: 929a7b64-b93e-430e-8a6f-7d0cc2c8d182

-- 1. What is the EXACT current bands INSERT policy?
SELECT
  '=== CURRENT BANDS INSERT POLICY ===' as section;

SELECT
  policyname,
  cmd,
  with_check,
  -- Try to identify the issue
  CASE
    WHEN with_check LIKE '%auth.uid()::text%' THEN '⚠️ USES ::TEXT CAST - MIGHT BE THE PROBLEM'
    WHEN with_check LIKE '%auth.uid()%' THEN '✅ Uses auth.uid()'
    ELSE '❓ Unknown check'
  END as analysis
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- 2. Check if there are MULTIPLE INSERT policies (they might conflict)
SELECT
  '=== ALL INSERT POLICIES ON BANDS ===' as section,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- Show all of them
SELECT
  policyname,
  permissive,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'bands' AND cmd = 'INSERT';

-- 3. Check if Dan's user_id is stored as TEXT or UUID in profiles
SELECT
  '=== DANS PROFILE ID TYPE ===' as section,
  id,
  pg_typeof(id) as id_type,
  id::text as id_as_text,
  id::uuid as id_as_uuid
FROM profiles
WHERE id = '929a7b64-b93e-430e-8a6f-7d0cc2c8d182';

-- 4. Test if auth.uid() would match Dan's ID
-- This simulates what RLS would check
SELECT
  '=== AUTH UID MATCH TEST ===' as section,
  '929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid as dans_id,
  ('929a7b64-b93e-430e-8a6f-7d0cc2c8d182'::uuid IS NOT NULL) as "uuid_is_not_null",
  ('929a7b64-b93e-430e-8a6f-7d0cc2c8d182' IS NOT NULL) as "text_is_not_null";

-- 5. MOST IMPORTANT: Try to actually INSERT as superuser
-- If this succeeds, it's definitely an RLS/auth issue
-- If this fails, it's a different constraint
SELECT '=== ACTUAL INSERT TEST (AS SUPERUSER) ===' as section;

-- Attempt the insert
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Test Monaco', '929a7b64-b93e-430e-8a6f-7d0cc2c8d182', false)
RETURNING id, name, created_by, created_at;

-- If above succeeded, delete it
DELETE FROM bands WHERE name = 'Test Monaco';

-- 6. Check if there's a constraint on bands table
SELECT
  '=== CONSTRAINTS ON BANDS TABLE ===' as section,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'bands'::regclass;

-- 7. Check if there's a CHECK constraint that might be failing
SELECT
  '=== CHECK CONSTRAINTS ===' as section,
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'bands'::regclass
AND contype = 'c';
