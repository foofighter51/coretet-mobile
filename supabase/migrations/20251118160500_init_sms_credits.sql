-- Migration: Initialize SMS credits for existing users
-- Created: 2025-11-18
-- Purpose: Give all existing users their monthly SMS credit allocation

BEGIN;

-- Initialize SMS credits for all existing users based on their tier
INSERT INTO sms_credits (user_id, credits_total, credits_used, period_start, period_end)
SELECT
  id as user_id,
  CASE
    WHEN tier = 'free' THEN 10
    WHEN tier = 'band' THEN 50
    WHEN tier = 'producer' THEN 200
    ELSE 10 -- Default to free tier credits
  END AS credits_total,
  0 AS credits_used,
  CURRENT_DATE AS period_start,
  (CURRENT_DATE + INTERVAL '1 month') AS period_end
FROM profiles
WHERE id NOT IN (
  -- Don't create duplicate credits if they already exist
  SELECT user_id FROM sms_credits WHERE period_end > CURRENT_DATE
);

COMMIT;

-- Verification query
SELECT
  p.tier,
  COUNT(*) as users_with_credits,
  AVG(sc.credits_total) as avg_credits_allocated,
  SUM(sc.credits_remaining) as total_remaining_credits
FROM profiles p
JOIN sms_credits sc ON sc.user_id = p.id
WHERE sc.period_end > CURRENT_DATE
GROUP BY p.tier
ORDER BY p.tier;
