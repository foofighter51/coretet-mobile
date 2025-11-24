-- Check what columns actually exist in band_invites
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'band_invites'
ORDER BY ordinal_position;
