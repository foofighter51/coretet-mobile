-- Temporarily disable RLS for development
-- Run this in Supabase SQL Editor

-- Disable RLS on problematic tables to allow development
ALTER TABLE ensembles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies that are causing issues
DROP POLICY IF EXISTS "ensemble_select" ON ensembles;
DROP POLICY IF EXISTS "ensemble_insert" ON ensembles;
DROP POLICY IF EXISTS "ensemble_update" ON ensembles;
DROP POLICY IF EXISTS "members_select" ON ensemble_members;
DROP POLICY IF EXISTS "members_insert" ON ensemble_members;
DROP POLICY IF EXISTS "songs_select" ON songs;
DROP POLICY IF EXISTS "songs_insert" ON songs;
DROP POLICY IF EXISTS "versions_select" ON versions;
DROP POLICY IF EXISTS "versions_insert" ON versions;
DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;

-- Keep RLS enabled only on user-related tables
-- profiles, user_access_control, app_settings, ratings remain protected

SELECT 'RLS temporarily disabled for development!' as status;