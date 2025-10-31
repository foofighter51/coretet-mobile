# CoreTet Unified Implementation Plan
**Created:** 2025-10-29
**Current Build:** 18 (TestFlight)
**Target Builds:** 19, 20, 21
**Total Timeline:** 3 weeks

---

## Executive Summary

This plan sequences **modal system improvements** (MODAL_AUDIT_REPORT.md) with **Phase 1 UX enhancements** (IMPLEMENTATION_ACTION_PLAN.md) to create a cohesive, tested foundation for CoreTet's next three builds.

**Why This Sequence:**
1. **Week 1** builds the modal infrastructure FIRST - fixes critical iOS keyboard issues that affect ALL future work
2. **Week 2** implements Phase 1 features USING the new modal system - no rework needed
3. **Week 3** completes modal migration and polish - leaves codebase in excellent state

**Critical Dependencies Resolved:**
- Empty state CTAs (Week 2) will use properly tested modals (Week 1)
- New onboarding (Week 2) will use BottomSheetModal with iOS fixes (Week 1)
- All Phase 1 features inherit ESC key handling, z-index consistency, and keyboard safety

---

## Week 1: Foundation - Modal System + Critical iOS Fixes

### Build Target: 19 (Foundation)
**Goal:** Create bulletproof modal system that solves 4 critical iOS issues before any new features

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

**Why Now:** BandModal has text input (band name) and is used in signup flow.

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
- No breaking changes to parent components

**iOS Testing Requirements:**
- Open modal on iPhone SE
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
1. Extract TrackDetailModal from MainDashboard (lines 25-538)
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
- Open track modal
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
- Open BandSettings → Create Invite
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
- `/src/components/screens/MainDashboard.tsx` (playlist menu, line 2507)

**Implementation:**
Replace inline dropdown with `DropdownMenu` component.

**Success Criteria:**
- Menu closes on outside click
- Menu closes on selection
- Menu closes on ESC key
- Existing menu items preserved

**iOS Testing:**
- Open playlist menu
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

## Week 2: Phase 1 Core Features (Using New Modal System)

### Build Target: 20 (UX Enhancements)
**Goal:** Implement Phase 1 tasks from IMPLEMENTATION_ACTION_PLAN.md using the new modal infrastructure

---

### Task 2.1: Empty States (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 5 hours
**Dependencies:** Week 1 complete (modals available for CTAs)
**Risk Level:** Low

**Why First:** New users see blank screens immediately. Conversion killer.

**Files to Create:**
- `/src/components/ui/EmptyState.tsx` (reusable component)

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx`

**Implementation:**
1. Create EmptyState component with:
   - Icon (large, centered)
   - Heading
   - Description text
   - CTA button (optional)
2. Add to each tab:
   - **Tracks tab:** "Upload your first demo" → triggers AudioUploader
   - **Playlists tab:** "Create a playlist" → triggers CreatePlaylist form
   - **Bands tab:** "Start a band" → triggers BandModal (now with iOS fixes!)
   - **Personal tab:** "This is your private workspace" + explanation
3. Conditional rendering (only show when no content)

**Success Criteria:**
- All 4 tabs have empty states
- CTAs trigger correct actions
- Empty states disappear when content added
- Consistent design across tabs
- Uses existing designTokens

**iOS Testing:**
- Fresh install test (no data)
- Verify CTAs work on iPhone SE
- Test each tab's empty state CTA

---

### Task 2.2: Context Clarity (HIGH)
**Priority:** HIGH
**Estimated Time:** 6 hours
**Dependencies:** Task 2.1 (may share header space)
**Risk Level:** Medium

**Why Second:** Users confused about personal vs band uploads RIGHT NOW.

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (header)
- `/src/components/molecules/AudioUploader.tsx`
- `/src/contexts/BandContext.tsx` (verify state, don't modify)

**Implementation:**
1. **Header Context Indicator:**
   - Always-visible badge showing current context
   - Personal: user avatar + "Personal"
   - Band: band color initials + band name
   - Positioned in header next to title

2. **AudioUploader Context Display:**
   - Add: "Uploading to: [Context Name]"
   - Show BEFORE file selection
   - Use same badge styling as header

3. **Track List Visual Differentiation:**
   - Band tracks: small band initials badge (top-right of track card)
   - Personal tracks: small user avatar badge

**Success Criteria:**
- User always knows current context
- Context visible BEFORE upload
- No breaking changes to BandContext
- Band switching still works
- Visual design consistent

**iOS Testing:**
- Upload in personal context
- Switch to band context
- Upload in band context
- **VERIFY:** Uploads go to correct context
- Test with multiple bands

---

### Task 2.3: Loading States (HIGH)
**Priority:** HIGH
**Estimated Time:** 6 hours
**Dependencies:** None (independent of other Week 2 tasks)
**Risk Level:** Low

**Why Third:** Users don't know what's happening during async operations.

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (track list loading)
- `/src/utils/audioUploadService.ts` (upload progress)
- `/src/components/molecules/TrackDetailModal.tsx` (track details loading)
- `/src/components/molecules/BandSettings.tsx` (member list loading)

**Implementation:**
1. **Track List Loading:**
   - Add IonSpinner while fetching
   - Skeleton cards for first load
   - "Refreshing..." indicator for pull-to-refresh

2. **Upload Progress:**
   - IonProgressBar in AudioUploader
   - Show percentage: "Uploading... 45%"
   - Disable close during upload

3. **Modal Loading:**
   - Spinner in TrackDetailModal while fetching comments
   - Spinner in BandSettings while fetching members

4. **Error States:**
   - Toast notifications for failures
   - Retry buttons for network errors

**Success Criteria:**
- No silent loading anywhere
- Upload shows percentage
- Users can cancel long uploads
- Error messages are friendly
- Loading states don't block UI

**iOS Testing:**
- Upload large file (slow network)
- Open track modal (slow connection)
- Test airplane mode scenarios

---

### Task 2.4: Console Log Cleanup (HIGH)
**Priority:** HIGH
**Estimated Time:** 4 hours
**Dependencies:** None (can run in parallel with all Week 2 tasks)
**Risk Level:** Low

**Why Fourth:** 288 console.logs including PII = security risk.

**Files to Audit:** All `.ts` and `.tsx` files

**Implementation:**
1. Search codebase: `console.log`
2. Categorize each:
   - **Debug logs** → DELETE
   - **Error logs** → Convert to error handling (toast or modal)
   - **State change logs** → Convert to loading indicators (Task 2.3)
   - **PII logs** → DELETE IMMEDIATELY (user IDs, emails, tokens)

3. Add production check for any remaining logs:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[DEV]', message);
}
```

4. Use error boundary for unhandled errors

**Success Criteria:**
- Zero console.logs in production build
- No PII in any logs
- Errors surface to user appropriately
- Dev mode still shows helpful logs

**iOS Testing:**
- Build production version
- Open Safari Web Inspector
- **VERIFY:** No console output during normal use
- **VERIFY:** Errors show user-friendly messages

---

### Task 2.5: Onboarding Enhancement (MEDIUM)
**Priority:** MEDIUM
**Estimated Time:** 5 hours
**Dependencies:** Week 1 complete (uses BottomSheetModal)
**Risk Level:** Low

**Why Fifth:** Improves activation but doesn't fix broken UX.

**Files to Modify:**
- `/src/components/screens/OnboardingScreen.tsx`

**Implementation:**
1. Create 3-screen intro flow using `BottomSheetModal`:
   - **Screen 1:** "Your private creative space"
     - Icon: multiple user circles (band icon)
     - Text: "Create private bands to share music"

   - **Screen 2:** "Timestamped feedback"
     - Icon: waveform with comment pin
     - Text: "Leave comments at exact moments"

   - **Screen 3:** "Your music stays private"
     - Icon: lock
     - Text: "Invite-only. No public feeds. Ever."

2. Add to AFTER name entry, BEFORE main dashboard
3. Skip button on each screen
4. Progress dots (1/3, 2/3, 3/3)
5. Store completion: `localStorage.setItem('onboarding_v1_completed', 'true')`
6. Existing users bypass (check localStorage)

**Success Criteria:**
- New users see intro after name entry
- Existing users don't see intro
- Can skip without breaking flow
- Uses BottomSheetModal (iOS-safe)
- Progress dots work
- Completion tracked

**iOS Testing:**
- Fresh install → complete intro
- Close app → reopen
- **VERIFY:** Intro doesn't show again
- Test skip button
- Test on iPad (larger screen)

---

### Week 2 Summary

**Total Time:** 26 hours (3.25 days)
**Build 20 Deployment Checklist:**
- [ ] All 5 tasks completed
- [ ] Empty states tested on fresh install
- [ ] Context clarity verified with band switching
- [ ] Loading states tested on slow network
- [ ] Zero console.logs in production
- [ ] Onboarding tested on new account
- [ ] No regressions in core flows
- [ ] Git commit: "feat: Phase 1 UX enhancements - empty states, context clarity, loading"

**Parallel Work Opportunities:**
- Task 2.3 (Loading States) + Task 2.4 (Console Cleanup) can run simultaneously
- Task 2.1 (Empty States) + Task 2.2 (Context Clarity) are sequential (share header)

---

## Week 3: Remaining Migrations & Polish

### Build Target: 21 (Complete Migration)
**Goal:** Migrate remaining modals, extract inline components, polish all features

---

### Task 3.1: Migrate SettingsModal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (BottomSheetModal)
**Risk Level:** Low

**Why First:** Already well-implemented, easy migration to validate pattern.

**Files to Modify:**
- `/src/components/molecules/SettingsModal.tsx`

**Implementation:**
Replace custom modal with `BottomSheetModal`.

**Success Criteria:**
- Uses BottomSheetModal
- All settings options preserved
- ESC key works (via BaseModal)
- Animation matches original

**iOS Testing:**
- Open settings
- Test sign out
- Test tutorial trigger

---

### Task 3.2: Migrate Tutorial Modal (LOW)
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
- Open tutorial
- Navigate through steps
- Test ESC key

---

### Task 3.3: Migrate BandSettings Modal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (DialogModal), Task 3.4
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
- Open BandSettings
- Open CreateInvite from within
- **VERIFY:** CreateInvite above BandSettings

---

### Task 3.4: Migrate Dropdown Menus (MEDIUM)
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

### Task 3.5: Extract CreatePlaylist Inline Component (MEDIUM)
**Priority:** MEDIUM
**Estimated Time:** 3 hours
**Dependencies:** Week 1 (DialogModal)
**Risk Level:** Medium

**Files to Create:**
- `/src/components/molecules/CreatePlaylistModal.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (line 1577)

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
- Open create playlist
- Tap title input
- **VERIFY:** Input visible above keyboard

---

### Task 3.6: Convert Delete Confirmations to ConfirmDialog (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** Week 1 (ConfirmDialog)
**Risk Level:** Low

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (lines 1788, 1835)

**Implementation:**
Replace inline confirmation boxes with `ConfirmDialog` component.

**Success Criteria:**
- Delete playlist uses ConfirmDialog
- Copy to personal uses ConfirmDialog
- Destructive actions colored red
- ESC key cancels

**iOS Testing:**
- Test delete flow
- Test copy flow
- Verify modal stacking

---

### Task 3.7: Rename & Extract TrackSelectorModal (LOW)
**Priority:** LOW
**Estimated Time:** 2 hours
**Dependencies:** None
**Risk Level:** Low

**Files to Create:**
- `/src/components/molecules/TrackSelector.tsx`

**Files to Modify:**
- `/src/components/screens/MainDashboard.tsx` (lines 541-704)

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
- Add tracks to playlist
- Verify checkbox selection

---

### Task 3.8: Final Testing & Polish (CRITICAL)
**Priority:** CRITICAL
**Estimated Time:** 6 hours
**Dependencies:** All Week 3 tasks complete
**Risk Level:** High

**Implementation:**
1. **Regression Testing:**
   - Test all core flows (signup → upload → feedback)
   - Test all modals on iPhone SE, iPhone 14, iPad
   - Test landscape orientation
   - Test slow network conditions
   - Test edge cases (multiple bands, long content)

2. **iOS Device Testing:**
   - Test ALL keyboard input modals
   - Verify scroll lock on long modals
   - Test modal stacking (BandSettings → CreateInvite)
   - Test ESC key in Safari + simulator

3. **Code Cleanup:**
   - Remove old modal code
   - Delete unused components
   - Update imports
   - Run linter

4. **Documentation:**
   - Update modal usage guide
   - Document z-index system
   - Add iOS testing checklist to repo

**Success Criteria:**
- All core flows working
- No console errors
- No z-index conflicts
- All modals iOS-safe
- Code cleaned up
- Documentation complete

**iOS Testing Requirements:**
- [ ] BandModal keyboard test
- [ ] TrackDetailModal keyboard test
- [ ] CreateInvite keyboard test
- [ ] CreatePlaylist keyboard test
- [ ] All dropdowns work
- [ ] Modal stacking works
- [ ] ESC key works everywhere
- [ ] No scroll lock issues
- [ ] No viewport jumping

---

### Week 3 Summary

**Total Time:** 23 hours (3 days)
**Build 21 Deployment Checklist:**
- [ ] All 8 tasks completed
- [ ] All modals migrated to new system
- [ ] Full regression testing passed
- [ ] iOS device testing completed
- [ ] Code cleanup done
- [ ] Documentation updated
- [ ] Git commit: "feat: complete modal migration + final polish"

**Rollback Plan:**
- Keep Build 20 available in TestFlight
- Document any breaking changes
- Have rollback script ready

---

## Rationale: Why This Sequence is Optimal

### 1. Modal System Must Come First (Week 1)

**Reason:** Avoids rework and ensures iOS safety from day one.

**Example Scenario (Wrong Order):**
- Week 1: Build empty states with CTAs
- Week 2: Discover BandModal has iOS keyboard bug
- Week 3: Rebuild modal system
- **Week 4: Rework ALL CTAs to use new modals** ❌ WASTED TIME

**Correct Order (This Plan):**
- Week 1: Build modal system with iOS fixes
- Week 2: Empty state CTAs use already-tested modals ✅ NO REWORK
- Week 3: Migrate legacy modals ✅ CLEAN CODEBASE

### 2. Critical iOS Issues Can't Wait

**4 Components with Keyboard Input Issues:**
1. BandModal (used in signup)
2. TrackDetailModal (most-used modal)
3. CreateInvite (band growth)
4. CreatePlaylist (core feature)

**Impact:** Every new user encounters these bugs. Fix immediately.

### 3. Phase 1 Tasks Depend on Stable Modals

**Empty States (Task 2.1) CTAs trigger:**
- BandModal (band creation) → needs iOS fixes
- CreatePlaylist → needs keyboard handling
- AudioUploader → needs consistent z-index

**Onboarding (Task 2.5) uses:**
- BottomSheetModal → must be built first

### 4. Parallel Work Opportunities

**Week 1 Parallelization:**
```
Critical Path: 1.1 → 1.2 → 1.3 → END
Parallel:
  ├─ 1.4 (BandModal)
  ├─ 1.5 (TrackDetailModal)  ← LONGEST (5 hours)
  ├─ 1.6 (CreateInvite)
  └─ 1.7 → 1.8 (DropdownMenu + Playlist fix)
```

**Week 2 Parallelization:**
```
Sequential: 2.1 (Empty States) → 2.2 (Context Clarity)
Parallel:
  ├─ 2.3 (Loading States)
  ├─ 2.4 (Console Cleanup)
  └─ 2.5 (Onboarding)
```

### 5. Conflicts Avoided

**Z-Index Conflicts:**
- Week 1 standardizes constants
- All subsequent work uses constants
- No more BandModal (9998) vs Tutorial (2000) issues

**iOS Keyboard Conflicts:**
- Week 1 solves in BaseModal once
- All new modals inherit solution
- No per-component debugging

**Code Duplication:**
- Week 1 creates reusable components
- Week 2 & 3 use, not rebuild
- No 6 different "outside click" implementations

### 6. Build Quality Gates

**Build 19 (Week 1):** Must pass iOS keyboard tests before Week 2 starts
**Build 20 (Week 2):** Must pass fresh install test before Week 3
**Build 21 (Week 3):** Must pass full regression before production

---

## Critical Path Analysis

### Longest Dependency Chain (Cannot Parallelize):

```
Task 1.1 (1h) → Task 1.2 (6h) → Task 1.3 (4h) → Task 1.5 (5h)
  → Task 2.1 (5h) → Task 2.2 (6h) → Task 3.8 (6h)

Total Critical Path: 33 hours = 4.1 days
```

**Why This is the Critical Path:**
1. Task 1.1 (Z-Index) → everything depends on this
2. Task 1.2 (BaseModal) → all modals depend on this
3. Task 1.3 (Specialized) → Task 1.5 needs DialogModal
4. Task 1.5 (TrackDetailModal) → longest Week 1 task, blocks Week 2
5. Task 2.1 (Empty States) → blocks Task 2.2 (shares header)
6. Task 2.2 (Context Clarity) → must complete before Build 20
7. Task 3.8 (Testing) → must complete before Build 21

**Total Timeline Calculation:**
- Critical Path: 33 hours (4.1 days)
- Parallel Work: +41 hours (can run concurrently)
- Testing Buffer: +6 hours (iOS device testing)
- **Total Calendar Time: 15 working days (3 weeks)**

### Parallelization Efficiency:

**Without Parallel Work:** 74 hours = 9.25 days
**With Parallel Work:** 33 hours critical + concurrent = **15 days total**
**Efficiency Gain:** 38% faster

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
**Goal:** Phase 1 UX enhancements using new modal system

**What's New:**
- Empty states on all tabs with CTAs
- Context clarity (header indicator, upload context)
- Loading states (spinners, progress bars, skeletons)
- Console log cleanup (zero production logs)
- Enhanced onboarding (3-screen intro)

**Testing Checklist:**
- [ ] Fresh install empty state test
- [ ] Context switching test (personal → band → upload)
- [ ] Loading states on slow network
- [ ] Zero console.logs in production
- [ ] Onboarding completion test

**Success Metrics:**
- Activation rate increase (fresh install → first upload)
- Fewer "where did my upload go?" support questions
- No silent loading states

---

### Build 21: Week 3 Completion
**Deploy Date:** End of Week 3
**Goal:** Complete modal migration, polish, production-ready

**What's New:**
- All modals migrated to unified system
- All inline components extracted
- SettingsModal, Tutorial, BandSettings use new system
- FilterButton, SortButton, UploadButton use DropdownMenu
- CreatePlaylist extracted with keyboard fixes
- Confirmations use ConfirmDialog
- Full regression testing complete

**Testing Checklist:**
- [ ] Full core flow test (signup → upload → feedback)
- [ ] All modals on 3 device sizes
- [ ] Landscape orientation test
- [ ] Modal stacking test
- [ ] Slow network test
- [ ] Edge case testing (long content, multiple bands)

**Success Metrics:**
- Zero modal-related bugs in production
- Consistent UX across all dialogs
- Code maintainability improved (reusable components)

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

**Task 2.2 (Context Clarity) - Risk: Medium**
- **Why Risky:** Touches BandContext, affects upload routing
- **Mitigation:**
  - Read-only BandContext access
  - Test upload routing thoroughly
  - Verify band switching doesn't break

**Task 3.8 (Final Testing) - Risk: High**
- **Why Risky:** Regression bugs can slip through
- **Mitigation:**
  - Dedicated 6-hour testing block
  - Test on 3 device sizes
  - Test all core flows
  - Have rollback script ready

---

## Testing Strategy

### Week 1: Unit + iOS Keyboard Testing
**Focus:** Modal components work correctly on iOS devices

**Tests:**
- Unit: ESC key, outside click, scroll lock
- Integration: Modal stacking, z-index
- iOS Device: Keyboard appearance, scroll position

**Devices:**
- iPhone SE (smallest screen - worst case)
- iPhone 14 (standard)
- iPad (different behavior)

---

### Week 2: Integration + Fresh Install Testing
**Focus:** Phase 1 features work together, new user experience

**Tests:**
- Integration: Empty states → CTAs → modals
- Fresh Install: Signup → onboarding → first upload
- Context Switching: Personal → band → upload verification

**Devices:**
- iPhone SE (fresh install)
- iPhone 14 Plus (context switching)

---

### Week 3: Full Regression Testing
**Focus:** Everything works, no regressions, production-ready

**Tests:**
- Core Flows: Signup, upload, feedback, band creation, playlists
- Edge Cases: Long content, multiple bands, slow network
- Orientation: Portrait/landscape on all modals
- Performance: No memory leaks, smooth animations

**Devices:**
- iPhone SE, iPhone 14, iPhone 14 Plus, iPad
- Simulator (ESC key testing)
- Safari Web Inspector (console log verification)

---

## Success Criteria (Overall)

### Build 19 Success:
- [ ] Zero iOS keyboard obstruction bugs
- [ ] All modals close with ESC key
- [ ] Z-index system documented and consistent
- [ ] 4 critical modals fixed (Band, TrackDetail, CreateInvite, PlaylistMenu)

### Build 20 Success:
- [ ] Fresh install experience improved (empty states)
- [ ] Users understand context (personal vs band)
- [ ] No silent loading states
- [ ] Zero console.logs in production
- [ ] Onboarding value prop clear

### Build 21 Success:
- [ ] All modals use unified system
- [ ] Code maintainability improved
- [ ] Full regression testing passed
- [ ] Production-ready codebase
- [ ] Documentation complete

---

## File Inventory

### New Files Created (Week 1):
- `/src/constants/zIndex.ts` (Task 1.1)
- `/src/components/ui/Modal.tsx` (Task 1.2)
- `/src/components/ui/DropdownMenu.tsx` (Task 1.7)

### New Files Created (Week 2):
- `/src/components/ui/EmptyState.tsx` (Task 2.1)

### New Files Created (Week 3):
- `/src/components/molecules/TrackDetailModal.tsx` (Task 1.5 - extracted)
- `/src/components/molecules/CreatePlaylistModal.tsx` (Task 3.5)
- `/src/components/molecules/TrackSelector.tsx` (Task 3.7)

### Files Modified (Week 1):
- `/src/components/molecules/BandModal.tsx` (Task 1.4)
- `/src/components/molecules/CreateInvite.tsx` (Task 1.6)
- `/src/components/screens/MainDashboard.tsx` (Tasks 1.5, 1.8)

### Files Modified (Week 2):
- `/src/components/screens/MainDashboard.tsx` (Tasks 2.1, 2.2, 2.3)
- `/src/components/molecules/AudioUploader.tsx` (Task 2.2)
- `/src/utils/audioUploadService.ts` (Task 2.3)
- `/src/components/molecules/BandSettings.tsx` (Task 2.3)
- `/src/components/screens/OnboardingScreen.tsx` (Task 2.5)
- All `.ts` and `.tsx` files (Task 2.4 - console cleanup)

### Files Modified (Week 3):
- `/src/components/molecules/SettingsModal.tsx` (Task 3.1)
- `/src/components/molecules/Tutorial.tsx` (Task 3.2)
- `/src/components/molecules/BandSettings.tsx` (Task 3.3)
- `/src/components/molecules/FilterButton.tsx` (Task 3.4)
- `/src/components/molecules/SortButton.tsx` (Task 3.4)
- `/src/components/molecules/UploadButton.tsx` (Task 3.4)
- `/src/components/screens/MainDashboard.tsx` (Tasks 3.5, 3.6, 3.7)

### Files to Delete (Week 3):
- None (all migrations are refactors, not deletions)
- Old code will be replaced inline

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
git checkout -b feat/phase1-ux-enhancements
# Complete all Week 2 tasks
git commit -m "feat: Phase 1 UX enhancements

- Add empty states with CTAs to all tabs
- Add context clarity indicators (header + upload)
- Add loading states (spinners, progress, skeletons)
- Clean up all console.logs (zero in production)
- Enhance onboarding with 3-screen intro

Closes #[issue-number]"
# Merge to main, deploy Build 20
```

### Week 3:
```bash
git checkout -b feat/complete-modal-migration
# Complete all Week 3 tasks
git commit -m "feat: complete modal migration + final polish

- Migrate SettingsModal, Tutorial, BandSettings to new system
- Migrate all dropdown menus to DropdownMenu component
- Extract CreatePlaylist with keyboard fixes
- Convert confirmations to ConfirmDialog
- Extract and rename TrackSelector
- Full regression testing complete

Closes #[issue-number]"
# Merge to main, deploy Build 21
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
- Phase 1 tasks are isolated (can revert individually)
- Console cleanup is safe (won't break anything)

### If Week 3 Fails:
- Keep Build 20 in TestFlight
- Week 3 is polish (not critical)
- Can ship Build 20 to production if needed

---

## Next Steps

### Immediate (This Week):
1. Review this plan with team
2. Create GitHub issues for each task
3. Set up TestFlight build pipeline
4. Begin Task 1.1 (Z-Index Constants)

### Week 1 Kickoff:
1. Create feature branch: `feat/unified-modal-system`
2. Complete Task 1.1 → 1.2 → 1.3 (critical path)
3. Parallelize Tasks 1.4, 1.5, 1.6, 1.7 + 1.8
4. iOS device testing (6 hours)
5. Deploy Build 19 to TestFlight

### Week 2 Kickoff:
1. Create feature branch: `feat/phase1-ux-enhancements`
2. Complete Task 2.1 → 2.2 (sequential)
3. Parallelize Tasks 2.3, 2.4, 2.5
4. Fresh install testing
5. Deploy Build 20 to TestFlight

### Week 3 Kickoff:
1. Create feature branch: `feat/complete-modal-migration`
2. Migrate remaining modals (Tasks 3.1-3.7)
3. Full regression testing (Task 3.8)
4. Deploy Build 21 to TestFlight
5. Prepare for production launch

---

## Appendix: Task Dependencies Graph

```
Week 1:
1.1 (Z-Index) ──┬──> 1.2 (BaseModal) ──> 1.3 (Specialized) ──┬──> 1.4 (BandModal)
                │                                              ├──> 1.5 (TrackDetail) ← LONGEST
                │                                              └──> 1.6 (CreateInvite)
                └──> 1.7 (DropdownMenu) ──> 1.8 (Playlist Fix)

Week 2:
Week 1 Complete ──┬──> 2.1 (Empty States) ──> 2.2 (Context Clarity)
                  ├──> 2.3 (Loading States)
                  ├──> 2.4 (Console Cleanup)
                  └──> 2.5 (Onboarding)

Week 3:
Week 2 Complete ──┬──> 3.1 (Settings)
                  ├──> 3.2 (Tutorial)
                  ├──> 3.3 (BandSettings)
                  ├──> 3.4 (Dropdowns)
                  ├──> 3.5 (CreatePlaylist)
                  ├──> 3.6 (Confirmations)
                  ├──> 3.7 (TrackSelector)
                  └──> 3.8 (Final Testing) ← CRITICAL
```

---

## Appendix: iOS Testing Checklist

### Keyboard Input Modals (Tasks 1.4, 1.5, 1.6, 3.5):
- [ ] Open modal
- [ ] Tap input field
- [ ] **VERIFY:** Input scrolls into view, not obscured by keyboard
- [ ] Type text
- [ ] Dismiss keyboard
- [ ] **VERIFY:** Modal returns to original position
- [ ] Rotate to landscape
- [ ] Tap input again
- [ ] **VERIFY:** Still works in landscape

### All Modals (ESC Key):
- [ ] Open modal in Safari on Mac
- [ ] Press ESC key
- [ ] **VERIFY:** Modal closes
- [ ] Repeat on iOS Simulator (external keyboard)

### All Modals (Z-Index):
- [ ] Open modal
- [ ] **VERIFY:** No content bleeding through from behind
- [ ] Open stacked modal (BandSettings → CreateInvite)
- [ ] **VERIFY:** Top modal is fully visible

### All Dropdowns:
- [ ] Open dropdown
- [ ] Tap outside
- [ ] **VERIFY:** Dropdown closes
- [ ] Open dropdown
- [ ] Press ESC
- [ ] **VERIFY:** Dropdown closes

---

**END OF UNIFIED IMPLEMENTATION PLAN**

**Ready to Start:** YES
**Next Task:** Task 1.1 - Create Z-Index Constants
**Estimated Completion:** 3 weeks from start date
**Risk Level:** MEDIUM (high value, high effort)
**Approval Required:** Review with team before beginning Week 1
