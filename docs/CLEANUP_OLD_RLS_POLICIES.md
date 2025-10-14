# Cleanup Old RLS Policies

## Overview

After applying the band-specific RLS policies, you need to remove the old permissive policies that allowed "Anyone" to perform actions. These old policies conflict with the new security model.

## Steps

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy the SQL below** and paste it into a new query
3. **Click "Run"**
4. **Verify** the cleanup worked (query provided at bottom)

## SQL to Run

```sql
-- =====================================================
-- CLEANUP: Remove Old Permissive RLS Policies
-- =====================================================

-- Remove old permissive policies from TRACKS
DROP POLICY IF EXISTS "Anyone can upload tracks" ON tracks;
DROP POLICY IF EXISTS "Anyone can update tracks" ON tracks;
DROP POLICY IF EXISTS "Anyone can delete tracks" ON tracks;

-- Remove old permissive policies from PLAYLISTS
DROP POLICY IF EXISTS "Anyone can create playlists" ON playlists;
DROP POLICY IF EXISTS "Anyone can update playlists" ON playlists;
DROP POLICY IF EXISTS "Anyone can delete playlists" ON playlists;

-- Remove old permissive policies from PLAYLIST_ITEMS
DROP POLICY IF EXISTS "Anyone can view playlist items" ON playlist_items;
DROP POLICY IF EXISTS "Anyone can add items to playlists" ON playlist_items;
DROP POLICY IF EXISTS "Anyone can delete playlist items" ON playlist_items;
DROP POLICY IF EXISTS "Anyone can update playlist items" ON playlist_items;

-- Remove old permissive policies from RATINGS
DROP POLICY IF EXISTS "Anyone can rate" ON ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can delete ratings" ON ratings;

-- Remove old permissive policies from COMMENTS
DROP POLICY IF EXISTS "Anyone can comment" ON comments;
DROP POLICY IF EXISTS "Anyone can update comments" ON comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON comments;
```

## Verify Cleanup

Run this query to verify only the new band-specific policies remain:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('tracks', 'playlists', 'playlist_items', 'ratings', 'comments')
ORDER BY tablename, policyname;
```

### Expected Results

You should see **only these policies** (7 per table = 35 total):

**Comments:**
- Comments visible based on track access (SELECT)
- Users can comment on accessible tracks (INSERT)
- Users can delete their own comments (DELETE)
- Users can update their own comments (UPDATE)

**Playlist Items:**
- Playlist tracks visible based on playlist access (SELECT)
- Users can add tracks to accessible playlists (INSERT)
- Users can remove tracks from accessible playlists (DELETE)
- Users can update playlist tracks (UPDATE)

**Playlists:**
- Playlists visible based on band membership or public sharing (SELECT)
- Authenticated users can create playlists (INSERT)
- Playlist creators can delete their playlists (DELETE)
- Playlist creators can update their playlists (UPDATE)

**Ratings:**
- Ratings visible based on track access (SELECT)
- Users can rate accessible tracks (INSERT)
- Users can delete their own ratings (DELETE)
- Users can update their own ratings (UPDATE)

**Tracks:**
- Tracks visible based on band membership (SELECT)
- Authenticated users can create tracks (INSERT)
- Track creators can delete their tracks (DELETE)
- Track creators can update their tracks (UPDATE)

## Troubleshooting

### If you see duplicate policies after cleanup:
- Some policies may have been recreated by your app code
- Check for any database initialization scripts in your codebase
- Check Supabase Edge Functions for policy creation

### If the app breaks after cleanup:
- Double-check that all users are properly assigned to bands via `band_members` table
- Verify `auth.uid()::TEXT` matches the format of your `user_id` columns
- Check browser console for RLS policy violation errors
