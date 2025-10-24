# Testing Checklist - Post Phase 1 RLS & UX Updates

**Version**: 1.1 (Build 11)
**Date**: 2025-10-17
**Changes**: Phase 1 RLS, Draggable Scrubber, Unread Comments, Bug Fixes

---

## 🔒 Phase 1 RLS Security (CRITICAL - Monitor for 7 days)

### Track Access Control
- [ ] **Personal tracks**: Users can only see their own personal tracks
- [ ] **Band tracks**: All band members can see all band tracks
- [ ] **Followed playlist tracks**: Users can see tracks in playlists they follow
- [ ] **No data leakage**: Users CANNOT see tracks from:
  - Other users' personal playlists
  - Bands they're not members of
  - Playlists they don't follow

### Track Operations
- [ ] **Upload**: Users can upload tracks as themselves
- [ ] **Edit**: Users can only edit their own tracks
- [ ] **Delete**: Users can only delete their own tracks
- [ ] **Playlist add/remove**: Tracks can be added to appropriate playlists

### Edge Cases to Watch
- [ ] Switching between Band/Personal tabs shows correct tracks
- [ ] Following/unfollowing playlists updates visible tracks
- [ ] Leaving a band removes access to band tracks
- [ ] Multi-band users see correct tracks per band context

### Known Baseline (from docs/security/phase1-baseline-data.md)
- Total tracks: 235
- Band tracks: 223 (94.9%)
- Personal tracks: 12 (5.1%)
- Tracks in playlists: 184 (78.3%)

**Monitor**: Any deviations from these numbers or access patterns

---

## 🎵 Draggable Scrubber (New Feature)

### Basic Functionality
- [ ] Progress bar shows current playback position
- [ ] Tapping anywhere on bar seeks to that position
- [ ] Dragging thumb updates position smoothly
- [ ] Timestamp tooltip appears while dragging
- [ ] Bottom timestamp updates in real-time
- [ ] Playback resumes from scrubbed position

### Touch Interaction
- [ ] 44px touch target (meets Apple HIG)
- [ ] No page scrolling while dragging
- [ ] Smooth transitions (except during drag)
- [ ] Works on both tap and drag gestures

### Edge Cases
- [ ] Scrubbing works at 0% and 100%
- [ ] Scrubbing while paused
- [ ] Scrubbing during loading state
- [ ] Multiple rapid scrub gestures

---

## 💬 Unread Comments Indicator (New Feature)

### Visual Indicators
- [ ] **No comments**: No icon shown
- [ ] **Read comments**: Outline MessageCircle icon, gray background
- [ ] **Unread comments**: Filled blue MessageCircle icon, blue background + red dot badge

### Functionality
- [ ] Opening track detail modal marks comments as viewed
- [ ] Closing modal refreshes unread status
- [ ] New comments appear as unread
- [ ] Indicator persists across app sessions
- [ ] Indicator updates when others add comments

### Multi-User Testing
- [ ] User A adds comment → User B sees unread indicator
- [ ] User B opens track → indicator changes to "read"
- [ ] User A adds another comment → User B sees unread again

---

## 🐛 Bug Fixes (4 Tester Issues - Verify Still Fixed)

### 1. Vertical Scroll Drift
- [ ] Opening track detail doesn't cause vertical jump
- [ ] Closing track detail returns to exact scroll position
- [ ] No negative scroll bounce issues
- [ ] Scroll position persists during tab switches

### 2. Tab Switching Blocked
- [ ] Can switch tabs while viewing track detail
- [ ] Can switch tabs while viewing playlist
- [ ] Tab bar always accessible
- [ ] No modal blocking tab interaction

### 3. Comment Icon Display
- [ ] Icon appears for tracks with comments
- [ ] Icon hidden for tracks without comments
- [ ] Icon updates when comments added/removed
- [ ] Icon displays correctly in list view

### 4. Band Members "Unknown"
- [ ] All band members show correct names in Settings
- [ ] Band member avatars/profiles load correctly
- [ ] No "Unknown" placeholders appearing
- [ ] Multi-band users show correctly in all bands

---

## 🔍 General App Stability

### Core Features
- [ ] Login/signup works
- [ ] Track upload works
- [ ] Track playback works
- [ ] Comments work
- [ ] Ratings work
- [ ] Playlist creation/editing works
- [ ] Band creation/management works
- [ ] Invites work

### Performance
- [ ] App loads quickly
- [ ] No excessive lag or stuttering
- [ ] Smooth scrolling
- [ ] Audio playback stable
- [ ] No memory leaks or crashes

### Data Integrity
- [ ] Track counts match expectations
- [ ] Playlist contents accurate
- [ ] Comment counts accurate
- [ ] User profiles complete

---

## ⚠️ Known Issues

### iOS 18.6 Simulator
- **Issue**: Cannot type in login fields
- **Status**: Apple WKWebView bug, not our code
- **Workaround**: Test on iOS 17 simulator or physical device
- **Impact**: Simulator testing only, production unaffected

---

## 📊 Monitoring Period: Phase 1 RLS

**Duration**: 7 days (Oct 17 - Oct 24, 2025)
**Purpose**: Verify no data access issues before Phase 2

### Daily Checks
1. Any reports of missing tracks?
2. Any reports of seeing others' tracks?
3. Any upload/edit/delete failures?
4. Any performance degradation?

### If Issues Found
1. Document exact scenario
2. Check Supabase logs
3. Review RLS policies in `supabase/migrations/20251017_enable_tracks_rls_phase1.sql`
4. Rollback if critical data leak found

### Success Criteria for Phase 2
- ✅ No data access violations reported
- ✅ All CRUD operations working
- ✅ No performance issues
- ✅ Baseline metrics stable

---

## 📝 Tester Feedback Template

When sending to testers, ask them to report:

1. **What were you trying to do?**
2. **What happened?** (screenshot if possible)
3. **What did you expect to happen?**
4. **Device**: iPhone model + iOS version
5. **Severity**: Critical / High / Medium / Low

---

## 🚀 Next Steps After Monitoring

### Phase 2: Tighten Personal Tracks RLS (After 7 days)
- Remove `tracks_select_personal_permissive` policy
- Add strict personal tracks isolation

### Phase 3: File Upload Validation
- Add file size limits
- Add file type validation
- Add malware scanning

### Phase 4: Rate Limiting
- Implement upload rate limits
- Implement comment/rating rate limits

### Phase 5: Legal & Consent
- Add Terms of Service
- Add Privacy Policy
- Add playlist follower consent
