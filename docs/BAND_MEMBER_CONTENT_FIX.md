# Band Member Content Visibility Fix

**Date:** 2025-10-14
**Issue:** Band members could join bands but couldn't see any band content (playlists, tracks)

## Problem Summary

After implementing the invite system, users could successfully accept invites and become band members, but when they logged in, they saw "No playlists yet" even though the band had multiple playlists and tracks.

## Root Causes

### 1. **getBandMembers 406 Error**
- **File:** `lib/supabase.ts:578-590`
- **Issue:** The function was trying to join the `profiles` table to fetch member names, but RLS policies blocked this join, causing 406 (Not Acceptable) errors
- **Fix:** Removed the profiles join, simplified query to only fetch band_members columns

```typescript
// Before (broken):
.select(`
  id,
  band_id,
  user_id,
  role,
  joined_at,
  profiles (
    name
  )
`)

// After (fixed):
.select('id, band_id, user_id, role, joined_at')
```

### 2. **MainDashboard Filtering Wrong Source**
- **File:** `src/components/screens/MainDashboard.tsx:739-742`
- **Issue:** The `bandCreatedPlaylists` filter was using `createdPlaylists` (only the current user's playlists) instead of `playlists` (all playlists including those from band members)
- **Fix:** Changed filter to use the `playlists` array which includes all band member content

```typescript
// Before (broken):
const bandCreatedPlaylists = useMemo(() => {
  if (!currentBand) return [];
  return createdPlaylists.filter((p: any) => p.band_id === currentBand.id);
}, [createdPlaylists, currentBand]);

// After (fixed):
const bandCreatedPlaylists = useMemo(() => {
  if (!currentBand) return [];
  return playlists.filter((p: any) => p.band_id === currentBand.id);
}, [playlists, currentBand]);
```

## How Band Content Fetching Works

### Architecture Flow:

1. **BandContext** (`src/contexts/BandContext.tsx`)
   - Loads user's bands on mount
   - Sets `currentBand` (from localStorage or first band)
   - Fetches user's role in the band

2. **PlaylistContext** (`src/contexts/PlaylistContext.tsx`)
   - Watches for `currentBand` changes via useEffect
   - Fetches three types of playlists:
     - **Created**: Playlists created by the user (`db.playlists.getByUser()`)
     - **Followed**: Playlists the user follows (`db.playlistFollowers.getFollowedPlaylists()`)
     - **Band**: ALL playlists in the band (`db.playlists.getByBand()`) ← Key for collaboration
   - Merges and deduplicates all three into `playlists` array

3. **MainDashboard** (`src/components/screens/MainDashboard.tsx`)
   - Filters playlists for display based on active tab (Band/Personal)
   - For Band tab: Shows playlists where `band_id === currentBand.id`
   - For Personal tab: Shows playlists where `band_id === null`

## Files Modified

### Core Fixes:
- `lib/supabase.ts` - Simplified getBandMembers query
- `src/components/screens/MainDashboard.tsx` - Fixed bandCreatedPlaylists filter source
- `src/contexts/PlaylistContext.tsx` - Added band playlist fetching
- `src/contexts/BandContext.tsx` - Band loading logic

### Debug & Cleanup:
- Added debug logging to diagnose issue
- Cleaned up verbose console.logs after fix confirmed

## Commits

1. `83db1154` - Fix band member content visibility: remove profiles join and add debug logging
2. `cf63c8bb` - Add debug logging to track playlist state updates
3. `1435ab96` - Fix band playlist display: filter from all playlists not just created
4. `002f1980` - Clean up debug logging from band member visibility fixes

## Testing

✅ **Web (coretet.app)**: Band members can see all band playlists
✅ **iOS App**: Band members can see all band playlists after `npx cap sync ios`

## Future Considerations

- The same pattern needs to be applied to **tracks** display (already fetching via `db.tracks.getByBand()` but may need UI verification)
- **Ratings** and **comments** already work via RLS policies that check band membership
- Consider adding explicit band content indicators in the UI (e.g., "4 band playlists, 2 personal playlists")
