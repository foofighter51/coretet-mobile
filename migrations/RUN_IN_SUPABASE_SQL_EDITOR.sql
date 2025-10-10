-- ============================================================
-- PART 1: CREATE TABLES (Run this first)
-- Go to Supabase Dashboard → SQL Editor → New Query
-- Paste this entire section and click "Run"
-- ============================================================

-- Create bands table
CREATE TABLE IF NOT EXISTS bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_personal BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create band_members table
CREATE TABLE IF NOT EXISTS band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(band_id, user_id)
);

-- Create band_invites table
CREATE TABLE IF NOT EXISTS band_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

-- Add band_id columns to existing tables
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS band_id UUID REFERENCES bands(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_band_id ON tracks(band_id);
CREATE INDEX IF NOT EXISTS idx_playlists_band_id ON playlists(band_id);
CREATE INDEX IF NOT EXISTS idx_ratings_band_id ON ratings(band_id);
CREATE INDEX IF NOT EXISTS idx_comments_band_id ON comments(band_id);
CREATE INDEX IF NOT EXISTS idx_band_members_user_id ON band_members(user_id);
CREATE INDEX IF NOT EXISTS idx_band_members_band_id ON band_members(band_id);
CREATE INDEX IF NOT EXISTS idx_band_invites_email ON band_invites(email);
CREATE INDEX IF NOT EXISTS idx_band_invites_token ON band_invites(token);

-- ============================================================
-- PART 2: ENABLE RLS AND CREATE POLICIES (Run after Part 1)
-- ============================================================

-- Enable RLS on all band tables
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;

-- Bands: Users can only see bands they're members of
CREATE POLICY "Users can view their bands"
  ON bands FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Bands: Any authenticated user can create a band
CREATE POLICY "Authenticated users can create bands"
  ON bands FOR INSERT
  WITH CHECK (auth.uid()::TEXT IS NOT NULL);

-- Bands: Only owners can update
CREATE POLICY "Band owners can update"
  ON bands FOR UPDATE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'owner'
    )
  );

-- Bands: Only owners can delete
CREATE POLICY "Band owners can delete"
  ON bands FOR DELETE
  USING (
    id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role = 'owner'
    )
  );

-- Band Members: Users can view members of their bands
CREATE POLICY "Users can view band members"
  ON band_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Band Members: Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON band_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM band_members WHERE band_id = band_members.band_id)
  );

-- Band Members: Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
  ON band_members FOR DELETE
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
  );

-- Band Invites: Users can view invites for their bands or sent to them
CREATE POLICY "Users can view band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
    OR email IN (
      SELECT email FROM profiles WHERE id = auth.uid()::TEXT
    )
  );

-- Band Invites: Owners and admins can create invites
CREATE POLICY "Owners and admins can invite"
  ON band_invites FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('owner', 'admin')
    )
  );

-- Band Invites: Users can accept/decline invites sent to them
CREATE POLICY "Users can accept/decline invites"
  ON band_invites FOR UPDATE
  USING (
    email IN (
      SELECT email FROM profiles WHERE id = auth.uid()::TEXT
    )
  );

-- ============================================================
-- PART 3: HELPER FUNCTIONS (Run after Part 2)
-- ============================================================

-- Function to check if user is band member
CREATE OR REPLACE FUNCTION is_band_member(check_band_id UUID, check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is band owner/admin
CREATE OR REPLACE FUNCTION is_band_admin(check_band_id UUID, check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members
    WHERE band_id = check_band_id
    AND user_id = check_user_id
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PART 4: CREATE BEDEKER BAND (Run after Part 3)
-- Replace USER_ID with: 506e6736-a353-4ecc-8084-bf68a082e5fb
-- ============================================================

-- Create Bedeker band
INSERT INTO bands (name, created_by, is_personal)
VALUES ('Bedeker', '506e6736-a353-4ecc-8084-bf68a082e5fb', false)
RETURNING id;

-- COPY THE RETURNED ID FROM ABOVE, then run this with that ID:
-- INSERT INTO band_members (band_id, user_id, role)
-- VALUES ('PASTE_BAND_ID_HERE', '506e6736-a353-4ecc-8084-bf68a082e5fb', 'owner');

-- After adding yourself as owner, migrate your data:
-- UPDATE tracks SET band_id = 'PASTE_BAND_ID_HERE'
-- WHERE created_by = '506e6736-a353-4ecc-8084-bf68a082e5fb';

-- UPDATE playlists SET band_id = 'PASTE_BAND_ID_HERE'
-- WHERE created_by = '506e6736-a353-4ecc-8084-bf68a082e5fb';

-- UPDATE ratings SET band_id = 'PASTE_BAND_ID_HERE'
-- WHERE user_id = '506e6736-a353-4ecc-8084-bf68a082e5fb';

-- UPDATE comments SET band_id = 'PASTE_BAND_ID_HERE'
-- WHERE user_id = '506e6736-a353-4ecc-8084-bf68a082e5fb';
