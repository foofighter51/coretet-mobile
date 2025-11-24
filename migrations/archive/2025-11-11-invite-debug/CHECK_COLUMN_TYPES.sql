-- Check the actual data types of columns in band_members
SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'band_members'
AND column_name IN ('user_id', 'band_id', 'id')
ORDER BY ordinal_position;

-- Also check band_invites
SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'band_invites'
AND column_name IN ('invited_by', 'band_id', 'id', 'invited_email')
ORDER BY ordinal_position;

-- Check profiles table id column
SELECT
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'id';
