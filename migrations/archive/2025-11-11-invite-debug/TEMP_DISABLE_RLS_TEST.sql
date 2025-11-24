-- TEMPORARY: Disable RLS on band_invites to test if that's the issue
-- WARNING: This removes security - only for testing!

ALTER TABLE band_invites DISABLE ROW LEVEL SECURITY;

-- To re-enable after testing:
-- ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;
