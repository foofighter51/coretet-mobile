# CoreTet Band - Codebase Cleanup Report
**Generated:** 2025-10-24
**Scope:** Comprehensive audit of unused files, old migrations, and cleanup opportunities

---

## Executive Summary

This report identifies cleanup opportunities across the CoreTet Band codebase:
- **Safe deletions identified:** 7 files (1 code file, 6 screenshots)
- **Clerk migration status:** Phase 1 complete, awaiting Phase 2
- **Console.log statements:** 288 occurrences across 29 files
- **TODO/FIXME markers:** 8 occurrences across 5 files
- **Old migration files:** 21 migration files reviewed, all currently needed

---

## 1. Unused/Old Files Identified

### A. Code Files

#### SAFE TO DELETE

1. **`/Users/exleymini/Apps/coretet-band/src/App.original.tsx`**
   - **Size:** 1,674 lines
   - **Status:** Unused backup file
   - **Justification:** Contains old app implementation using testAuthService. Current app uses Supabase Auth. Not imported anywhere.
   - **Impact:** SAFE - No active imports
   - **Recommendation:** DELETE

#### REQUIRES REVIEW (Potentially Dead Code)

2. **`/Users/exleymini/Apps/coretet-band/src/utils/testAuthService.ts`**
   - **Status:** Only imported by `App.original.tsx`
   - **Justification:** Test authentication service, likely obsolete
   - **Recommendation:** Review if still needed for testing, otherwise DELETE

3. **`/Users/exleymini/Apps/coretet-band/src/utils/mockAudioUpload.ts`**
   - **Status:** Only imported by `AudioUploader.tsx`
   - **Justification:** Mock service, may still be used for development
   - **Recommendation:** KEEP if used in dev mode, otherwise DELETE

4. **`/Users/exleymini/Apps/coretet-band/src/utils/feedbackReviewTool.ts`**
   - **Status:** Imported by `App.tsx` and self-referential
   - **Justification:** Feedback tools for internal review
   - **Recommendation:** KEEP - Used by admin/dev features

5. **`/Users/exleymini/Apps/coretet-band/src/utils/feedbackCLI.ts`**
   - **Status:** Self-referential, CLI tool
   - **Justification:** Command-line tool for feedback management
   - **Recommendation:** KEEP - Useful for development

---

## 2. Clerk → Supabase Migration Status

### Current State: **PHASE 1 COMPLETE**

Per `docs/eod-status/2025-10-21-clerk-cleanup.md`:

#### Completed (Phase 1)
- ✅ Deleted unused Clerk files:
  - `src/lib/clerk.ts`
  - `src/utils/clerkSupabaseSync.ts`
- ✅ Created migration `20251021_rename_clerk_to_current_user.sql`
- ✅ Function `current_user_id()` created with `clerk_user_id()` as backwards-compatible alias
- ✅ Removed Clerk keys from `.env.local`

#### Still Contains Clerk References (Phase 2 - Pending)

**Supabase Edge Functions - REQUIRE CLEANUP:**

1. **`/Users/exleymini/Apps/coretet-band/supabase/functions/_shared/clerk.ts`**
   - **Status:** OUTDATED - App uses Supabase Auth, not Clerk
   - **Used by:** `create-profile/index.ts`, `create-band/index.ts`
   - **Issue:** Functions reference Clerk JWT verification but app doesn't use Clerk
   - **Recommendation:** INVESTIGATE - These Edge Functions may be dead code if app doesn't call them

2. **`/Users/exleymini/Apps/coretet-band/supabase/functions/create-profile/index.ts`**
   - Imports `verifyClerkSession` from clerk.ts
   - **Recommendation:** Update to use Supabase Auth or DELETE if unused

3. **`/Users/exleymini/Apps/coretet-band/supabase/functions/create-band/index.ts`**
   - Imports `verifyClerkSession` from clerk.ts
   - **Recommendation:** Update to use Supabase Auth or DELETE if unused

**Migration Files - KEEP (Historical Record):**
- `supabase/migrations/001_clerk_rls_and_rename_to_bands.sql` (67 references to `clerk_user_id()`)
- `supabase/migrations/20251017_enable_tracks_rls_phase1.sql` (13 references)
- `supabase/migrations/20251016_add_comment_views.sql` (5 references)
- Note: These use `clerk_user_id()` which is now an alias for `current_user_id()`

### Recommendations for Phase 2

**Priority: MEDIUM** (After 7-day stability period)

1. Review if Edge Functions are actually called by the app
2. If unused, DELETE: `supabase/functions/create-profile/`, `create-band/`, `_shared/clerk.ts`
3. If used, UPDATE to use Supabase Auth instead of Clerk JWT verification
4. Create new migration to update RLS policies from `clerk_user_id()` to `current_user_id()`

---

## 3. Screenshots Cleanup

### Current State
- **Total screenshots:** 15 files across 4 directories
- **Total size:** ~4.5 MB

### Directory Breakdown

#### `/Users/exleymini/Apps/coretet-band/docs/screenshots/`
- `IMG_5729.PNG` (265 KB) - Oct 22
- `Screenshot 2025-10-22 at 12.28.34 PM.png` (255 KB) - Oct 22

#### `/Users/exleymini/Apps/coretet-band/docs/screenshots/simulator/`
- `Simulator Screenshot - iPhone 16 Pro - 2025-10-16 at 13.37.22.png` (273 KB) - Oct 16
- `simulator_screenshot_F9BFDEF6-A4F9-47C3-BCB2-D52CAE85E5B0.png` (150 KB) - Oct 17

#### `/Users/exleymini/Apps/coretet-band/docs/screenshots/testers/`
- `IMG_5730.PNG` (130 KB) - Oct 22
- `IMG_5731.PNG` (102 KB) - Oct 22
- `IMG_5732.PNG` (100 KB) - Oct 22
- `IMG_5733.PNG` (99 KB) - Oct 22
- `IMG_5735.PNG` (101 KB) - Oct 22
- `Screenshot 2025-10-22 at 4.30.07 PM.jpeg` (138 KB) - Oct 22

#### `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/`
- 5 simulator screenshots from Oct 7-8 (Oct 7: 17.07.13, 17.07.17, 17.07.40, 17.07.51, 17.07.53)

### Issues Cross-Referenced with Commits

**Resolved Issues (per git log):**
1. ✅ Band member content visibility - Fixed Oct 14 (commits: `83db1154`, `1435ab96`, `002f1980`, `dcd07e6b`)
2. ✅ Tab switching issues - Fixed Oct 13 (commit: `78cbb34c`)
3. ✅ Scroll drift - Fixed Oct 13 (commit: `78cbb34c`)
4. ✅ Comment indicators - Fixed Oct 13 (commit: `78cbb34c`)
5. ✅ Draggable scrubber - Added Oct 13 (commit: `577980a8`)
6. ✅ Email confirmation flow - Fixed Oct 22 (commits: `f6e664d8`, `69958a9a`, `d7b2060b`)
7. ✅ Profiles UUID migration - Fixed Oct 22 (commits: `85911649`, `20df6cb3`)

**Current Issues (per KNOWN_ISSUES.md and recent EOD):**
- iOS 18.6 simulator screenshot issues (Build 17) - Screenshots in `simulator/` may be related
- TestFlight Build 17-18 testing ongoing (Oct 22)

### Screenshot Cleanup Recommendations

#### SAFE TO DELETE (Resolved Issues - Pre-Build 17)

1. **`/docs/screenshots/ux-updates/` - ALL 5 FILES**
   - **Date:** Oct 7-8 (2+ weeks old)
   - **Justification:** UX updates from mid-October, issues resolved in subsequent commits
   - **Size saved:** ~950 KB
   - **Recommendation:** DELETE

#### KEEP (Active Testing & Recent Issues)

1. **`/docs/screenshots/testers/` - ALL 6 FILES**
   - **Date:** Oct 22 (same day as Build 17-18 fixes)
   - **Justification:** Related to current TestFlight testing, may reference active issues
   - **Recommendation:** KEEP until Build 18 is confirmed stable

2. **`/docs/screenshots/simulator/` - BOTH FILES**
   - **Date:** Oct 16-17
   - **Justification:** Related to iOS 18.6 simulator known issue (per KNOWN_ISSUES.md)
   - **Recommendation:** KEEP for documentation of known issue

3. **`/docs/screenshots/` root - 2 FILES**
   - **Date:** Oct 22
   - **Justification:** Recent, likely related to Build 17-18 testing
   - **Recommendation:** KEEP for now

---

## 4. Key Directories Audit

### `/Users/exleymini/Apps/coretet-band/src/components/`

**Structure:**
- `atoms/` - 3 components (Button, Text, LoadingSpinner, Spinner)
- `molecules/` - 16 components
- `screens/` - 11 screens
- `ui/` - 1 component (LoadingState)

**Analysis:**
- All components appear to be actively used
- No obvious dead code detected
- Minor duplication: `LoadingSpinner.tsx` (atoms) vs `Spinner.tsx` (atoms) vs `LoadingState.tsx` (ui)
  - **Recommendation:** Review if all three are needed

### `/Users/exleymini/Apps/coretet-band/src/utils/`

**14 utility files identified:**
1. `phoneNumber.ts` - Used
2. `rateLimiter.ts` - Used
3. `testAuthService.ts` - QUESTIONABLE (see Section 1)
4. `errorMessages.ts` - Used
5. `authErrorHandler.ts` - Used
6. `userAccessService.ts` - Used
7. `audioPlayerManager.ts` - Used
8. `audioProcessor.ts` - Used
9. `deepLinkHandler.ts` - Used
10. `mockAudioUpload.ts` - QUESTIONABLE (see Section 1)
11. `nativeFilePicker.ts` - Used
12. `feedbackReviewTool.ts` - Used (admin)
13. `feedbackCLI.ts` - Used (CLI)
14. `audioUploadService.ts` - Used

**Recommendation:** Review testAuthService.ts and mockAudioUpload.ts usage

### `/Users/exleymini/Apps/coretet-band/supabase/migrations/`

**21 migration files:**
- All appear to be part of migration history
- Multiple UUID migration attempts in Oct 22 (4 files) suggest some failed attempts
  - `20251022_fix_profiles_id_type.sql`
  - `20251022_fix_profiles_id_type_complete.sql`
  - `20251022_fix_profiles_id_uuid_with_policies.sql`
  - `20251022_uuid_migration_final.sql`

**Recommendation:**
- KEEP all migration files (historical record)
- Consider consolidating future migrations to avoid multiple attempts

### `/Users/exleymini/Apps/coretet-band/docs/`

**60 documentation files** - Breakdown:
- EOD status files: 23 files in `eod-status/`
- Security docs: Multiple in `security/`
- Planning docs: ~20 files (PHASE_3A, PHASE_3B, CLEANUP, etc.)
- Issue documentation: Multiple (BAND_MEMBER_CONTENT_FIX, etc.)

**Old/Redundant Documentation:**
1. `CLERK-SUPABASE-SETUP.md` - Outdated, app uses Supabase Auth only
2. `CLERK-JWT-CLAIMS.json` - Outdated
3. `NEXT-STEPS-JWT-SETUP.md` - Outdated
4. `EDGE_FUNCTIONS_*` files - May be outdated if Edge Functions aren't used
5. Multiple PHASE_3B files - Check if consolidated

**Recommendation:**
- Archive old Clerk documentation to `docs/archive/clerk-migration/`
- Consolidate redundant PHASE_3B docs
- Keep EOD status files (valuable history)

---

## 5. Code Quality Issues

### Console.log Statements
- **Total:** 288 occurrences across 29 files
- **Impact:** Potential PII leakage in production
- **Files with most logs:**
  - `src/components/screens/MainDashboard.tsx` (50)
  - `src/contexts/BandContext.tsx` (1)
  - `src/contexts/PlaylistContext.tsx` (10)
  - `src/utils/audioUploadService.ts` (8)

**Recommendation:** Remove debug console.log statements, keep only error logging

### TODO/FIXME Markers
- **Total:** 8 occurrences across 5 files
- **Files:**
  - `src/App.original.tsx` (2)
  - `src/App.tsx` (2)
  - `src/components/screens/MainDashboard.tsx` (1)
  - `src/components/molecules/BandModal.tsx` (2)
  - `src/utils/phoneNumber.ts` (1)

**Recommendation:** Review and address or remove TODO markers

### TypeScript Files
- **Total active files:** 70
- **Build status:** ✅ Builds successfully
- **Warnings:** Dynamic import warning for `lib/supabase.ts` (not critical)

---

## 6. Safe Deletions Summary

### Files Safe to Delete Now

#### Code Files (1)
1. `/Users/exleymini/Apps/coretet-band/src/App.original.tsx` - Unused backup

#### Screenshots (5)
1. `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/Simulator Screenshot - iPhone 16 Pro - 2025-10-07 at 17.07.13.png`
2. `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/Simulator Screenshot - iPhone 16 Pro - 2025-10-07 at 17.07.17.png`
3. `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/Simulator Screenshot - iPhone 16 Pro - 2025-10-07 at 17.07.40.png`
4. `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/Simulator Screenshot - iPhone 16 Pro - 2025-10-07 at 17.07.51.png`
5. `/Users/exleymini/Apps/coretet-band/docs/screenshots/ux-updates/Simulator Screenshot - iPhone 16 Pro - 2025-10-07 at 17.07.53.png`

**Total files:** 6
**Space saved:** ~2 MB

### Files Requiring Manual Review

#### Code Files (3)
1. `/Users/exleymini/Apps/coretet-band/src/utils/testAuthService.ts`
2. `/Users/exleymini/Apps/coretet-band/src/utils/mockAudioUpload.ts`
3. `/Users/exleymini/Apps/coretet-band/supabase/functions/_shared/clerk.ts` + related Edge Functions

#### Documentation (5)
1. `docs/CLERK-SUPABASE-SETUP.md`
2. `docs/CLERK-JWT-CLAIMS.json`
3. `docs/NEXT-STEPS-JWT-SETUP.md`
4. `docs/EDGE_FUNCTIONS_IMPLEMENTATION.md`
5. `docs/EDGE_FUNCTIONS_QUICK_START.md`

---

## 7. Action Plan

### Immediate Actions (Safe - No Risk)

1. ✅ Delete `src/App.original.tsx`
2. ✅ Delete 5 screenshots from `docs/screenshots/ux-updates/`
3. Create `docs/archive/` directory structure
4. Move old Clerk docs to archive

### Short-Term Actions (1-2 weeks)

1. Review and remove debug console.log statements (288 occurrences)
2. Address TODO/FIXME markers (8 occurrences)
3. Investigate Edge Functions usage (Clerk-related)
4. Review `testAuthService.ts` and `mockAudioUpload.ts` necessity

### Medium-Term Actions (1 month)

1. Complete Clerk Migration Phase 2:
   - Update or delete Edge Functions
   - Update RLS policies to use `current_user_id()`
   - Remove `clerk_user_id()` alias after stability period
2. Consolidate loading components (LoadingSpinner vs Spinner vs LoadingState)
3. Review and clean up old PHASE_3B documentation

### Ongoing Maintenance

1. Clean up screenshots after each build is confirmed stable
2. Remove test screenshots older than 30 days
3. Archive EOD status files older than 90 days
4. Regular console.log audits

---

## 8. Risk Assessment

| Action | Risk Level | Impact | Reversible |
|--------|-----------|---------|------------|
| Delete App.original.tsx | 🟢 NONE | Low | Yes (git) |
| Delete old screenshots | 🟢 NONE | Low | Yes (git) |
| Archive old docs | 🟢 NONE | Low | Yes (move back) |
| Delete Edge Functions | 🟡 LOW | Medium | Yes (git) |
| Remove console.logs | 🟢 NONE | Low | Yes (git) |
| Update RLS policies | 🟡 LOW | High | Yes (rollback migration) |

---

## 9. Summary Statistics

### Current Codebase Health

- **Code Files:** 70 TypeScript files
- **Components:** 31 React components
- **Utilities:** 14 utility files
- **Migrations:** 21 migration files
- **Documentation:** 60+ markdown files
- **Screenshots:** 15 files (~4.5 MB)

### Cleanup Potential

- **Immediate deletions:** 6 files (~2 MB)
- **Console.log cleanup:** 288 statements across 29 files
- **Dead code candidates:** 3-5 files (requires investigation)
- **Documentation to archive:** 5+ files

### Build Health

- ✅ Project builds successfully
- ✅ No critical errors
- ⚠️ 1 dynamic import warning (non-critical)
- ⚠️ Large bundle size (683 KB main chunk)

---

## 10. Recommendations Priority

### HIGH Priority
1. Delete safe files (App.original.tsx + old screenshots)
2. Investigate Clerk Edge Functions usage

### MEDIUM Priority
1. Remove debug console.log statements
2. Complete Clerk Migration Phase 2
3. Archive old Clerk documentation

### LOW Priority
1. Address TODO/FIXME markers
2. Consolidate loading components
3. Review mockAudioUpload.ts necessity
4. Cleanup old Phase 3B docs

---

**Report Generated:** 2025-10-24
**Next Review:** After Build 18 stability confirmed (7+ days)
