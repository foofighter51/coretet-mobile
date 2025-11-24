-- Migration: Add tier and subscription system to profiles
-- Created: 2025-11-18
-- Purpose: Enable freemium model with Free, Band, and Producer tiers

BEGIN;

-- Add tier and subscription columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
    CHECK (tier IN ('free', 'band', 'producer')),
  ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 1073741824, -- 1GB default
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'active', 'past_due', 'cancelled', 'trialing')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Update existing users to have explicit tier
UPDATE profiles
SET
  tier = 'free',
  storage_used = 0,
  storage_limit = 1073741824, -- 1GB
  subscription_status = 'none'
WHERE tier IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON profiles(subscription_status)
  WHERE subscription_status != 'none';

COMMIT;

-- Verification query
SELECT
  tier,
  COUNT(*) as user_count,
  SUM(storage_used) as total_storage_used,
  AVG(storage_limit) as avg_storage_limit
FROM profiles
GROUP BY tier;
