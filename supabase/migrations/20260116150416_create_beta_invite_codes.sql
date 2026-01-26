-- Migration: Create beta invite codes system
-- Date: 2026-01-16
-- Purpose: Allow beta testers to sign up with invite codes, bypassing email verification

-- Create beta_invite_codes table
CREATE TABLE beta_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '90 days',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT code_format CHECK (code ~ '^[A-Z0-9]{6,12}$')
);

-- Create beta_code_usage tracking table
CREATE TABLE beta_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES beta_invite_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_beta_invite_codes_code ON beta_invite_codes(code);
CREATE INDEX idx_beta_invite_codes_active ON beta_invite_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_beta_code_usage_user ON beta_code_usage(user_id);
CREATE INDEX idx_beta_code_usage_code ON beta_code_usage(code_id);

-- Enable RLS
ALTER TABLE beta_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all invite codes
CREATE POLICY "Admins can manage invite codes"
  ON beta_invite_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- RLS Policy: Anyone can verify codes (read-only for verification)
CREATE POLICY "Anyone can verify codes"
  ON beta_invite_codes FOR SELECT
  USING (is_active = TRUE AND expires_at > NOW());

-- RLS Policy: Users can view their own code usage
CREATE POLICY "Users can view their code usage"
  ON beta_code_usage FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: System can insert code usage (for signup process)
CREATE POLICY "System can insert code usage"
  ON beta_code_usage FOR INSERT
  WITH CHECK (TRUE);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_beta_invite_codes_updated_at
  BEFORE UPDATE ON beta_invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE beta_invite_codes IS 'Stores beta invite codes for controlled user onboarding';
COMMENT ON TABLE beta_code_usage IS 'Tracks which users used which invite codes';
