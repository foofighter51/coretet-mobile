-- Migration: Add phone number requirements to profiles
-- Created: 2025-11-18
-- Purpose: Make phone_number required and unique for SMS sharing functionality

BEGIN;

-- Phone number column already exists (nullable)
-- We need to:
-- 1. Clean up any duplicate empty strings
-- 2. Make it unique (where not null)
-- 3. Eventually make it required (after users add their phones)

-- STEP 1: Convert empty strings to NULL (fixes duplicate empty string issue)
UPDATE profiles
SET phone_number = NULL
WHERE phone_number = '';

-- STEP 2: Add unique constraint (allows NULL but prevents duplicate phone numbers)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON profiles(phone_number)
  WHERE phone_number IS NOT NULL;

-- Add index for email (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email)
  WHERE email IS NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles(phone_number)
  WHERE phone_number IS NOT NULL;

-- Note: We're NOT making phone_number NOT NULL yet
-- Users will be prompted to add their phone number on next login
-- Once all active users have phone numbers, we can run a follow-up migration
-- to make it required

COMMIT;

-- Verification query
SELECT
  COUNT(*) as total_users,
  COUNT(phone_number) as users_with_phone,
  COUNT(*) - COUNT(phone_number) as users_without_phone
FROM profiles;
