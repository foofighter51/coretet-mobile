-- Fix duplicate phone numbers before creating unique index
-- The error "Key (phone_number)=() is duplicated" means there are multiple rows with empty string ''

BEGIN;

-- Step 1: Check current state
SELECT
  CASE
    WHEN phone_number IS NULL THEN 'NULL'
    WHEN phone_number = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END AS phone_status,
  COUNT(*) as count
FROM profiles
GROUP BY phone_status;

-- Step 2: Convert empty strings to NULL
UPDATE profiles
SET phone_number = NULL
WHERE phone_number = '';

-- Step 3: Verify duplicates are gone
SELECT
  phone_number,
  COUNT(*) as count
FROM profiles
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1;

COMMIT;

-- Now you can run the migration that creates the unique index
