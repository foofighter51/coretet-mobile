# Phase 3A: Band Content RLS Policies

## Overview
This phase implements Row Level Security (RLS) policies to secure band-scoped content while keeping personal content shareable via direct links.

## Security Model

### Two-Tier Access Control:

**1. Band Content (band_id IS NOT NULL)**
- Only visible to band members
- Ratings and comments are band-private
- Tracks, playlists, and all feedback stay within the band

**2. Personal Content (band_id IS NULL)**
- Shareable with anyone via direct link
- No band association
- Created via "Copy to Personal" feature
- No ratings or comments (personal curation only)

---

## Applying the Migration

### Option 1: Using the Script (Recommended)
```bash
cd /Users/exleymini/Apps/coretet-band
./supabase/apply-rls-migration.sh
```

### Option 2: Manual Application
```bash
psql "postgresql://postgres.tvvztlizyciaafqkigwe:$SUPABASE_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251013_band_content_rls_policies.sql
```

---

## What Gets Secured

### Tracks Table
- **Band tracks**: Only band members can view
- **Personal tracks**: Anyone can view
- **Create/Update/Delete**: Only track creator

### Playlists Table
- **Band playlists**: Only band members can view
- **Personal playlists**: Public if `is_public=true`, otherwise creator only
- **Create/Update/Delete**: Only playlist creator

### Playlist Tracks Table
- **Visibility**: Inherits from parent playlist
- **Band playlists**: Any band member can add/remove tracks
- **Personal playlists**: Only creator can modify

### Ratings Table
- **Band tracks**: Only band members can view/create ratings
- **Personal tracks**: Anyone can view/create ratings
- **Update/Delete**: Own ratings only

### Comments Table
- **Band tracks**: Only band members can view/create comments
- **Personal tracks**: Anyone can view/create comments
- **Update/Delete**: Own comments only

---

## Testing the Policies

### Test 1: Band Isolation
1. Create a second test user account
2. User 1: Create playlist in "Bedeker" band
3. User 2: Should NOT see "Bedeker" playlists (not a member)
4. User 2: Create their own band
5. User 1: Should NOT see User 2's band content

**Expected Result**: Each user only sees their own band's content

### Test 2: Personal Content Sharing
1. User 1: Copy a band playlist to Personal
2. User 1: Get the share link for personal playlist
3. User 2: Open share link
4. User 2: Should SEE the personal playlist (shareable)

**Expected Result**: Personal playlists are accessible via direct link

### Test 3: Ratings and Comments Isolation
1. User 1: Rate a track in "Bedeker" band (e.g., "Love")
2. User 1: Add comment to track
3. User 2: Even with track ID, should NOT see ratings/comments (not in band)

**Expected Result**: Band feedback stays private to band members

---

## Verification Queries

### Check Applied Policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('tracks', 'playlists', 'playlist_tracks', 'ratings', 'comments')
ORDER BY tablename, policyname;
```

Should return ~20 policies covering all CRUD operations.

### Test Band Member Check
```sql
-- Replace with actual band_id and user_id
SELECT band_id
FROM band_members
WHERE user_id = 'your-user-id';
```

Should return list of bands the user belongs to.

### Test Track Visibility
```sql
-- As logged in user, should only see your bands' tracks + personal tracks
SELECT id, title, band_id
FROM tracks
WHERE band_id IS NULL  -- Personal tracks
   OR band_id IN (
     SELECT band_id FROM band_members WHERE user_id = auth.uid()::TEXT
   )
LIMIT 10;
```

---

## Rollback Plan

If policies cause issues, you can temporarily disable RLS:

```sql
-- EMERGENCY ONLY - Disables all security
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
```

Then investigate and re-enable:
```sql
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
-- etc...
```

---

## Next Steps (Phase 3B)

Once policies are verified working:
1. Build invite UI for band owners/admins
2. Implement pending invite checking on login
3. Add band settings screen
4. Add member management UI

---

## Notes

- Migration is idempotent (safe to run multiple times)
- Existing data is not modified, only access policies
- Personal playlists created before this migration remain accessible
- Band content created before this migration becomes secured
