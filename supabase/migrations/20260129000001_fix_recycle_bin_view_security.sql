-- Migration: Fix recycle_bin_items view security
-- Explicitly set SECURITY INVOKER to ensure RLS policies are respected
-- This resolves the Supabase security linter warning

-- Recreate the view with explicit SECURITY INVOKER
-- This ensures the view uses the querying user's permissions, not the definer's
CREATE OR REPLACE VIEW recycle_bin_items
WITH (security_invoker = true) AS
SELECT
  'track' as item_type,
  t.id,
  t.title as name,
  t.deleted_at,
  t.deleted_by,
  t.band_id,
  p.name as deleted_by_name,
  t.deleted_at + INTERVAL '30 days' as expires_at
FROM tracks t
LEFT JOIN profiles p ON t.deleted_by::uuid = p.id
WHERE t.deleted_at IS NOT NULL

UNION ALL

SELECT
  'work' as item_type,
  vg.id,
  vg.name,
  vg.deleted_at,
  vg.deleted_by,
  vg.band_id,
  p.name as deleted_by_name,
  vg.deleted_at + INTERVAL '30 days' as expires_at
FROM version_groups vg
LEFT JOIN profiles p ON vg.deleted_by::uuid = p.id
WHERE vg.deleted_at IS NOT NULL

UNION ALL

SELECT
  'set_list' as item_type,
  sl.id,
  sl.title as name,
  sl.deleted_at,
  sl.deleted_by,
  sl.band_id,
  p.name as deleted_by_name,
  sl.deleted_at + INTERVAL '30 days' as expires_at
FROM set_lists sl
LEFT JOIN profiles p ON sl.deleted_by::uuid = p.id
WHERE sl.deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

COMMENT ON VIEW recycle_bin_items IS 'View showing all items currently in the recycle bin (uses SECURITY INVOKER for RLS compliance)';
