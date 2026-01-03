-- Create beta_signups table to track beta interest
CREATE TABLE IF NOT EXISTS beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'website', -- 'website', 'referral', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'invited', 'registered'
  notes TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON beta_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON beta_signups(status);

-- Enable RLS
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup form)
CREATE POLICY "Anyone can sign up for beta"
  ON beta_signups
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view (for admin purposes)
CREATE POLICY "Authenticated users can view beta signups"
  ON beta_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update status (for admin purposes)
CREATE POLICY "Authenticated users can update beta signups"
  ON beta_signups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE beta_signups IS 'Stores email addresses from beta signup form on landing page';
