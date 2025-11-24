-- Clean up Stephen's failed invite attempt and start fresh

-- 1. Delete the old invite
DELETE FROM band_invites
WHERE invite_token = '2f2e1630-0a55-4931-b1be-779a16a922ee';

-- 2. Delete Stephen's profile (cascade will handle auth.users)
DELETE FROM profiles
WHERE id = '56920ca2-edba-4cac-aefe-bd7f7676fc1f';

-- 3. Also need to delete from auth.users directly (profiles delete won't cascade up)
-- NOTE: You may need to do this via Supabase Dashboard → Authentication → Users
-- Or use the Supabase Auth Admin API

-- 4. Verify cleanup
SELECT COUNT(*) as remaining_invites
FROM band_invites
WHERE invited_email = 'stephenpjudy@gmail.com';

SELECT COUNT(*) as remaining_profiles
FROM profiles
WHERE email = 'stephenpjudy@gmail.com'
   OR name = 'Stephen';

-- After cleanup, create a new invite via the app:
-- 1. Go to Band Settings
-- 2. Click "Invite New Member"
-- 3. Enter: stephenpjudy@gmail.com
-- 4. Send the NEW invite link to Stephen
