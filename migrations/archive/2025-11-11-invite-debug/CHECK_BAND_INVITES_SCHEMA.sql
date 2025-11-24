-- Check the actual band_invites table structure
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'band_invites'
ORDER BY ordinal_position;

-- Also check for any constraints that might be causing issues
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'band_invites'::regclass;
