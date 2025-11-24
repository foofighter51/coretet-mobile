-- Migration: Create SMS sharing infrastructure tables
-- Created: 2025-11-18 (Revised)
-- Purpose: Support SMS-based playlist sharing with access codes
-- NOTE: playlist_followers table already exists, so we skip it

BEGIN;

-- ============================================================
-- TABLE: shared_playlists
-- Purpose: Track playlists shared via SMS
-- ============================================================

CREATE TABLE IF NOT EXISTS shared_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Access control
  share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Analytics
  total_access_grants INT DEFAULT 0,
  total_plays INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: playlist_access_grants
-- Purpose: Individual SMS access codes per recipient
-- ============================================================

CREATE TABLE IF NOT EXISTS playlist_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_playlist_id UUID NOT NULL REFERENCES shared_playlists(id) ON DELETE CASCADE,

  -- Recipient identification (hashed for privacy)
  phone_number_hash TEXT NOT NULL,
  access_code TEXT NOT NULL, -- 6-character code (e.g., "A7K9M2")

  -- Access tracking
  is_used BOOLEAN DEFAULT FALSE,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,

  -- Expiry and revocation
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,

  -- Account linking (when SMS recipient creates account)
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(shared_playlist_id, phone_number_hash)
);

-- ============================================================
-- TABLE: playlist_followers (ALREADY EXISTS - just add column if missing)
-- Purpose: Track which users follow which playlists
-- ============================================================

-- Add source column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'playlist_followers' AND column_name = 'source'
  ) THEN
    ALTER TABLE playlist_followers
      ADD COLUMN source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'sms_share', 'band_member'));
  END IF;
END $$;

-- ============================================================
-- TABLE: sms_credits
-- Purpose: Track monthly SMS allowance per user
-- ============================================================

CREATE TABLE IF NOT EXISTS sms_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Credit tracking
  credits_total INT NOT NULL,
  credits_used INT DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_total - credits_used) STORED,

  -- Billing period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (credits_used >= 0),
  CHECK (credits_used <= credits_total)
);

-- ============================================================
-- TABLE: producer_waitlist
-- Purpose: Track interest in Producer tier
-- ============================================================

CREATE TABLE IF NOT EXISTS producer_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT,
  reason TEXT, -- Why they need Producer tier

  -- Metadata
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- shared_playlists indexes
CREATE INDEX IF NOT EXISTS idx_shared_playlists_token
  ON shared_playlists(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_playlists_playlist
  ON shared_playlists(playlist_id);
CREATE INDEX IF NOT EXISTS idx_shared_playlists_active
  ON shared_playlists(is_active)
  WHERE is_active = TRUE;

-- playlist_access_grants indexes
CREATE INDEX IF NOT EXISTS idx_playlist_access_grants_code
  ON playlist_access_grants(access_code);
CREATE INDEX IF NOT EXISTS idx_playlist_access_grants_phone
  ON playlist_access_grants(phone_number_hash);
CREATE INDEX IF NOT EXISTS idx_playlist_access_grants_claimed
  ON playlist_access_grants(claimed_by)
  WHERE claimed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_playlist_access_grants_active
  ON playlist_access_grants(shared_playlist_id, is_revoked, expires_at)
  WHERE is_revoked = FALSE;

-- playlist_followers indexes (may already exist)
CREATE INDEX IF NOT EXISTS idx_playlist_followers_user
  ON playlist_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_followers_playlist
  ON playlist_followers(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_followers_source
  ON playlist_followers(source)
  WHERE source IS NOT NULL;

-- sms_credits indexes
CREATE INDEX IF NOT EXISTS idx_sms_credits_user_period
  ON sms_credits(user_id, period_end);

-- producer_waitlist indexes
CREATE INDEX IF NOT EXISTS idx_producer_waitlist_email
  ON producer_waitlist(email);

COMMIT;

-- Verification query
SELECT
  'SMS sharing tables created' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'shared_playlists') as shared_playlists_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'playlist_access_grants') as access_grants_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'playlist_followers') as followers_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sms_credits') as sms_credits_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'producer_waitlist') as waitlist_exists;
