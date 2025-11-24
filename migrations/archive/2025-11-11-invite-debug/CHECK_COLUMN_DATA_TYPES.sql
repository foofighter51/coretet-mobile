-- Check the actual data types in the database
SELECT
  'band_members column types' as info,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'band_members'
AND column_name IN ('user_id', 'band_id')
ORDER BY column_name;

SELECT
  'profiles column types' as info,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'id';

SELECT
  'Sample user_id from band_members' as info,
  user_id,
  pg_typeof(user_id) as type
FROM band_members
LIMIT 1;

SELECT
  'Sample profile id' as info,
  id,
  pg_typeof(id) as type
FROM profiles
LIMIT 1;
