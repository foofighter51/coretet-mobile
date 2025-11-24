-- Migration: Add storage tracking to bands table
-- Created: 2025-11-18
-- Purpose: Track storage usage per band for tier limits

BEGIN;

-- Add storage tracking columns to bands
ALTER TABLE bands
  ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 26843545600, -- 25GB default for band tier
  ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 10;

-- Update existing bands with defaults
UPDATE bands
SET
  storage_used = 0,
  storage_limit = 26843545600, -- 25GB
  max_members = 10
WHERE storage_used IS NULL;

-- Create index for storage queries
CREATE INDEX IF NOT EXISTS idx_bands_storage ON bands(storage_used, storage_limit);

COMMIT;

-- Verification query
SELECT
  COUNT(*) as total_bands,
  SUM(storage_used) as total_storage_used,
  AVG(storage_limit) as avg_storage_limit,
  AVG(max_members) as avg_max_members
FROM bands;
