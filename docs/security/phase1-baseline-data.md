# Phase 1 Baseline Data - Current Tracks Usage Patterns
**Date**: 2025-10-16
**Purpose**: Document current state before enabling RLS on tracks table

## Summary Statistics

- **Total Tracks**: 235
- **Band Tracks**: 223 (94.9%)
- **Personal Tracks**: 12 (5.1%)
- **Tracks in Playlists**: 184 (78.3% of all tracks)
- **Tracks Not in Playlists**: 51 (21.7%)

## Key Findings

### 1. Band Distribution
- **Bedeker Band**: 169 tracks (71.9% of all tracks)
- **Towers Band**: 54 tracks (23.0% of all tracks)
- Total: 2 active bands

### 2. User Distribution
- **Primary User** (506e6736...): 223 tracks (94.9%)
  - This is likely you - the main creator
- **User 2** (c93241cd...): 7 tracks (3.0%)
- **User 3** (929a7b64...): 4 tracks (1.7%)
- **User 4** (cc646346...): 1 track (0.4%)

### 3. Playlist Usage
- 184/235 tracks (78.3%) are actively used in playlists
- 51 tracks exist but aren't in any playlist yet
- This is healthy - shows tracks are being organized

### 4. Data Quality
- ✅ All tracks have a creator (created_by is never NULL)
- ✅ Clear majority are band tracks (94.9%)
- ✅ No orphaned data

## Implications for RLS Policies

### Critical Requirements:
1. **Band member access is essential**
   - Users in Bedeker must see all 169 Bedeker tracks
   - Users in Towers must see all 54 Towers tracks
   - Cross-band visibility should be blocked

2. **Personal tracks need careful handling**
   - Only 12 personal tracks exist
   - These should be private to creator UNLESS in a shared playlist
   - Need playlist follower access

3. **Playlist sharing must continue working**
   - 78.3% of tracks are in playlists
   - Users following playlists need to see those tracks
   - This is critical for collaboration

4. **Creator access is always required**
   - Every track has a creator
   - Creators must always see/edit/delete their own tracks

## Risk Assessment for RLS Implementation

### LOW RISK ✅
- All tracks have valid created_by (no NULL handling needed)
- Clear band boundaries (2 bands, no overlap)
- Most content is band-based (94.9%)

### MEDIUM RISK ⚠️
- Playlist sharing is heavily used (78.3%)
- Need to ensure playlist_followers join doesn't cause 406 errors
- Past issues with profile joins suggest caution

### HIGH RISK 🔴
- If policies are too restrictive, 184 tracks could disappear from playlists
- If policies are too permissive, defeats purpose of RLS
- Band member checks must work perfectly (169 + 54 = 223 tracks depend on it)

## Test Plan Requirements

Based on this data, we MUST test:

1. **Band Member Access**
   - User in Bedeker can see all 169 Bedeker tracks
   - User in Towers can see all 54 Towers tracks
   - User in Bedeker CANNOT see Towers tracks (unless in followed playlist)

2. **Creator Access**
   - Primary user (506e6736...) can see their 223 tracks
   - Other users can see their 7, 4, 1 tracks respectively

3. **Playlist Access**
   - When following a playlist, can see all tracks in it
   - When unfollowing, tracks from other bands disappear (expected)

4. **Personal Tracks**
   - 12 personal tracks are visible to creator
   - Personal tracks in shared playlists are visible to followers

## Next Steps

1. ✅ Create RLS policies that handle:
   - Own tracks (created_by match)
   - Band tracks (band_members join)
   - Playlist tracks (playlist_followers join)
   - Personal tracks (creator OR in followed playlist)

2. ✅ Test with at least 2 users from different bands

3. ✅ Verify all 184 playlist tracks remain accessible

## Baseline Queries for Validation

After enabling RLS, re-run these queries to confirm no data loss:

```sql
-- Should still return 235
SELECT COUNT(*) FROM tracks;

-- Should still return 223 band, 12 personal
SELECT
  COUNT(*) FILTER (WHERE band_id IS NOT NULL) as band_tracks,
  COUNT(*) FILTER (WHERE band_id IS NULL) as personal_tracks
FROM tracks;

-- Should still return 184
SELECT COUNT(DISTINCT pi.track_id) as tracks_in_playlists
FROM playlist_items pi;
```

If any counts change, we have a problem and need to investigate.

---

**Status**: Baseline documented ✅
**Ready for**: Phase 1.2 - Create RLS policies
**Confidence Level**: HIGH (data is clean and well-structured)
