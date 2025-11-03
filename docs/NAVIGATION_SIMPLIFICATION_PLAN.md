# Navigation Simplification Plan
**Date:** 2025-11-03
**Goal:** Remove Band/Personal split, simplify to single-band-first experience

---

## Current State Analysis

### Current Implementation:
- **Two Tabs:** `[Band] [Personal]`
- **Band Tab:** Shows tracks from currently selected band (from dropdown)
- **Personal Tab:** Shows tracks with `band_id = null` (user's personal workspace)
- **Band Switcher:** Dropdown in header to switch between bands
- **Database:** `is_personal` boolean on bands table (currently unused in UI)

### Problems:
1. **Confusing mental model:** "Band" vs "Personal" is arbitrary
2. **Hidden band list:** Users don't see all their bands upfront
3. **Over-engineered for 1-band users:** Most users only have 1 band initially
4. **Personal = null band_id:** Should just be another band (marked `is_personal: true`)

---

## Proposed Solution

### New Mental Model:
> **Everything is a band. Your personal workspace is just your first band.**

### New Navigation:
```
Bottom Nav:
[Home] [Bands] [Upload] [Profile]

HOME TAB:
- If user has 1 band → Show that band's tracks
- If user has multiple bands → Show combined recent activity feed
- Quick upload button (top right)
- Band name in header (tap to switch if multiple)

BANDS TAB:
- List of all user's bands (including personal)
- Each shows: name, member count, recent activity
- Tap band → View band's tracks
- "Create New Band" button at bottom

UPLOAD TAB (or Floating Action Button):
- Record voice memo (primary)
- Select file (secondary)
- Auto-uploads to current/selected band

PROFILE TAB:
- User settings
- Tutorial
- Replay intro
- Sign out
```

---

## Implementation Steps

### Phase 1: Backend Changes (Minimal)

**1.1 Ensure Personal Workspace is a Band**
- On user signup, auto-create a band with `is_personal: true`
- Name it: "[User's Name]'s Workspace" or just "Personal"
- This replaces the concept of `band_id = null` tracks

**1.2 Migration for Existing Users**
- Find all users with tracks where `band_id = null`
- For each user, create a personal band (if not exists)
- Update those tracks to reference the personal band
- This is a one-time migration

**Database Migration:**
```sql
-- For each user with null band_id tracks
DO $$
DECLARE
  user_record RECORD;
  personal_band_id UUID;
BEGIN
  FOR user_record IN
    SELECT DISTINCT user_id FROM tracks WHERE band_id IS NULL
  LOOP
    -- Check if user already has a personal band
    SELECT id INTO personal_band_id
    FROM bands
    WHERE created_by = user_record.user_id AND is_personal = true
    LIMIT 1;

    -- If not, create one
    IF personal_band_id IS NULL THEN
      INSERT INTO bands (name, created_by, is_personal)
      VALUES (
        (SELECT name || '''s Workspace' FROM profiles WHERE id = user_record.user_id),
        user_record.user_id,
        true
      )
      RETURNING id INTO personal_band_id;

      -- Add user as owner
      INSERT INTO band_members (band_id, user_id, role)
      VALUES (personal_band_id, user_record.user_id, 'owner');
    END IF;

    -- Update tracks to reference personal band
    UPDATE tracks
    SET band_id = personal_band_id
    WHERE user_id = user_record.user_id AND band_id IS NULL;
  END LOOP;
END $$;
```

---

### Phase 2: UI Changes (Major)

**2.1 Remove Band/Personal Tab Split**

**Files to Modify:**
- `src/types/index.ts` - Update `TabId` type
- `src/components/molecules/TabBar.tsx` - New tab structure
- `src/components/screens/MainDashboard.tsx` - Complete navigation overhaul

**Old TabId:**
```typescript
export type TabId = 'band' | 'personal';
```

**New TabId:**
```typescript
export type TabId = 'home' | 'bands' | 'profile';
// 'upload' might be a modal/FAB instead of tab
```

**2.2 Create New Home Tab**

**Logic:**
```typescript
const HomeTab = () => {
  const { userBands, currentBand } = useBand();

  if (userBands.length === 1) {
    // Single band user - show their tracks
    return <BandTracksView band={currentBand} />;
  }

  if (userBands.length > 1) {
    // Multi-band user - show activity feed
    return <ActivityFeedView />;
  }

  // New user - empty state
  return <EmptyState
    icon={<Music />}
    title="Welcome to CoreTet"
    description="Create a band to get started"
    action={<CreateBandButton />}
  />;
};
```

**2.3 Create New Bands Tab**

**UI:**
```
┌─────────────────────────┐
│ Bands                   │
├─────────────────────────┤
│ 🎵 My Workspace    (You)│
│ 3 tracks • Active       │
├─────────────────────────┤
│ 👥 Bedeker        5 members│
│ 12 tracks • 2 new       │
├─────────────────────────┤
│ 👥 Weekend Project  (You)│
│ 1 track • Quiet         │
├─────────────────────────┤
│                         │
│ [+ Create New Band]     │
└─────────────────────────┘
```

**Component:**
```typescript
const BandsTab = () => {
  const { userBands } = useBand();

  return (
    <div>
      <h2>Bands</h2>
      {userBands.map(band => (
        <BandCard
          key={band.id}
          band={band}
          onClick={() => navigateToBand(band.id)}
        />
      ))}
      <CreateBandButton />
    </div>
  );
};
```

**2.4 Update Upload Flow**

**Current:** Upload button checks if `activeTab === 'band'` ? use currentBand : use null
**New:** Upload always goes to currently selected band (from context)

**Option 1: Upload as Tab**
```typescript
const UploadTab = () => {
  return (
    <div>
      <h3>Upload to: {currentBand.name}</h3>
      <RecordVoiceMemo />  {/* Primary */}
      <SelectAudioFile />  {/* Secondary */}
    </div>
  );
};
```

**Option 2: Upload as Floating Action Button (Recommended)**
- Tap FAB → Bottom sheet modal
- Shows: Record button (big) + File picker (small)
- Auto-uploads to current band
- Dismisses on complete

**2.5 Update Profile Tab**

**Move Settings Here:**
- User info
- Tutorial
- Replay intro
- Sign out
- App version/about

---

### Phase 3: UX Polish

**3.1 Band Switcher (for multi-band users)**

**Location:** Top of Home tab (if user has multiple bands)

```
┌─────────────────────────┐
│ ▼ Bedeker          🔔   │ ← Tap to switch
└─────────────────────────┘
```

**Interaction:**
- Tap → Bottom sheet with band list
- Select band → Switches context, updates Home view
- Persists in localStorage

**3.2 First-Time User Flow**

1. User completes onboarding (name + 3-screen intro)
2. Lands on Home tab (empty state)
3. Empty state: "Create your first band to get started"
4. Tap button → Create personal workspace automatically
5. Named: "[User's Name]'s Workspace"
6. Home now shows empty band with upload CTA

**Alternative (Auto-create personal band):**
- On signup, automatically create personal workspace
- User lands directly in their workspace
- Can create more bands later from Bands tab

**3.3 Empty States by Tab**

**Home Tab:**
- No bands: "Create a band to get started"
- Has band, no tracks: "Upload your first track"
- Has tracks: Show tracks

**Bands Tab:**
- Always shows create button
- Empty: "You're not in any bands yet"

**Profile Tab:**
- Always shows user info + settings

---

## Migration Impact Analysis

### For Existing Users:

**Single-Band Users (Most Users):**
- ✅ No change - still see their one band's tracks
- ✅ Home tab shows same content as before
- ✅ Can create more bands from Bands tab

**Multi-Band Users:**
- ⚠️ Change - Band/Personal tabs become Home/Bands/Profile
- ⚠️ Need to tap into Bands tab to switch
- ✅ Activity feed on Home shows recent from all bands

**Users with "Personal" Tracks (band_id = null):**
- ✅ Migration auto-creates personal band
- ✅ All personal tracks now in "[Name]'s Workspace" band
- ✅ No data loss, just reorg

### Database Impact:

**Required Migration:**
1. Create personal bands for users with null band_id tracks
2. Update tracks.band_id to reference personal band
3. Ensure all users have at least one band (personal)

**No Breaking Changes:**
- `is_personal` column already exists
- Just need to populate it
- Tracks table unchanged (except null → UUID migration)

---

## Code Changes Estimate

### Phase 1: Backend (4-6 hours)
- [ ] Write migration script (2 hours)
- [ ] Test migration on development data (1 hour)
- [ ] Update db.ts helper functions (1 hour)
- [ ] Add personal band auto-creation on signup (1 hour)

### Phase 2: UI Overhaul (16-20 hours)
- [ ] Update TabBar component (2 hours)
- [ ] Create new Home tab logic (4 hours)
- [ ] Create Bands list tab (3 hours)
- [ ] Update Profile tab (2 hours)
- [ ] Refactor upload flow (3 hours)
- [ ] Update band switcher UI (2 hours)
- [ ] Update all empty states (2 hours)
- [ ] Testing across scenarios (2 hours)

### Phase 3: Polish (4-6 hours)
- [ ] Activity feed view (if multi-band) (3 hours)
- [ ] Floating Action Button for upload (2 hours)
- [ ] Animations/transitions (1 hour)

**Total: 24-32 hours**

---

## Testing Checklist

### Scenarios to Test:

**New User:**
- [ ] Sign up → Personal band auto-created
- [ ] Home shows empty workspace
- [ ] Can upload to personal band
- [ ] Can create additional band

**Existing Single-Band User:**
- [ ] Migration creates personal band for null tracks
- [ ] Home shows band tracks (no change to UX)
- [ ] Can create new band from Bands tab

**Existing Multi-Band User:**
- [ ] All bands visible in Bands tab
- [ ] Can switch between bands
- [ ] Home shows activity feed
- [ ] Upload goes to currently selected band

**Edge Cases:**
- [ ] User with no bands (shouldn't happen after migration)
- [ ] User invited to band (doesn't have personal yet)
- [ ] Band owner deleting band
- [ ] Last band member leaving band

---

## Rollback Plan

**If navigation change is problematic:**
1. Git revert to before UI changes
2. Keep backend migration (personal bands are fine)
3. Fall back to Band/Personal tabs
4. No data loss (personal bands just become "Personal" tab content)

**Database Migration Rollback:**
```sql
-- If needed, can set band_id back to null for personal bands
UPDATE tracks
SET band_id = NULL
WHERE band_id IN (
  SELECT id FROM bands WHERE is_personal = true
);

-- But we probably don't want to do this - personal bands are better
```

---

## Open Questions

1. **Should we auto-create personal band on signup?**
   - Pro: User immediately has a place to upload
   - Con: Forces band concept before user might want it
   - **Recommendation:** YES - simplifies onboarding

2. **What to name auto-created personal band?**
   - Option A: "[User's Name]'s Workspace"
   - Option B: "Personal" (generic)
   - Option C: "My Music"
   - **Recommendation:** "[User's Name]'s Workspace" (personalized)

3. **Should personal bands be editable/deletable?**
   - Pro: User has full control
   - Con: Could delete and lose tracks
   - **Recommendation:** Editable name, not deletable (prevent data loss)

4. **Upload as Tab or FAB?**
   - Tab: Always visible, clear
   - FAB: More mobile-native, saves tab space
   - **Recommendation:** FAB (mobile best practice)

5. **Activity feed: Implement now or later?**
   - Now: Better multi-band experience immediately
   - Later: Ship simpler version first
   - **Recommendation:** Later (v2 feature)

---

## Success Metrics

**After Migration:**
- ✅ 100% of users have at least one band
- ✅ 0 tracks with `band_id = null`
- ✅ All personal bands marked `is_personal = true`

**After UI Launch:**
- ✅ Time to first upload < 2 minutes (same or better)
- ✅ Band creation rate increases (easier to discover)
- ✅ User confusion decreases (clearer mental model)
- ✅ No increase in support questions

---

## Recommendation

**Proceed in this order:**
1. ✅ **Review this plan** - Get stakeholder buy-in
2. ✅ **Backend migration** - Test thoroughly
3. ✅ **UI changes** - Implement new navigation
4. ⏸️ **Activity feed** - Ship without, add later if needed
5. ⏸️ **Upload FAB** - Can ship with tab first, enhance later

**Ship Quickly:**
- Phase 1 + Phase 2 (Core changes)
- Skip activity feed initially (show single band on Home)
- Ship with 3-tab nav: [Home] [Bands] [Profile]
- Upload via header button (existing pattern)

**Polish Later:**
- Activity feed for multi-band users
- FAB for upload
- Advanced band management features

---

*This simplifies CoreTet to match reality: most users have one band (their personal workspace), and the app should be optimized for that while gracefully handling multi-band power users.*
