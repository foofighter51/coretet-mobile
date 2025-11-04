# CoreTet Unified Implementation Plan V2
**Created:** 2025-11-04 (Updated from 2025-10-29 original)
**Current Build:** 18 (TestFlight)
**Target Builds:** 19, 20
**Total Timeline:** ~2 weeks

---

## Updates from V1

### ✅ Completed Since Original Plan (2025-11-04)
- **Navigation Redesign Complete** - Simplified Band/Personal → Playlists/Profile (95% complete, ready for device testing)
- **Database Migration** - Personal bands created for all users
- **Phase 1 UX Enhancements** - Tasks 1.1-1.4 from original plan:
  - ✅ Task 1.1: Empty States - COMPLETE
  - ✅ Task 1.2: Context Clarity - ATTEMPTED (removed, needs redesign)
  - ✅ Task 1.3: Loading States & Console Cleanup - COMPLETE
  - ✅ Task 1.4: Onboarding Enhancement - COMPLETE (3-screen intro + replay functionality)

### Key Strategic Changes
- **Navigation simplified** from 4 contexts to 2 tabs eliminates much of the "context clarity" problem
- **Personal bands** are now first-class citizens (not a separate mode)
- **Profile tab** now houses band switching, reducing navigation complexity
- **Empty states** and **loading indicators** already implemented
- **Onboarding** already enhanced with intro screens

### What This Means for the Plan
The original plan had significant overlap with completed work. This V2 focuses on:
1. **Week 1**: Modal system infrastructure (unchanged - still critical)
2. **Week 2**: Remaining polish + testing (streamlined - less work needed)

---

## Executive Summary

This plan focuses on **modal system improvements** (from MODAL_AUDIT_REPORT.md) since Phase 1 UX enhancements are largely complete.

**Why Modal Work is Still Critical:**
1. iOS keyboard issues affect 4 core modals (Band, TrackDetail, CreateInvite, CreatePlaylist)
2. Z-index conflicts and ESC key handling need standardization
3. Modal extraction reduces MainDashboard.tsx complexity (2700+ lines)
4. Creates reusable infrastructure for future features

**Remaining Work:**
- **Week 1**: Build modal infrastructure + fix iOS keyboard issues (27 hours)
- **Week 2**: Migrate remaining modals + testing (18 hours)

---

## Week 1: Foundation - Modal System + Critical iOS Fixes

### Build Target: 19 (Foundation)
**Goal:** Create bulletproof modal system that solves 4 critical iOS issues

---

### Task 1.1: Create Z-Index Constants (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 1 hour
**Dependencies:** None
**Risk Level:** Low

**Why First:** Standardizes all subsequent modal work. No more z-index conflicts.

**Files to Create:**
- `/src/constants/zIndex.ts`

**Implementation:**
```typescript
export const Z_INDEX = {
  BASE: 0,
  FIXED_BOTTOM_NAV: 100,
  PLAYBACK_BAR: 99,
  DROPDOWN: 1000,
  MODAL: 1500,
  MODAL_STACKED: 1600,
  TOAST: 2000,
  TUTORIAL: 2500,
} as const;
```

**Success Criteria:**
- Constants file created
- Import path verified
- All values documented with comments

**iOS Testing:** None required

---

### Task 1.2: Build BaseModal Component (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 6 hours
**Dependencies:** Task 1.1 (Z-Index Constants)
**Risk Level:** Medium

**Why Second:** Core infrastructure for ALL modal work. Must be solid.

**Files to Create:**
- `/src/components/ui/Modal.tsx`

**Implementation Features:**
1. **iOS Keyboard Handling:**
   - `scrollIntoView()` on input focus
   - 300ms delay for iOS keyboard animation
   - Works with `keyboardInputRef` prop

2. **ESC Key Support:**
   - Document-level listener
   - Cleanup on unmount
   - Configurable via `closeOnEsc` prop

3. **Scroll Lock (iOS-Safe):**
   - Uses `position: fixed` + `top: -${scrollY}px`
   - Preserves scroll position on close
   - No viewport jump issues

4. **Portal Rendering:**
   - React `createPortal` to `document.body`
   - Proper z-index stacking
   - Backdrop click handling

**Success Criteria:**
- Component compiles without errors
- Accepts all documented props
- Renders to portal correctly
- ESC key closes modal
- Backdrop click closes modal (when enabled)
- Scroll locked when open

**iOS Testing Requirements:**
- Test keyboard show/hide with text input
- Verify no viewport jumping
- Test scroll lock on long content
- Test backdrop click on iPhone SE

---

### Task 1.3: Build Specialized Modal Components (HIGH)
**Priority:** HIGH
**Estimated Time:** 4 hours
**Dependencies:** Task 1.2 (BaseModal)
**Risk Level:** Low

**Files to Create:**
- Add to `/src/components/ui/Modal.tsx`:
  - `DialogModal` (centered with header/footer)
  - `BottomSheetModal` (slides up from bottom)
  - `ConfirmDialog` (simple yes/no prompt)

**Implementation:**
Each component wraps `BaseModal` with preset configurations.

**Success Criteria:**
- All 3 components compile
- Each has correct default props
- Header/footer rendering works
- Bottom sheet animation smooth

**iOS Testing:**
- Test BottomSheetModal slide animation
- Verify DialogModal centering on iPhone SE
- Test ConfirmDialog on iPad

---

### Task 1.4: Fix BandModal iOS Keyboard Issue (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 3 hours
**Dependencies:** Task 1.3 (DialogModal)
**Risk Level:** Medium

**Why Now:** BandModal has text input (band name) and is used in signup flow + Profile tab.

**Files to Modify:**
- `/src/components/molecules/BandModal.tsx`

**Implementation Steps:**
1. Replace custom modal structure with `DialogModal`
2. Add `useRef` for band name input
3. Pass `hasKeyboardInput={true}` and `keyboardInputRef`
4. Lower z-index from 9998 to `Z_INDEX.MODAL`
5. Add ESC key support (via DialogModal)
6. Keep existing form logic intact

**Success Criteria:**
- Modal uses new DialogModal component
- Band name input scrolls into view when keyboard opens
- ESC key closes modal
- Z-index consistent (1500, not 9998)
- All existing functionality preserved
- Works from Profile tab band creation

**iOS Testing Requirements:**
- Open modal on iPhone SE from Profile tab
- Tap band name input
- **VERIFY:** Input visible above keyboard
- Type and submit
- **VERIFY:** Modal closes and band created
- Test ESC key on simulator

---

### Task 1.5: Fix TrackDetailModal iOS Keyboard Issue (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 5 hours
**Dependencies:** Task 1.3 (DialogModal)
**Risk Level:** High

**Why Critical:** Most-used modal in app. Has comment input. Currently 500+ lines inline in MainDashboard.tsx.

**Files to Create:**
- `/src/components/molecules/TrackDetailModal.tsx` (extract from MainDashboard)

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (remove inline component, import new one)

**Implementation Steps:**
1. Extract TrackDetailModal from MainDashboard (lines ~25-538)
2. Convert to `DialogModal` wrapper
3. Add `useRef` for comment input
4. Pass `hasKeyboardInput={true}` and `keyboardInputRef`
5. Preserve all features:
   - Timestamp capture
   - Comment submission with Enter key
   - Rating buttons
   - Timestamp navigation
   - Scroll position save/restore
6. Add ESC key support

**Success Criteria:**
- Modal extracted to separate file
- Comment input scrolls into view when keyboard opens
- All timestamp features work
- ESC key closes modal
- Scroll position preserved
- No regression in comment/rating functionality

**iOS Testing Requirements:**
- Open track modal from Playlists tab
- Tap comment input
- **VERIFY:** Input visible, keyboard doesn't obscure
- Add comment with timestamp
- **VERIFY:** Comment saved correctly
- Test on iPhone 14 Plus (large screen)
- Test landscape orientation

---

### Task 1.6: Fix CreateInvite iOS Keyboard Issue (HIGH)
**Priority:** HIGH
**Estimated Time:** 3 hours
**Dependencies:** Task 1.3 (DialogModal)
**Risk Level:** Medium

**Files to Modify:**
- `/src/components/molecules/CreateInvite.tsx`

**Implementation Steps:**
1. Replace custom modal with `DialogModal`
2. Add `useRef` for email input
3. Pass `hasKeyboardInput={true}` and `keyboardInputRef`
4. Keep z-index at 1600 (stacked above BandSettings)
5. Add ESC key support
6. Preserve enter key submission
7. Keep multi-step flow (email input → link display)

**Success Criteria:**
- Email input scrolls into view on keyboard open
- ESC key closes modal
- Enter key still submits email
- Stacking above BandSettings works
- Native share integration preserved

**iOS Testing:**
- Open Profile tab → Band Settings → Create Invite
- Tap email input
- **VERIFY:** Input visible above keyboard
- Enter email, press Enter
- **VERIFY:** Invite generated
- Test share sheet

---

### Task 1.7: Build DropdownMenu Component (MEDIUM)
**Priority:** MEDIUM
**Estimated Time:** 3 hours
**Dependencies:** Task 1.1 (Z-Index Constants)
**Risk Level:** Low

**Files to Create:**
- `/src/components/ui/DropdownMenu.tsx`

**Implementation:**
- Position: relative/absolute pattern
- Outside click detection via ref
- ESC key closing
- Configurable alignment (left/right)
- Uses `Z_INDEX.DROPDOWN`

**Success Criteria:**
- Component compiles
- Opens on trigger click
- Closes on outside click
- Closes on ESC key
- Closes on selection (if configured)
- Proper z-index stacking

**iOS Testing:**
- Test on iPhone SE (edge of screen)
- Verify doesn't overflow viewport
- Test tap outside to close

---

### Task 1.8: Fix Playlist Menu Missing Outside Click (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 2 hours
**Dependencies:** Task 1.7 (DropdownMenu)
**Risk Level:** Low

**Why Critical:** Current bug - menu stays open and can't close.

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (playlist menu, line ~2507)

**Implementation:**
Replace inline dropdown with `DropdownMenu` component.

**Success Criteria:**
- Menu closes on outside click
- Menu closes on selection
- Menu closes on ESC key
- Existing menu items preserved

**iOS Testing:**
- Open playlist menu from Playlists tab
- Tap outside
- **VERIFY:** Menu closes
- Test on iPad

---

### Week 1 Summary

**Total Time:** 27 hours (3.5 days)
**Build 19 Deployment Checklist:**
- [ ] All 8 tasks completed
- [ ] BaseModal tested on iOS device (not simulator)
- [ ] All 3 keyboard input modals tested on iPhone SE
- [ ] ESC key works in Safari + iOS simulator
- [ ] No z-index conflicts
- [ ] No console errors
- [ ] Git commit: "feat: unified modal system with iOS keyboard fixes"

**Critical Path:** Tasks 1.1 → 1.2 → 1.3 → (1.4, 1.5, 1.6 can run in parallel)

**Risk Mitigation:**
- Task 1.2 (BaseModal) is highest risk - allow extra time for testing
- Task 1.5 (TrackDetailModal extraction) may uncover hidden dependencies
- Keep Build 18 as rollback target if issues arise

---

## Week 2: Remaining Migrations & Polish

### Build Target: 20 (Complete Migration)
**Goal:** Migrate remaining modals, test navigation redesign, production-ready

---

### Task 2.1: Migrate SettingsModal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (BottomSheetModal)
**Risk Level:** Low

**Why First:** Already well-implemented, easy migration to validate pattern.

**Note:** SettingsModal may need updating to work with new Profile tab. Verify it's not redundant with Profile tab functionality.

**Files to Modify:**
- `/src/components/molecules/SettingsModal.tsx`

**Implementation:**
Replace custom modal with `BottomSheetModal`.

**Success Criteria:**
- Uses BottomSheetModal
- All settings options preserved
- ESC key works (via BaseModal)
- Animation matches original
- Works with new Profile tab (no duplication)

**iOS Testing:**
- Open settings from Profile tab
- Test sign out
- Test tutorial trigger

---

### Task 2.2: Migrate Tutorial Modal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (DialogModal)
**Risk Level:** Low

**Files to Modify:**
- `/src/components/molecules/Tutorial.tsx`

**Implementation:**
1. Replace custom modal with `DialogModal`
2. Lower z-index from 2000 to `Z_INDEX.TUTORIAL` (2500)
3. Keep backdrop opacity at 0.7 (intentional darkness)
4. Add ESC key support

**Success Criteria:**
- Uses DialogModal
- Multi-step wizard preserved
- ESC key closes tutorial
- Z-index consistent

**iOS Testing:**
- Open tutorial from Profile tab
- Navigate through steps
- Test ESC key

---

### Task 2.3: Migrate BandSettings Modal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (DialogModal)
**Risk Level:** Low

**Files to Modify:**
- `/src/components/molecules/BandSettings.tsx`

**Implementation:**
Replace custom modal with `DialogModal`, ensure CreateInvite still stacks above.

**Success Criteria:**
- Uses DialogModal
- CreateInvite stacking works (z-index 1600)
- Member list rendering preserved
- ESC key works

**iOS Testing:**
- Open BandSettings from Profile tab
- Open CreateInvite from within
- **VERIFY:** CreateInvite above BandSettings

---

### Task 2.4: Migrate Dropdown Menus (MEDIUM)
**Priority:** MEDIUM
**Estimated Time:** 4 hours
**Dependencies:** Week 1 (DropdownMenu)
**Risk Level:** Low

**Files to Modify:**
- `/src/components/molecules/FilterButton.tsx`
- `/src/components/molecules/SortButton.tsx`
- `/src/components/molecules/UploadButton.tsx`

**Implementation:**
Replace each with `DropdownMenu` component.

**Success Criteria:**
- All 3 use DropdownMenu
- ESC key closes menus
- Outside click closes menus
- Selection behavior preserved
- Consistent z-index (1000)

**iOS Testing:**
- Test each dropdown on iPhone SE
- Verify edge cases (screen edges)
- Test outside click

---

### Task 2.5: Extract CreatePlaylist Inline Component (MEDIUM)
**Priority:** MEDIUM
**Estimated Time:** 3 hours
**Dependencies:** Week 1 (DialogModal)
**Risk Level:** Medium

**Files to Create:**
- `/src/components/molecules/CreatePlaylistModal.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (line ~1577)

**Implementation:**
1. Extract CreatePlaylist form from MainDashboard
2. Wrap in `DialogModal`
3. Add `useRef` for playlist title input
4. Pass `hasKeyboardInput={true}` and `keyboardInputRef`
5. Add ESC key support

**Success Criteria:**
- Extracted to separate file
- Title input scrolls into view on keyboard
- ESC key closes modal
- Playlist creation works

**iOS Testing:**
- Open create playlist from Playlists tab
- Tap title input
- **VERIFY:** Input visible above keyboard

---

### Task 2.6: Convert Delete Confirmations to ConfirmDialog (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (ConfirmDialog)
**Risk Level:** Low

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (lines ~1788, 1835)

**Implementation:**
Replace inline confirmation boxes with `ConfirmDialog` component.

**Success Criteria:**
- Delete playlist uses ConfirmDialog
- Copy to personal uses ConfirmDialog (if still relevant with new nav)
- Destructive actions colored red
- ESC key cancels

**iOS Testing:**
- Test delete flow from Playlists tab
- Verify modal stacking

---

### Task 2.7: Rename & Extract TrackSelectorModal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** None
**Risk Level:** Low

**Files to Create:**
- `/src/components/molecules/TrackSelector.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (lines ~541-704)

**Implementation:**
1. Extract inline component
2. Rename to `TrackSelector` (not a modal)
3. Keep as inline expansion (not overlay)
4. Clean up styling

**Success Criteria:**
- Extracted to separate file
- Renamed appropriately
- Functionality preserved
- Max height (300px) preserved

**iOS Testing:**
- Add tracks to playlist from Playlists tab
- Verify checkbox selection

---

### Task 2.8: Navigation Redesign Device Testing (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 3 hours
**Dependencies:** None (tests existing work)
**Risk Level:** Medium

**Why Critical:** Navigation redesign is 95% complete but not tested on device.

**Testing Areas:**
1. **Playlists Tab:**
   - View playlists for current band
   - Empty states work correctly
   - Create playlist works
   - Add tracks to playlist

2. **Profile Tab:**
   - User info displays correctly
   - Band switcher shows all bands with active indicator
   - Create New Band button works
   - Help buttons work (Tutorial, Replay Intro)
   - Sign Out works

3. **Band Switching:**
   - Switch between bands
   - Verify Playlists tab updates to show new band's playlists
   - Verify uploads go to correct band
   - Test with single-band and multi-band users

4. **Edge Cases:**
   - Fresh install flow
   - User with only Personal band
   - User with multiple bands
   - Long band names
   - Many bands (scrolling)

**Success Criteria:**
- All navigation flows work on device
- No visual bugs
- Band switching is intuitive
- Profile tab is discoverable
- No performance issues

**iOS Testing Requirements:**
- Test on physical iPhone (not simulator)
- Test on iPhone SE (small screen)
- Test with multiple test accounts
- Verify onboarding creates Personal band correctly

---

### Week 2 Summary

**Total Time:** 18 hours (2.25 days)
**Build 20 Deployment Checklist:**
- [ ] All 8 tasks completed
- [ ] All modals migrated to new system
- [ ] Navigation redesign tested on device
- [ ] No regressions in core flows
- [ ] Code cleanup done
- [ ] Git commit: "feat: complete modal migration + navigation testing"

**Parallel Work Opportunities:**
- Tasks 2.1-2.7 can run mostly in parallel
- Task 2.8 (Navigation testing) should happen last

---

## Rationale: What Changed from V1

### Completed Work (No Longer Needed)
- **Week 2 Task 2.1 (Empty States)** → Already complete
- **Week 2 Task 2.2 (Context Clarity)** → Solved by navigation redesign
- **Week 2 Task 2.3 (Loading States)** → Already complete
- **Week 2 Task 2.4 (Console Cleanup)** → Already complete
- **Week 2 Task 2.5 (Onboarding)** → Already complete (3-screen intro)
- **Week 3 Task 3.8 (Final Testing)** → Consolidated into Week 2 Task 2.8

### What's Still Needed
- **All Week 1 tasks** → iOS keyboard issues still exist
- **Modal migrations** → Code cleanup still needed
- **Navigation device testing** → 95% complete, needs validation

### Timeline Reduction
- **Original:** 3 weeks (76 hours)
- **V2:** 2 weeks (45 hours)
- **Savings:** 31 hours (41% reduction)

---

## Critical Path Analysis

### Longest Dependency Chain (Cannot Parallelize):

```
Task 1.1 (1h) → Task 1.2 (6h) → Task 1.3 (4h) → Task 1.5 (5h)
  → Task 2.5 (3h) → Task 2.8 (3h)

Total Critical Path: 22 hours = 2.75 days
```

**Total Timeline Calculation:**
- Critical Path: 22 hours (2.75 days)
- Parallel Work: +23 hours (can run concurrently)
- Testing Buffer: +3 hours (iOS device testing)
- **Total Calendar Time: ~10 working days (2 weeks)**

---

## Build Targets & Milestones

### Build 19: Week 1 Completion
**Deploy Date:** End of Week 1
**Goal:** Modal infrastructure complete, 4 iOS keyboard issues fixed

**What's New:**
- Unified modal system (BaseModal, DialogModal, BottomSheetModal)
- Z-index constants
- ESC key handling on all modals
- iOS keyboard fixes (BandModal, TrackDetailModal, CreateInvite)
- Dropdown menu component
- Playlist menu outside-click fix

**Testing Checklist:**
- [ ] BandModal keyboard test (iPhone SE)
- [ ] TrackDetailModal keyboard test (iPhone 14)
- [ ] CreateInvite keyboard test (iPhone 14 Plus)
- [ ] ESC key works in Safari
- [ ] No z-index conflicts
- [ ] Dropdowns close on outside click

**Success Metrics:**
- Zero iOS keyboard complaints from testers
- All modals closeable with ESC key
- No z-index visual bugs

---

### Build 20: Week 2 Completion
**Deploy Date:** End of Week 2
**Goal:** Complete modal migration, navigation tested, production-ready

**What's New:**
- All modals migrated to unified system
- SettingsModal, Tutorial, BandSettings use new system
- FilterButton, SortButton, UploadButton use DropdownMenu
- CreatePlaylist extracted with keyboard fixes
- Confirmations use ConfirmDialog
- Navigation redesign validated on device
- Full regression testing complete

**Testing Checklist:**
- [ ] All modals on 3 device sizes
- [ ] Navigation flows tested on device
- [ ] Band switching tested
- [ ] Profile tab functionality verified
- [ ] Modal stacking test
- [ ] Edge case testing (long content, multiple bands)

**Success Metrics:**
- Zero modal-related bugs in production
- Navigation feels natural and intuitive
- Consistent UX across all dialogs
- Code maintainability improved

---

## Risk Management

### High-Risk Tasks

**Task 1.2 (BaseModal) - Risk: Medium**
- **Why Risky:** Core infrastructure, affects everything
- **Mitigation:**
  - Build with tests first
  - Test on iOS device immediately
  - Have rollback plan (keep old BandModal working)

**Task 1.5 (TrackDetailModal Extraction) - Risk: High**
- **Why Risky:** 500+ lines inline, heavily used, complex state
- **Mitigation:**
  - Extract WITHOUT changing logic first
  - Test before converting to DialogModal
  - Keep original code commented until verified
  - Extended iOS testing (2 hours)

**Task 2.8 (Navigation Testing) - Risk: Medium**
- **Why Risky:** New navigation is 95% complete but untested on device
- **Mitigation:**
  - Test on multiple device sizes
  - Test with multiple user scenarios
  - Get user feedback before finalizing

---

## Git Workflow

### Week 1:
```bash
git checkout -b feat/unified-modal-system
# Complete all Week 1 tasks
git add .
git commit -m "feat: unified modal system with iOS keyboard fixes

- Create BaseModal with iOS keyboard handling
- Add DialogModal, BottomSheetModal, ConfirmDialog
- Fix BandModal, TrackDetailModal, CreateInvite keyboard issues
- Standardize z-index with constants
- Add ESC key support to all modals
- Fix playlist menu outside-click bug
- Create reusable DropdownMenu component

Closes #[issue-number]"
git push origin feat/unified-modal-system
# Create PR, test on TestFlight, merge
```

### Week 2:
```bash
git checkout -b feat/complete-modal-migration
# Complete all Week 2 tasks
git commit -m "feat: complete modal migration + navigation validation

- Migrate SettingsModal, Tutorial, BandSettings to new system
- Migrate all dropdown menus to DropdownMenu component
- Extract CreatePlaylist with keyboard fixes
- Convert confirmations to ConfirmDialog
- Complete navigation redesign device testing
- Validate band switching and profile functionality

Closes #[issue-number]"
# Merge to main, deploy Build 20
```

---

## Rollback Plan

### If Week 1 Fails:
- Keep Build 18 in TestFlight
- Revert `feat/unified-modal-system` branch
- Debug BaseModal on iOS device
- Extend Week 1 by 2-3 days if needed

### If Week 2 Fails:
- Keep Build 19 in TestFlight
- Week 2 tasks are isolated (can revert individually)
- Can ship Build 19 to production if needed (though missing polish)

---

## Next Steps

### Immediate:
1. Review this updated plan
2. Confirm Phase 1 UX work is complete (verify empty states, loading, onboarding)
3. Test navigation redesign on device (Task 2.8 could be moved to immediate)
4. Begin Task 1.1 (Z-Index Constants)

### Week 1 Kickoff:
1. Create feature branch: `feat/unified-modal-system`
2. Complete Task 1.1 → 1.2 → 1.3 (critical path)
3. Parallelize Tasks 1.4, 1.5, 1.6, 1.7 + 1.8
4. iOS device testing (4 hours)
5. Deploy Build 19 to TestFlight

### Week 2 Kickoff:
1. Create feature branch: `feat/complete-modal-migration`
2. Parallelize Tasks 2.1-2.7
3. Complete Task 2.8 (navigation testing)
4. Deploy Build 20 to TestFlight
5. Prepare for production launch

---

## Summary: V1 → V2 Changes

### Removed (Already Complete):
- Empty States implementation
- Context Clarity implementation (solved by nav redesign)
- Loading States implementation
- Console Cleanup
- Onboarding Enhancement
- Most of Week 3 tasks (consolidated)

### Kept (Still Needed):
- All modal system work (Week 1)
- Modal migrations (Week 2)
- Navigation device testing (new Task 2.8)

### Timeline:
- **V1:** 3 weeks, 76 hours
- **V2:** 2 weeks, 45 hours
- **Reduction:** 41% less work

---

**END OF UNIFIED IMPLEMENTATION PLAN V2**

**Ready to Start:** YES
**Next Task:** Task 1.1 - Create Z-Index Constants (or Task 2.8 - Navigation Testing if prioritizing validation)
**Estimated Completion:** 2 weeks from start date
**Risk Level:** MEDIUM (high value, medium effort)
