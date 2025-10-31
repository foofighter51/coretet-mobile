# Tab Redesign: 3 Tabs → 2 Tabs
**Date:** 2025-10-24
**Priority:** CRITICAL (Must do before Phase 1 tasks)
**Rationale:** Profile as main tab wastes navigation space. Settings should be accessible via icon/menu.

---

## Current Structure (3 Tabs)

| Tab | Icon | Content |
|-----|------|---------|
| **Band** | Music | Band context tracks, playlists, band management |
| **Personal** | User | Personal tracks, personal playlists |
| **Profile** | Users | User info (name/email/phone), Tutorial button, Sign Out button |

**Problem:** Profile tab is just a settings menu. It's not a primary use case.

---

## Proposed Structure (2 Tabs + Settings Icon)

### New Tab Bar

| Tab | Icon | Content |
|-----|------|---------|
| **Band** | Music | Band context: tracks, playlists, band settings |
| **Personal** | User | Personal tracks, playlists |

### Settings Icon in Header
- Add Settings gear icon to top-right header
- Opens a modal/sheet with:
  - User profile info (name, email, phone)
  - "How to Use CoreTet" button
  - Sign Out button
  - Future: App preferences, notifications, etc.

---

## Implementation Plan

### Task 1: Create Settings Modal Component
**Priority:** HIGH
**Estimated Time:** 2-3 hours

**New File:** `src/components/molecules/SettingsModal.tsx`

**Content:**
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onShowTutorial: () => void;
  onSignOut: () => void;
}
```

**Features:**
- Modal overlay (click outside to close)
- User info section (name, email, phone)
- Tutorial button
- Sign Out button (red/destructive color)
- Clean, minimal design matching existing modals

**Success Criteria:**
- Reuses existing Profile tab UI/styling
- Accessible via keyboard (ESC to close)
- Mobile-friendly (full height on small screens)

---

### Task 2: Update TabBar Component
**Priority:** HIGH
**Estimated Time:** 1 hour

**File to Modify:** `src/components/molecules/TabBar.tsx`

**Changes:**
```typescript
// BEFORE
const tabs: TabItem[] = [
  { id: 'band', label: 'Band', icon: Music },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'profile', label: 'Profile', icon: Users }  // ❌ REMOVE
];

// AFTER
const tabs: TabItem[] = [
  { id: 'band', label: 'Band', icon: Music },
  { id: 'personal', label: 'Personal', icon: User },
];
```

**Success Criteria:**
- Tab bar shows only 2 tabs
- Icons are centered (more space per tab)
- Active state still works
- No visual regressions

---

### Task 3: Update Type Definitions
**Priority:** HIGH
**Estimated Time:** 15 minutes

**File to Modify:** `src/types/index.ts`

**Changes:**
```typescript
// BEFORE
export type TabId = 'band' | 'personal' | 'profile';

// AFTER
export type TabId = 'band' | 'personal';
```

**Files to Check for Type Errors:**
- `src/components/screens/MainDashboard.tsx`
- `src/components/molecules/TabBar.tsx`

**Success Criteria:**
- No TypeScript errors
- Build succeeds

---

### Task 4: Add Settings Icon to Header
**Priority:** HIGH
**Estimated Time:** 2 hours

**File to Modify:** `src/components/screens/MainDashboard.tsx`

**Location:** Inside the header div (around line 2398-2450)

**Changes:**
1. Import Settings icon from lucide-react
2. Add state: `const [showSettings, setShowSettings] = useState(false);`
3. Add Settings button in top-right of header
4. Render SettingsModal component when `showSettings === true`

**Header Structure:**
```
┌─────────────────────────────────────┐
│  [Back]  CoreTet  [Upload] [Settings] │  ← Header
├─────────────────────────────────────┤
│  Band Tab | Personal Tab            │  ← Tab Bar (2 tabs)
└─────────────────────────────────────┘
```

**Success Criteria:**
- Settings icon visible in all contexts (Band/Personal tabs)
- Tapping opens SettingsModal
- Modal can be closed by:
  - X button in modal
  - Clicking outside
  - ESC key
- Sign out still works
- Tutorial still works

---

### Task 5: Remove Profile Tab Content
**Priority:** HIGH
**Estimated Time:** 30 minutes

**File to Modify:** `src/components/screens/MainDashboard.tsx`

**Changes:**
1. Remove `case 'profile':` switch case (lines 2252-2388)
2. Remove any Profile-tab-specific state
3. Update `activeTab` default value if needed

**Success Criteria:**
- No dead code remains
- No references to 'profile' tab ID
- Build succeeds with no warnings

---

### Task 6: Update Default Tab Logic
**Priority:** MEDIUM
**Estimated Time:** 30 minutes

**File to Modify:** `src/components/screens/MainDashboard.tsx`

**Current Logic:** `const [activeTab, setActiveTab] = useState<TabId>('band');`

**Consideration:**
- Should default to 'band' if user has a current band
- Should default to 'personal' if user has no bands
- Check BandContext for currentBand state

**Success Criteria:**
- Smart default based on user context
- First-time users see relevant content immediately

---

## Testing Checklist

### Visual Testing
- [ ] Tab bar shows only 2 tabs (Band, Personal)
- [ ] Settings icon appears in header
- [ ] Settings icon is visible on both tabs
- [ ] Settings modal opens and closes smoothly
- [ ] User info displays correctly in settings modal
- [ ] Tutorial button works from settings modal
- [ ] Sign out button works from settings modal

### Functional Testing
- [ ] Switching between Band and Personal tabs works
- [ ] Active tab indicator updates correctly
- [ ] Settings modal doesn't break tab navigation
- [ ] Deep links still work (band invites, playlist shares)
- [ ] Tutorial modal works
- [ ] Sign out still works

### Regression Testing
- [ ] Upload functionality unchanged
- [ ] Playback functionality unchanged
- [ ] Comments still work
- [ ] Playlist creation/sharing still works
- [ ] Band creation still works

---

## Migration Considerations

### User Impact
**Who's Affected:** All existing users

**Breaking Changes:** None (profile content moved, not removed)

**User Communication:**
- No announcement needed (UI is self-explanatory)
- Settings icon in header is standard mobile pattern

### Data Impact
**Database:** No changes required

**Local Storage:** No changes required

**User Preferences:** None stored for active tab

---

## Rollback Plan

If issues arise:
1. Revert commits (git revert)
2. Restore 3-tab structure
3. Test thoroughly before re-attempting

**Git Strategy:**
- Create feature branch: `feature/tab-redesign-2-tabs`
- Commit each task separately
- Test between commits
- Merge only when fully tested

---

## Success Metrics

### Immediate (After Deploy)
- Zero user complaints about missing Profile tab
- Zero navigation errors in console
- Settings modal adoption > 80% of previous Profile tab usage

### Long-term (1 Week)
- Reduced confusion about navigation (qualitative)
- More screen real estate for content
- Foundation for cleaner UX improvements in Phase 1

---

## Dependencies

### Before Starting
- ✅ Build 18 deployed to TestFlight
- ✅ Current codebase stable
- ✅ No outstanding critical bugs

### Blockers
- None identified

---

## Next Steps

1. **Immediate:** Start with Task 1 (Create SettingsModal component)
2. **Then:** Tasks 2-3 in sequence (update types and TabBar)
3. **Then:** Task 4 (add Settings icon to header)
4. **Finally:** Tasks 5-6 (cleanup and polish)

**Estimated Total Time:** 6-8 hours (1 day focused work)

**Target Build:** 19 (includes this + Phase 1 Task 1.1 Empty States)

---

## Additional Considerations

### Future Enhancements (Post-2-Tab Migration)
- Settings modal could expand to include:
  - Notification preferences
  - Audio quality settings
  - Theme preferences (light/dark)
  - Account management (change email, phone)

### Design Consistency
- Settings modal should match existing modal patterns:
  - TrackDetailModal
  - BandModal
  - PlaylistModal
- Use same close button style
- Use same overlay darkness
- Use same animation (slide up from bottom)

---

*Ready to implement. Start with Task 1.*
