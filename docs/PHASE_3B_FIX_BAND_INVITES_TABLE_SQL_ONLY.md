# Fix band_invites Table - SQL Only

Copy everything below this line (do NOT include the markdown code fences):

---

-- =====================================================
-- DROP AND RECREATE BAND_INVITES TABLE
-- =====================================================

-- Drop existing table (CASCADE removes dependent objects like policies)
DROP TABLE IF EXISTS band_invites CASCADE;

-- Create new table with correct schema
CREATE TABLE band_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX idx_band_invites_band_id ON band_invites(band_id);
CREATE INDEX idx_band_invites_token ON band_invites(invite_token);
CREATE INDEX idx_band_invites_email ON band_invites(invited_email);
CREATE INDEX idx_band_invites_status ON band_invites(status);

-- Enable RLS
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR BAND_INVITES
-- =====================================================

-- 1. Band members can view invites for their band
CREATE POLICY "Band members can view their band invites"
  ON band_invites FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM band_members WHERE user_id = auth.uid()::TEXT
    )
  );

-- 2. Band admins can create invites (owner or admin role)
CREATE POLICY "Band admins can create invites"
  ON band_invites FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('admin', 'owner')
    )
  );

-- 3. Admins can revoke (delete) pending invites
CREATE POLICY "Band admins can delete pending invites"
  ON band_invites FOR DELETE
  USING (
    status = 'pending'
    AND band_id IN (
      SELECT band_id FROM band_members
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('admin', 'owner')
    )
  );

-- 4. Anyone with valid token can view invite (for acceptance page)
CREATE POLICY "Anyone can view invite with valid token"
  ON band_invites FOR SELECT
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
  );

-- 5. Authenticated users can accept invites (update status)
CREATE POLICY "Users can accept invites"
  ON band_invites FOR UPDATE
  USING (
    invite_token IS NOT NULL
    AND status = 'pending'
    AND expires_at > NOW()
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    status IN ('accepted', 'expired')
    AND accepted_by = auth.uid()::TEXT
  );
