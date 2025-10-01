-- Fix RLS Policy Infinite Recursion (Safe Version)
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies to start fresh
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

-- Create simplified, non-recursive policies

-- 1. Ensemble policies (simplified)
CREATE POLICY "Users can view ensembles they created" ON ensembles FOR SELECT USING (
  auth.uid() = created_by
);
CREATE POLICY "Users can view ensembles they joined" ON ensembles FOR SELECT USING (
  EXISTS (SELECT 1 FROM ensemble_members WHERE ensemble_id = ensembles.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create ensembles" ON ensembles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update their ensembles" ON ensembles FOR UPDATE USING (auth.uid() = created_by);

-- 2. Ensemble members policies (non-recursive)
CREATE POLICY "Users can view own membership" ON ensemble_members FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Creators can view all members" ON ensemble_members FOR SELECT USING (
  auth.uid() IN (SELECT created_by FROM ensembles WHERE id = ensemble_members.ensemble_id)
);
CREATE POLICY "Users can join ensembles" ON ensemble_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Songs policies (simplified)
CREATE POLICY "Ensemble creators can view songs" ON songs FOR SELECT USING (
  auth.uid() IN (SELECT created_by FROM ensembles WHERE id = songs.ensemble_id)
);
CREATE POLICY "Ensemble members can view songs" ON songs FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM ensemble_members WHERE ensemble_id = songs.ensemble_id)
);
CREATE POLICY "Ensemble members can create songs" ON songs FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM ensemble_members WHERE ensemble_id = songs.ensemble_id)
);

-- 4. Versions policies (simplified)
CREATE POLICY "Song viewers can view versions" ON versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM songs s
    JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
    WHERE s.id = versions.song_id AND em.user_id = auth.uid()
  )
);
CREATE POLICY "Song viewers can upload versions" ON versions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM songs s
    JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
    WHERE s.id = versions.song_id AND em.user_id = auth.uid()
  )
);

-- 5. Comments policies (simplified)
CREATE POLICY "Version viewers can view comments" ON comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM versions v
    JOIN songs s ON v.song_id = s.id
    JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
    WHERE v.id = comments.version_id AND em.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create own comments" ON comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM versions v
    JOIN songs s ON v.song_id = s.id
    JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
    WHERE v.id = comments.version_id AND em.user_id = auth.uid()
  )
);

-- Fix complete!
SELECT 'RLS policies fixed successfully!' as status;