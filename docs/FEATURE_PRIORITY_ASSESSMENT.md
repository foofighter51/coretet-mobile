# Feature Priority Assessment
**Date:** 2025-10-08
**Reviewed by:** Claude (AI Orchestra)

## Current Issues Analysis

### Issue #1: Chevron Icon Visual Bug ⚡ QUICK FIX
**Location:** [TrackRowWithPlayer.tsx:228](../src/components/molecules/TrackRowWithPlayer.tsx#L228)
**Problem:** Chevron icon overlaps/nests behind track duration display
**Impact:** Visual polish issue, affects UX clarity
**Effort:** 5 minutes - just remove the chevron button
**Risk:** Low - simple UI removal

**Code Location:**
```typescript
// Lines 207-230: Expand button with chevron
{showExpandedPlayer && audioUrl && (
  <button onClick={toggleExpanded}>
    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
)}
```

**Solution:** Remove the button, keep expand functionality via track row click or alternative UI

---

### Issue #2: Remove Track from Playlist ⚠️ MISSING FEATURE
**Location:** Playlist detail view
**Problem:** No way to remove individual tracks from a playlist
**Impact:** Core functionality gap - users can't manage playlist contents
**Effort:** 2-3 hours (DB function + UI + testing)
**Risk:** Medium - need to handle edge cases (last track, currently playing, etc.)

**Current State:**
- ❌ No `removeFromPlaylist` function exists in codebase
- ✅ Track rows in playlist view have rating/expand controls
- ❌ No delete/remove button on track rows

**Implementation Needed:**
1. Add DB function: `db.playlistTracks.remove(playlistId, trackId)`
2. Add UI button (trash icon) to TrackRowWithPlayer
3. Handle edge cases:
   - Currently playing track
   - Last track in playlist
   - Playlist sharing permissions
4. Real-time update of track list

---

### Issue #3: Deleted Playlists Don't Disappear ⚠️ STATE MANAGEMENT BUG
**Location:** [MainDashboard.tsx:324-339](../src/components/screens/MainDashboard.tsx#L324)
**Problem:** After deleting playlist, UI doesn't refresh playlist list
**Impact:** User sees stale data, confusing UX
**Effort:** 30 minutes - add state refresh
**Risk:** Low - just missing reload call

**Current Implementation:**
```typescript
const handleDeletePlaylist = async () => {
  await db.playlists.delete(currentPlaylist.id);
  handleBackToList(); // ← Goes back but doesn't reload playlists!
}
```

**Root Cause:** `handleBackToList()` only changes view, doesn't reload playlist data

**Solution:** Add `loadPlaylists()` call after deletion

---

## Future Features Analysis

### Feature #4: Track Deletion with Recycle Bin 🔄 MAJOR FEATURE
**Complexity:** High
**Effort:** 1-2 days
**Risk:** High - data integrity, edge cases

**Requirements:**
- Soft delete system (mark deleted, not hard delete)
- 30-day retention period
- Recycle bin UI in user profile
- Restore functionality
- Auto-purge after 30 days (cron job or edge function)

**Database Changes Needed:**
```sql
ALTER TABLE tracks ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE tracks ADD COLUMN deleted_by TEXT;
CREATE INDEX idx_tracks_deleted ON tracks(deleted_at) WHERE deleted_at IS NOT NULL;
```

**Implementation Steps:**
1. Update DB schema with soft delete columns
2. Modify track queries to filter out deleted tracks
3. Create recycle bin view in profile
4. Add restore functionality
5. Create Edge Function for auto-purge (30 days)
6. Handle playlist references (what happens when deleted track is in playlist?)

**Edge Cases:**
- Track in multiple playlists
- Track currently playing
- Track uploaded by different user (shared playlists)
- Storage bucket cleanup

---

### Feature #5: Aggregated Ratings on Playlists 📊 COLLABORATIVE FEATURE
**Complexity:** Medium-High
**Effort:** 1 day
**Risk:** Medium - query performance, real-time updates

**Requirements:**
- Show aggregate rating counts (X likes, Y loves per track)
- Display across all playlist collaborators
- Real-time or near-real-time updates
- Visual representation (badge/counts)

**Database Changes:**
```sql
-- Ratings are per user per track
-- Need to aggregate across playlist_collaborators
CREATE VIEW playlist_track_ratings AS
SELECT
  pt.playlist_id,
  pt.track_id,
  COUNT(CASE WHEN r.rating = 'like' THEN 1 END) as like_count,
  COUNT(CASE WHEN r.rating = 'love' THEN 1 END) as love_count
FROM playlist_tracks pt
JOIN ratings r ON r.track_id = pt.track_id
JOIN playlist_collaborators pc ON pc.playlist_id = pt.playlist_id
WHERE r.user_id = pc.user_id
GROUP BY pt.playlist_id, pt.track_id;
```

**Implementation:**
1. Create database view or function for aggregation
2. Update TrackRowWithPlayer to show aggregate counts
3. Add real-time subscription for rating changes
4. UI design: show "3 likes, 2 loves" badges
5. Filter to show "agreed upon" tracks (threshold: 75% like/love?)

**Challenges:**
- Performance with large playlists
- Real-time updates across multiple users
- Handling users who haven't rated yet

---

### Feature #6: Track Comments System 💬 COLLABORATIVE FEATURE
**Complexity:** Medium
**Effort:** 1-2 days
**Risk:** Medium - moderation, notifications

**Requirements:**
- Comment on WIP tracks
- Thread-based discussions
- Collaborator-only access
- Timestamp and user attribution
- Optional: Notifications for new comments

**Database Schema:**
```sql
CREATE TABLE track_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE, -- Scope to playlist
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_track_comments_track ON track_comments(track_id);
CREATE INDEX idx_track_comments_playlist ON track_comments(playlist_id);

-- RLS Policies: Only playlist collaborators can view/comment
```

**Implementation:**
1. Create `track_comments` table
2. Add comment section to TrackRowWithPlayer (expand to show)
3. Real-time subscriptions for new comments
4. Notification system (optional)
5. Comment moderation (delete own comments)

**UI Placement:**
- Expand track row to show comment thread
- Input field at bottom
- Threaded display with timestamps

---

## Priority Recommendation

### 🔥 **PRIORITY 1 - Immediate Fixes (Do Now)**
**Total Effort:** ~1 hour

1. **Fix chevron overlap** (5 min) - Visual bug, easy win
2. **Fix deleted playlist refresh** (30 min) - Critical UX bug
3. **Add remove track from playlist** (2-3 hours) - Core missing feature

**Rationale:** These are quick wins that fix broken/incomplete functionality. Users expect these to work.

---

### 📊 **PRIORITY 2 - Enhanced Collaboration (Next Sprint)**
**Total Effort:** ~2-3 days

4. **Aggregated ratings** (1 day) - Enables collaborative decision-making
5. **Track comments** (1-2 days) - Enables team communication

**Rationale:** These build on core functionality and enable the collaborative workflow you're targeting with band members.

---

### 🗑️ **PRIORITY 3 - Advanced Features (Future)**
**Total Effort:** ~2 days + maintenance

6. **Recycle bin / soft delete** (1-2 days) - Safety net for deletions

**Rationale:** Nice-to-have safety feature, but lower priority than collaboration tools. Most users are careful with deletions, and you can always restore from database backup if needed.

---

## Recommended Implementation Order

### Week 1 (Now)
- [x] Fix chevron visual bug (15 min)
- [x] Fix playlist deletion refresh (30 min)
- [x] Add remove track from playlist (3 hours)

### Week 2 (Collaboration Features)
- [ ] Aggregated ratings display (1 day)
- [ ] Track comments system (1-2 days)

### Week 3+ (Safety Features)
- [ ] Recycle bin / soft delete (2 days)
- [ ] Auto-purge edge function (4 hours)

---

## Technical Considerations

### Database Performance
- **Ratings aggregation:** May need indexed views or materialized views for large playlists
- **Real-time subscriptions:** Consider debouncing to avoid excessive updates
- **Comments:** Pagination needed if threads grow large

### Mobile UX
- **Track removal:** Swipe-to-delete gesture would be ideal (iOS pattern)
- **Comments:** Keyboard handling is critical (viewport issues like feedback form)
- **Ratings display:** Limited screen space - use compact badges/counts

### Data Integrity
- **Cascade deletions:** Ensure foreign keys cascade properly
- **Orphaned data:** Clean up playlist_tracks when track is deleted
- **Shared playlists:** Handle permissions correctly (who can delete what?)

---

## Questions for Clarification

1. **Remove track from playlist:** Should this be owner-only or any collaborator?
2. **Aggregated ratings:** Do you want to filter/sort by agreement level? (e.g., "Show only tracks with 3+ loves")
3. **Comments:** Do you want notifications when someone comments on your track?
4. **Recycle bin:** Should deleted tracks still appear in playlists (grayed out) or be removed entirely?
5. **Track deletion:** Who can delete tracks? Owner only, or any collaborator?

---

## Next Steps

**Ready to proceed with Priority 1 fixes:**
1. Remove chevron icon
2. Fix playlist deletion refresh
3. Implement remove track from playlist

**Estimated time:** 3-4 hours total
**Impact:** Major UX improvements, core functionality complete

Shall I proceed with Priority 1 implementations?
