-- Comprehensive Database Schema Inspection
-- Run this in Supabase SQL Editor to get complete picture

-- ============================================================
-- 1. LIST ALL TABLES
-- ============================================================
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================
-- 2. PROFILES TABLE - COMPLETE STRUCTURE
-- ============================================================
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================
-- 3. PROFILES TABLE - CONSTRAINTS & INDEXES
-- ============================================================
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
ORDER BY contype;

-- Indexes on profiles
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
ORDER BY indexname;

-- ============================================================
-- 4. CHECK FOR DUPLICATE PHONE NUMBERS
-- ============================================================
SELECT
  phone_number,
  COUNT(*) as count
FROM profiles
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- Check for empty string phone numbers
SELECT
  COUNT(*) as empty_string_count
FROM profiles
WHERE phone_number = '';

-- Check for NULL vs empty string
SELECT
  CASE
    WHEN phone_number IS NULL THEN 'NULL'
    WHEN phone_number = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END AS phone_status,
  COUNT(*) as count
FROM profiles
GROUP BY phone_status;

-- ============================================================
-- 5. BANDS TABLE - STRUCTURE
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bands'
ORDER BY ordinal_position;

-- ============================================================
-- 6. TRACKS TABLE - STRUCTURE (for storage triggers)
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tracks'
ORDER BY ordinal_position;

-- ============================================================
-- 7. CHECK FOR EXISTING TRIGGERS
-- ============================================================
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name,
  tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid::regclass::text IN ('tracks', 'profiles', 'bands')
ORDER BY table_name, trigger_name;

-- ============================================================
-- 8. CHECK FOR EXISTING SMS TABLES
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'shared_playlists',
    'playlist_access_grants',
    'playlist_followers',
    'sms_credits',
    'producer_waitlist'
  );

-- ============================================================
-- 9. SAMPLE DATA - PROFILES
-- ============================================================
SELECT
  id,
  email,
  phone_number,
  name,
  created_at
FROM profiles
LIMIT 5;

-- ============================================================
-- 10. ALL FUNCTIONS RELATED TO STORAGE
-- ============================================================
SELECT
  proname AS function_name,
  pg_get_functiondef(oid) AS definition
FROM pg_proc
WHERE proname LIKE '%storage%'
ORDER BY proname;
