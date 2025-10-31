# CoreTet Implementation Action Plan
**Based on:** concept_updates_251024.md
**Created:** 2025-10-24
**Current Build:** 18 (TestFlight)

## Overview

This document breaks down the concept_updates roadmap into actionable, sequential tasks prioritized by:
1. **Critical fixes** for current app experience
2. **Quick wins** that improve user understanding
3. **New features** that add strategic value

---

## Phase 1: Foundation Fixes (WEEKS 1-2) - PRIORITY: CRITICAL

### Task 1.1: Empty States (Priority: CRITICAL - Affects First Impression)
**Why First:** New users see blank screens immediately. This is a conversion killer.

**Files to Modify:**
- `src/components/screens/MainDashboard.tsx`

**Implementation Steps:**
1. Audit each tab's empty state rendering
2. Create EmptyState component (reusable)
3. Add contextual CTAs:
   - Tracks tab: "Upload your first demo" button
   - Playlists tab: "Create a playlist" button
   - Bands tab: "Start a band" OR check for pending invites
4. Use existing button styles (designTokens.colors.primary.blue)

**Success Criteria:**
- All 4 tabs show helpful empty states
- CTAs actually trigger respective actions
- Empty states disappear once user has content

**Estimated Time:** 4-6 hours
**Risk:** Low - purely additive

---

### Task 1.2: Context Clarity (Priority: HIGH - Reduces User Confusion)
**Why Second:** Users are confused about personal vs band uploads RIGHT NOW.

**Files to Modify:**
- `src/components/screens/MainDashboard.tsx` (header)
- `src/components/molecules/AudioUploader.tsx` (upload context display)
- `src/contexts/BandContext.tsx` (verify context state)

**Implementation Steps:**
1. Add persistent context indicator in header:
   - Show band name/initials OR "Personal"
   - Use band color or user avatar
2. In AudioUploader, add: "Uploading to: [Context Name]"
3. Visual differentiation in track list:
   - Band tracks: show band initials badge
   - Personal tracks: show user avatar badge

**Success Criteria:**
- User always knows their current context
- Context is visible BEFORE upload starts
- Band switching still works
- No breaking changes to BandContext

**Estimated Time:** 6-8 hours
**Risk:** Medium - touches context management

---

### Task 1.3: Loading States & Console Log Cleanup (Priority: HIGH - User Feedback)
**Why Third:** Users don't know what's happening during async operations.

**Part A: Console Log Audit**

**Files to Audit:** All `.ts` and `.tsx` files

**Implementation Steps:**
1. Search for all console.log statements (288 identified)
2. Categorize:
   - Debug logs → DELETE
   - Error logs → Convert to user-facing error messages
   - State change logs → Convert to loading indicators
3. Remove all console.logs with PII (user IDs, emails, tokens)

**Part B: Loading States**

**Files to Modify:**
- `src/components/screens/MainDashboard.tsx` (track list loading)
- `src/utils/audioUploadService.ts` (upload progress)
- `src/components/molecules/TrackDetailModal.tsx` (track details loading)
- `src/components/molecules/BandMembers.tsx` (member list loading)

**Implementation Steps:**
1. Add IonSpinner for lists loading
2. Add IonProgressBar for uploads (show percentage)
3. Add skeleton screens for track list
4. Preserve all error boundaries

**Success Criteria:**
- No more silent loading (user always has feedback)
- Upload progress shows percentage
- Zero console.logs in production build
- Error messages are user-friendly

**Estimated Time:** 8-10 hours
**Risk:** Low - mostly additive

---

### Task 1.4: Onboarding Flow Enhancement (Priority: MEDIUM - Better Activation)
**Why Fourth:** Improves activation but doesn't fix broken UX.

**Files to Modify:**
- `src/components/screens/OnboardingScreen.tsx`

**Implementation Steps:**
1. Map current onboarding dependencies
2. Create 3-screen intro AFTER name entry:
   - Screen 1: "Your private space" + band icon
   - Screen 2: "Timestamped feedback" + waveform
   - Screen 3: "Music stays private" + lock icon
3. Add skip button
4. Track completion in localStorage: `onboarding_completed`
5. Ensure existing users bypass this

**Success Criteria:**
- New users see value proposition
- Existing users don't see intro again
- Can skip without breaking flow
- Profile creation still works

**Estimated Time:** 6-8 hours
**Risk:** Low - isolated to onboarding

---

## Phase 1 Summary

**Total Estimated Time:** 24-32 hours (3-4 days focused work)
**Build Target:** Build 19
**Testing Required:** Full signup → upload → feedback flow

**Before Starting Phase 1:**
- ✅ Commit all Phase 1 changes to feature branch
- ✅ Test on actual iOS device (not just simulator)
- ✅ Get user feedback before proceeding to Phase 2

---

## Phase 2: The 2-Minute Magic (WEEKS 3-4) - PRIORITY: STRATEGIC

### Task 2.1: Phone Recording Feature (Priority: HIGH - Removes Friction)

**Research Phase (2-3 hours):**
- Test Capacitor audio recording capabilities
- Check `@capacitor/media` or need for separate plugin
- Verify iOS permissions (microphone access)

**Files to Create:**
- `src/components/molecules/AudioRecorder.tsx`
- `src/utils/audioRecorderService.ts`

**Files to Modify:**
- `src/components/screens/MainDashboard.tsx` (add record button)

**Implementation Steps:**
1. Add microphone permission to iOS config
2. Create AudioRecorder component with:
   - Record/stop button
   - Live waveform visualization
   - Timer (auto-stop at 10 minutes)
   - Compression for upload limits
3. Save to device, then upload
4. Handle app backgrounding (save recording state)

**Success Criteria:**
- Can record directly in app
- Recording survives app background
- Auto-uploads to current band context
- Compressed appropriately (< 100MB)

**Estimated Time:** 12-16 hours
**Risk:** High - requires hardware testing, may need fallback

---

### Task 2.2: Version Control Foundation (Priority: MEDIUM - Strategic Value)

**Database Changes Required:**
- Add `parent_track_id` UUID to tracks table
- Add `version_number` INTEGER to tracks
- Add `version_notes` TEXT to tracks

**Migration File:**
- `supabase/migrations/20251024_add_version_control.sql`

**Files to Modify:**
- `src/components/molecules/TrackDetailModal.tsx` (show version history)
- `lib/supabase.ts` (add version creation helper)

**Implementation Steps:**
1. Create migration (non-breaking - nullable fields)
2. Add "Create New Version" button in TrackDetailModal
3. Show version timeline
4. Preserve all comments/ratings per version

**Success Criteria:**
- Can create versions without breaking existing tracks
- Version history visible in UI
- Comments stay with correct version

**Estimated Time:** 10-12 hours
**Risk:** Medium - requires migration testing

---

### Task 2.3: AI Audio Analysis (Priority: LOW - Nice to Have)

**Status:** DEFERRED to Phase 3
**Reason:** Requires API research and potential costs. Focus on core UX first.

---

## Phase 2 Summary

**Total Estimated Time:** 22-28 hours (3-4 days)
**Build Target:** Build 20
**Critical:** Test recording on ACTUAL iOS device, not simulator

---

## Phase 3: Lock-in Value (MONTH 2) - PRIORITY: GROWTH

### Not Prioritized Yet
Phase 3 features (Archive Mode, Full Version Control, AI Pattern Matching) should be evaluated after Phase 1 & 2 user feedback.

---

## Phase 4: Distribution (MONTH 3) - PRIORITY: MONETIZATION

### Not Prioritized Yet
DAW plugins and Pro tier require Phase 1-3 foundation and user validation.

---

## Immediate Next Steps (THIS WEEK)

### Priority Order:
1. **Task 1.1: Empty States** (4-6 hours) - MUST DO
2. **Task 1.2: Context Clarity** (6-8 hours) - MUST DO
3. **Task 1.3A: Console Log Cleanup** (4-6 hours) - SHOULD DO
4. **Task 1.3B: Loading States** (4-6 hours) - SHOULD DO

**Goal:** Ship Build 19 with Empty States + Context Clarity by end of week

---

## Implementation Guidelines (From Concept Doc)

### Never Implement ❌
- Public feeds or discovery
- Play counts or engagement metrics
- Social sharing
- Gamification/streaks
- Infinite scroll

### Always Preserve ✅
- Private band spaces
- Existing user data
- RLS policies
- Backward compatibility

---

## Testing Checklist (Before Each Build)

**Core Flows Must Work:**
1. ✅ Sign up → Email confirm → Onboarding → Dashboard
2. ✅ Create band → Invite member → Member accepts
3. ✅ Upload track → Add comment → View comment
4. ✅ Switch band context → Upload to band
5. ✅ Create playlist → Add tracks → Share playlist

**Regression Testing:**
- No console errors in production
- RLS policies still enforcing privacy
- File upload limits respected
- Deep links working (email confirm, invites, playlists)

---

## Success Metrics (From Concept Doc)

### Measure These ✅
- Bands uploading weekly (healthy collaboration)
- Time from sign-up to first upload (activation)
- Multi-band users (product-market fit)

### Don't Measure These ❌
- Daily active users
- Session duration
- Number of comments per track
- Upload frequency pressure

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-10-24 | Prioritize Empty States first | New users see blank screens immediately - conversion killer |
| 2025-10-24 | Defer AI analysis to Phase 3 | Requires API costs + research, core UX more important |
| 2025-10-24 | Move console log cleanup into Phase 1 | 288 logs with PII = security risk |

---

## Notes for Claude Agents

When implementing these tasks:

1. **Always read the concept doc context** before making changes
2. **Never break existing functionality** - add, don't replace
3. **Test on actual iOS device** for hardware features (recording, deep links)
4. **Use existing design patterns** - don't create new component styles
5. **Preserve RLS policies** - privacy is core to the app
6. **Document all database migrations** before running them
7. **Get explicit approval** before implementing monetization features

---

## Current Status

- **Build:** 18 (TestFlight)
- **Phase:** 0 (Foundation Complete)
- **Next Task:** Task 1.1 - Empty States
- **Blockers:** None
- **Ready to Start:** Yes

---

*This document will be updated as tasks are completed.*
