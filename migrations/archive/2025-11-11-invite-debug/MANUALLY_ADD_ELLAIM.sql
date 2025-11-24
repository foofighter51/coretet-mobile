-- Manually add Ella to the band to test if it works
-- This bypasses RLS (runs as admin) to test the INSERT itself

INSERT INTO band_members (
  band_id,
  user_id,
  role
) VALUES (
  '5184117c-ec73-4626-b1d6-36e9db334004',
  'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb',
  'member'
) RETURNING *;

-- Then update the invite status
UPDATE band_invites
SET
  status = 'accepted',
  accepted_at = NOW(),
  accepted_by = 'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb'
WHERE id = '71055b97-ff6e-4678-9808-740a2110e9e4'
RETURNING *;

-- Verify Ella is now a member
SELECT
  bm.id,
  bm.role,
  bm.joined_at,
  p.name,
  p.email
FROM band_members bm
JOIN profiles p ON p.id = bm.user_id
WHERE bm.user_id = 'ecbafffd-1ba5-47aa-b35b-9fec15a52eeb';
