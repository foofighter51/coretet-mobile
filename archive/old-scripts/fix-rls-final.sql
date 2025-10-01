-- Fix RLS Policy Infinite Recursion (Final Solution)
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS to clear all policies
ALTER TABLE ensembles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Users can view their ensembles" ON ensembles;
DROP POLICY IF EXISTS "Users can view ensembles they created" ON ensembles;
DROP POLICY IF EXISTS "Users can view ensembles they joined" ON ensembles;
DROP POLICY IF EXISTS "Users can create ensembles" ON ensembles;
DROP POLICY IF EXISTS "Creators can update their ensembles" ON ensembles;

DROP POLICY IF EXISTS "Users can view ensemble members" ON ensemble_members;
DROP POLICY IF EXISTS "Users can view own membership" ON ensemble_members;
DROP POLICY IF EXISTS "Creators can view all members" ON ensemble_members;
DROP POLICY IF EXISTS "Users can join ensembles" ON ensemble_members;

DROP POLICY IF EXISTS "Ensemble members can view songs" ON songs;
DROP POLICY IF EXISTS "Ensemble creators can view songs" ON songs;
DROP POLICY IF EXISTS "Ensemble members can create songs" ON songs;

DROP POLICY IF EXISTS "Ensemble members can view versions" ON versions;
DROP POLICY IF EXISTS "Song viewers can view versions" ON versions;
DROP POLICY IF EXISTS "Ensemble members can upload versions" ON versions;
DROP POLICY IF EXISTS "Song viewers can upload versions" ON versions;

DROP POLICY IF EXISTS "Ensemble members can view comments" ON comments;
DROP POLICY IF EXISTS "Version viewers can view comments" ON comments;
DROP POLICY IF EXISTS "Ensemble members can create comments" ON comments;
DROP POLICY IF EXISTS "Users can create own comments" ON comments;

-- Re-enable RLS
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create VERY simple policies that don't reference other tables

-- 1. Ensemble policies (creator-only for now)
CREATE POLICY "ensemble_select" ON ensembles FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "ensemble_insert" ON ensembles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "ensemble_update" ON ensembles FOR UPDATE USING (auth.uid() = created_by);

-- 2. Ensemble members policies (simple)
CREATE POLICY "members_select" ON ensemble_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "members_insert" ON ensemble_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Songs policies (simple)
CREATE POLICY "songs_select" ON songs FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "songs_insert" ON songs FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 4. Versions policies (simple)
CREATE POLICY "versions_select" ON versions FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "versions_insert" ON versions FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- 5. Comments policies (simple)
CREATE POLICY "comments_select" ON comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Simple policies complete!
SELECT 'Simple RLS policies created successfully!' as status;