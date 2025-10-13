# Apply RLS Migration via Supabase SQL Editor

## Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run** or press `Cmd+Enter`

---

## SQL to Paste

```sql
-- ============================================
-- Band Content RLS Policies
-- Secures band-scoped content while keeping personal content shareable
-- ============================================

-- Key Principle:
-- - Band content (band_id IS NOT NULL): Only visible to band members
-- - Personal content (band_id IS NULL): Shareable with anyone (via link)

-- ============================================
-- TRACKS RLS POLICIES
-- ============================================

-- Drop existing track policies
DROP POLICY IF EXISTS "Anyone can view tracks" ON tracks;
DROP POLICY IF EXISTS "Users can create tracks" ON tracks;
DROP POLICY IF EXISTS "Track creators can update" ON tracks;
DROP POLICY IF EXISTS "Track creators can delete" ON tracks;

-- Tracks SELECT: Band tracks only visible to members, personal tracks visible to all
CREATE POLICY "Tracks visible based on band membership"
  ON tracks FOR SELECT
  USING (
    -- Personal tracks (no band_id): visible to everyone
    band_id IS NULL
    OR
    -- Band tracks: only visible to band members
    band_id IN (
      SELECT band_id
      FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Tracks INSERT: Users can create tracks (band_id will be set by app)
CREATE POLICY "Authenticated users can create tracks"
  ON tracks FOR INSERT
  WITH CHECK (
    auth.uid()::TEXT IS NOT NULL
    AND created_by = auth.uid()::TEXT
  );

-- Tracks UPDATE: Only creator can update
CREATE POLICY "Track creators can update their tracks"
  ON tracks FOR UPDATE
  USING (created_by = auth.uid()::TEXT);

-- Tracks DELETE: Only creator can delete
CREATE POLICY "Track creators can delete their tracks"
  ON tracks FOR DELETE
  USING (created_by = auth.uid()::TEXT);


-- ============================================
-- PLAYLISTS RLS POLICIES
-- ============================================

-- Drop existing playlist policies
DROP POLICY IF EXISTS "Anyone can view playlists" ON playlists;
DROP POLICY IF EXISTS "Public playlists are viewable" ON playlists;
DROP POLICY IF EXISTS "Users can create playlists" ON playlists;
DROP POLICY IF EXISTS "Playlist creators can update" ON playlists;
DROP POLICY IF EXISTS "Playlist creators can delete" ON playlists;

-- Playlists SELECT: Band playlists only visible to members, personal playlists visible via share_code
CREATE POLICY "Playlists visible based on band membership or public sharing"
  ON playlists FOR SELECT
  USING (
    -- Personal playlists (no band_id): visible to everyone if public
    (band_id IS NULL AND is_public = true)
    OR
    -- Personal playlists (no band_id): visible to creator
    (band_id IS NULL AND created_by = auth.uid()::TEXT)
    OR
    -- Band playlists: only visible to band members
    band_id IN (
      SELECT band_id
      FROM band_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Playlists INSERT: Users can create playlists
CREATE POLICY "Authenticated users can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (
    auth.uid()::TEXT IS NOT NULL
    AND created_by = auth.uid()::TEXT
  );

-- Playlists UPDATE: Only creator can update
CREATE POLICY "Playlist creators can update their playlists"
  ON playlists FOR UPDATE
  USING (created_by = auth.uid()::TEXT);

-- Playlists DELETE: Only creator can delete
CREATE POLICY "Playlist creators can delete their playlists"
  ON playlists FOR DELETE
  USING (created_by = auth.uid()::TEXT);


-- ============================================
-- PLAYLIST_TRACKS RLS POLICIES
-- ============================================

-- Drop existing playlist_tracks policies
DROP POLICY IF EXISTS "Anyone can view playlist tracks" ON playlist_tracks;
DROP POLICY IF EXISTS "Anyone can add playlist tracks" ON playlist_tracks;
DROP POLICY IF EXISTS "Anyone can delete playlist tracks" ON playlist_tracks;

-- Playlist tracks inherit visibility from their playlist
CREATE POLICY "Playlist tracks visible based on playlist access"
  ON playlist_tracks FOR SELECT
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        -- Personal playlists (no band_id): visible if public
        (band_id IS NULL AND is_public = true)
        OR
        -- Personal playlists (no band_id): visible to creator
        (band_id IS NULL AND created_by = auth.uid()::TEXT)
        OR
        -- Band playlists: visible to band members
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Users can add tracks to playlists they have access to
CREATE POLICY "Users can add tracks to accessible playlists"
  ON playlist_tracks FOR INSERT
  WITH CHECK (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        -- Personal playlists: creator can add
        (band_id IS NULL AND created_by = auth.uid()::TEXT)
        OR
        -- Band playlists: any member can add
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Users can remove tracks from playlists they have access to
CREATE POLICY "Users can remove tracks from accessible playlists"
  ON playlist_tracks FOR DELETE
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        -- Personal playlists: creator can remove
        (band_id IS NULL AND created_by = auth.uid()::TEXT)
        OR
        -- Band playlists: any member can remove
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Users can update playlist tracks (for reordering)
CREATE POLICY "Users can update playlist tracks"
  ON playlist_tracks FOR UPDATE
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE
        -- Personal playlists: creator can update
        (band_id IS NULL AND created_by = auth.uid()::TEXT)
        OR
        -- Band playlists: any member can update
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );


-- ============================================
-- RATINGS RLS POLICIES
-- ============================================

-- Drop existing rating policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update their ratings" ON ratings;

-- Ratings SELECT: Only visible for tracks user has access to
CREATE POLICY "Ratings visible based on track access"
  ON ratings FOR SELECT
  USING (
    track_id IN (
      SELECT id FROM tracks WHERE
        -- Personal tracks: visible to everyone
        band_id IS NULL
        OR
        -- Band tracks: visible to band members
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Ratings INSERT: Users can rate tracks they have access to
CREATE POLICY "Users can rate accessible tracks"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid()::TEXT IS NOT NULL
    AND user_id = auth.uid()::TEXT
    AND track_id IN (
      SELECT id FROM tracks WHERE
        -- Personal tracks: anyone can rate
        band_id IS NULL
        OR
        -- Band tracks: only band members can rate
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Ratings UPDATE: Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

-- Ratings DELETE: Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (user_id = auth.uid()::TEXT);


-- ============================================
-- COMMENTS RLS POLICIES
-- ============================================

-- Drop existing comment policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their comments" ON comments;

-- Comments SELECT: Only visible for tracks user has access to
CREATE POLICY "Comments visible based on track access"
  ON comments FOR SELECT
  USING (
    track_id IN (
      SELECT id FROM tracks WHERE
        -- Personal tracks: visible to everyone
        band_id IS NULL
        OR
        -- Band tracks: visible to band members
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Comments INSERT: Users can comment on tracks they have access to
CREATE POLICY "Users can comment on accessible tracks"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid()::TEXT IS NOT NULL
    AND user_id = auth.uid()::TEXT
    AND track_id IN (
      SELECT id FROM tracks WHERE
        -- Personal tracks: anyone can comment
        band_id IS NULL
        OR
        -- Band tracks: only band members can comment
        band_id IN (
          SELECT band_id
          FROM band_members
          WHERE user_id = auth.uid()::TEXT
        )
    )
  );

-- Comments UPDATE: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

-- Comments DELETE: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid()::TEXT);
```

---

## Verification

After running the migration, run this query to verify all policies were created:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('tracks', 'playlists', 'playlist_tracks', 'ratings', 'comments')
ORDER BY tablename, policyname;
```

You should see approximately 20 policies listed.

---

## Expected Output

After clicking Run, you should see:
- Several "DROP POLICY" statements (may show warnings if policies don't exist - this is normal)
- Multiple "CREATE POLICY" statements showing success
- No errors

---

## What This Does

This migration secures your band content:
- ✅ Band tracks/playlists only visible to band members
- ✅ Personal tracks/playlists remain shareable via link
- ✅ Ratings and comments are band-private
- ✅ Users cannot see other bands' content

---

## Troubleshooting

**If you get errors:**
1. Check that all tables exist: `tracks`, `playlists`, `playlist_tracks`, `ratings`, `comments`, `band_members`
2. Check that the `band_id` column exists on `tracks` and `playlists` tables
3. Check that RLS is enabled on all tables (it should be by default)

**To verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tracks', 'playlists', 'playlist_tracks', 'ratings', 'comments');
```

All tables should show `rowsecurity = true`.
