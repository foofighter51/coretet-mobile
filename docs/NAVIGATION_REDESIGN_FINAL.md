# Navigation Redesign - Final Specification
**Date:** 2025-11-03
**Approved Direction:** Ultra-simplified 2-tab navigation

---

## New Navigation Structure

### Bottom Navigation: 2 Tabs Only

```
┌─────────────┬─────────────┐
│  Playlists  │   Profile   │
└─────────────┴─────────────┘
```

**That's it. Simple.**

---

## Tab Specifications

### **Playlists Tab** (Default/Home)

**Purpose:** Show playlists from the current band

**Header:**
```
┌─────────────────────────────────┐
│ ▼ Bedeker          [Upload] [⚙] │ ← Band switcher (if multi-band)
└─────────────────────────────────┘
```

**Content:**
- List of playlists in current band
- Each playlist shows track count, recent activity
- Tap playlist → View tracks in playlist
- If single-band user: No dropdown, just show band name
- If multi-band user: Dropdown to switch bands

**Empty State:**
- "No playlists yet"
- "Create Playlist" button
- Or: Auto-show "All Tracks" playlist

**Upload Button (Header):**
- Uploads track to current band
- Same as current implementation

---

### **Profile Tab**

**Purpose:** User settings and band management

**Content:**
```
┌─────────────────────────────┐
│ Profile                     │
├─────────────────────────────┤
│ Name: John Doe             │
│ Email: john@example.com    │
├─────────────────────────────┤
│ MY BANDS                   │
├─────────────────────────────┤
│ › Personal               ✓  │ ← Current band
│ › Bedeker                   │
│ › Weekend Project           │
│ [+ Create New Band]         │
├─────────────────────────────┤
│ [How to Use CoreTet]       │
│ [Replay Intro Screens]     │
├─────────────────────────────┤
│ [Sign Out]                 │
└─────────────────────────────┘
```

**Band Switching:**
- List all user's bands
- Checkmark shows current band
- Tap band → Switches context, updates Playlists tab
- Create new band button at bottom of list

**Settings:**
- User info (name, email, phone)
- Tutorial trigger
- Replay intro
- Sign out

---

## Mental Model Changes

### Old Model (Confusing):
```
Band Tab = Tracks from current band
Personal Tab = Tracks with no band (band_id = null)
Band switcher = Hidden in header dropdown
```

### New Model (Clear):
```
Playlists Tab = All playlists in current band
Profile Tab = Switch bands + settings
Everything is a band (including "Personal")
```

---

## Implementation Steps

### Step 1: Backend Migration (4-6 hours)

**1.1 Auto-Create Personal Bands**

On user signup, create a band automatically:
```typescript
// In onboarding flow after name saved
const personalBand = await db.bands.create({
  name: 'Personal',
  created_by: userId,
  is_personal: true
});

await db.bands.addMember({
  band_id: personalBand.id,
  user_id: userId,
  role: 'owner'
});
```

**1.2 Migrate Existing Users with Null Band Tracks**

```sql
-- Create personal bands for users with null band_id tracks
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

    -- Create if doesn't exist
    IF personal_band_id IS NULL THEN
      INSERT INTO bands (name, created_by, is_personal)
      VALUES ('Personal', user_record.user_id, true)
      RETURNING id INTO personal_band_id;

      -- Add user as owner
      INSERT INTO band_members (band_id, user_id, role)
      VALUES (personal_band_id, user_record.user_id, 'owner');
    END IF;

    -- Move tracks to personal band
    UPDATE tracks
    SET band_id = personal_band_id
    WHERE user_id = user_record.user_id AND band_id IS NULL;
  END LOOP;
END $$;
```

**1.3 Update Onboarding Flow**

File: `src/components/screens/OnboardingScreen.tsx`

After saving user name, create personal band:
```typescript
// After profile update succeeds
const { data: personalBand } = await db.bands.create({
  name: 'Personal',
  created_by: user.id,
  is_personal: true
});

await db.bands.addMember({
  band_id: personalBand.id,
  user_id: user.id,
  role: 'owner'
});
```

---

### Step 2: Update Types (30 minutes)

**File: `src/types/index.ts`**

```typescript
// OLD
export type TabId = 'band' | 'personal';

// NEW
export type TabId = 'playlists' | 'profile';
```

---

### Step 3: Update TabBar Component (1 hour)

**File: `src/components/molecules/TabBar.tsx`**

```typescript
import { List, User } from 'lucide-react';

const tabs: TabItem[] = [
  { id: 'playlists', label: 'Playlists', icon: List },
  { id: 'profile', label: 'Profile', icon: User },
];
```

---

### Step 4: Create Playlists Tab (6-8 hours)

**File: `src/components/screens/MainDashboard.tsx`**

**Replace Band/Personal logic with:**

```typescript
// Playlists Tab - shows playlists from current band
if (activeTab === 'playlists') {
  const bandPlaylists = playlists.filter(p => p.band_id === currentBand?.id);

  if (bandPlaylists.length === 0) {
    return (
      <EmptyState
        icon={<List />}
        title="No playlists yet"
        description="Create a playlist to organize your tracks"
        action={
          <button onClick={handleCreatePlaylist}>
            Create Playlist
          </button>
        }
      />
    );
  }

  return (
    <div>
      {bandPlaylists.map(playlist => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          onClick={() => handlePlaylistClick(playlist.id)}
        />
      ))}
    </div>
  );
}
```

**Alternative Approach (Simpler - Show Tracks Directly):**

Instead of showing playlists, show tracks grouped by playlist:
```typescript
if (activeTab === 'playlists') {
  // Show all tracks in current band
  // Optionally grouped by playlist
  const bandTracks = tracks.filter(t => t.band_id === currentBand?.id);

  return <TracksList tracks={bandTracks} />;
}
```

**Question:** Should Playlists tab show:
- A) List of playlists (tap to see tracks)
- B) All tracks (optionally filtered by playlist)

**Recommendation:** Start with B (simpler), add A later if needed

---

### Step 5: Create Profile Tab with Band Switcher (4-6 hours)

**File: `src/components/screens/MainDashboard.tsx`**

```typescript
if (activeTab === 'profile') {
  return (
    <div style={{ padding: '16px' }}>
      {/* User Info Section */}
      <section style={{ marginBottom: '24px' }}>
        <h2>Profile</h2>
        <div>
          <label>Name</label>
          <p>{currentUser.name}</p>
        </div>
        {currentUser.email && (
          <div>
            <label>Email</label>
            <p>{currentUser.email}</p>
          </div>
        )}
        {currentUser.phone && (
          <div>
            <label>Phone</label>
            <p>{currentUser.phone}</p>
          </div>
        )}
      </section>

      {/* My Bands Section */}
      <section style={{ marginBottom: '24px' }}>
        <h3>My Bands</h3>
        {userBands.map(band => (
          <button
            key={band.id}
            onClick={() => handleSwitchBand(band.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px',
              border: currentBand?.id === band.id
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '8px',
              marginBottom: '8px',
            }}
          >
            <span>{band.name}</span>
            {currentBand?.id === band.id && <Check size={20} />}
          </button>
        ))}
        <button onClick={handleCreateBand}>
          + Create New Band
        </button>
      </section>

      {/* Help Section */}
      <section style={{ marginBottom: '24px' }}>
        <button onClick={() => setShowTutorial(true)}>
          How to Use CoreTet
        </button>
        <button onClick={() => setShowIntro(true)}>
          Replay Intro Screens
        </button>
      </section>

      {/* Sign Out */}
      <button onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
}
```

**Band Switching Logic:**
```typescript
const handleSwitchBand = async (bandId: string) => {
  await switchBand(bandId); // from BandContext
  setActiveTab('playlists'); // Navigate back to playlists
};
```

---

### Step 6: Remove Settings Icon from Header (15 minutes)

Since settings are now in Profile tab, remove the gear icon from header.

**File: `src/components/screens/MainDashboard.tsx`**

Remove settings icon button, keep only:
- Band name/switcher (if multi-band)
- Upload button

---

### Step 7: Update Band Switcher in Header (2-3 hours)

**For Multi-Band Users Only:**

Show dropdown in header on Playlists tab:
```typescript
{activeTab === 'playlists' && userBands.length > 1 && (
  <button onClick={() => setShowBandDropdown(true)}>
    {currentBand?.name} ▼
  </button>
)}
```

**For Single-Band Users:**
Just show band name (no dropdown):
```typescript
{activeTab === 'playlists' && userBands.length === 1 && (
  <span>{currentBand?.name}</span>
)}
```

---

### Step 8: Update Upload Flow (1 hour)

**No Changes Needed!**

Upload button already uses `currentBand` from context.
After migration, all tracks will have a band_id (no more nulls).

---

### Step 9: Update Empty States (2 hours)

**Playlists Tab - No Tracks:**
```typescript
<EmptyState
  icon={<Music />}
  title="No tracks yet"
  description="Upload your first track to get started"
  action={
    <button onClick={() => setShowUploader(true)}>
      Upload Track
    </button>
  }
/>
```

**Playlists Tab - No Playlists:**
```typescript
<EmptyState
  icon={<List />}
  title="No playlists yet"
  description="Create a playlist to organize your tracks"
  action={
    <button onClick={handleCreatePlaylist}>
      Create Playlist
    </button>
  }
/>
```

**Profile Tab - No Bands (Shouldn't Happen):**
Migration ensures everyone has at least one band (Personal).

---

## Testing Checklist

### New User Flow:
- [ ] Sign up with phone/email
- [ ] Enter name, see intro screens
- [ ] Personal band auto-created
- [ ] Land on Playlists tab (empty state)
- [ ] Can upload track
- [ ] Track appears in Playlists tab
- [ ] Profile tab shows "Personal" band

### Existing Single-Band User:
- [ ] Migration creates Personal band
- [ ] Null band_id tracks moved to Personal
- [ ] Playlists tab shows their tracks
- [ ] No dropdown in header (only one band)
- [ ] Profile shows one band

### Existing Multi-Band User:
- [ ] All bands visible in Profile
- [ ] Can switch bands from Profile tab
- [ ] Playlists tab updates after switch
- [ ] Header dropdown works (if implemented)
- [ ] Upload goes to current band

### Edge Cases:
- [ ] User invited to band (creates Personal + joined band)
- [ ] User with only Personal band creates second band
- [ ] User leaves all bands except Personal
- [ ] Band owner deletes band (users keep Personal)

---

## Migration Script

**File: `migrations/002-create-personal-bands.sql`**

```sql
-- Migration: Create personal bands for all users
-- Date: 2025-11-03

BEGIN;

-- Step 1: Create personal bands for users without one
INSERT INTO bands (name, created_by, is_personal)
SELECT
  'Personal' as name,
  id as created_by,
  true as is_personal
FROM profiles
WHERE id NOT IN (
  SELECT created_by FROM bands WHERE is_personal = true
);

-- Step 2: Add band_members entries for personal band owners
INSERT INTO band_members (band_id, user_id, role)
SELECT
  b.id as band_id,
  b.created_by as user_id,
  'owner' as role
FROM bands b
WHERE b.is_personal = true
  AND NOT EXISTS (
    SELECT 1 FROM band_members bm
    WHERE bm.band_id = b.id AND bm.user_id = b.created_by
  );

-- Step 3: Move tracks with null band_id to personal bands
UPDATE tracks t
SET band_id = (
  SELECT b.id
  FROM bands b
  WHERE b.created_by = t.user_id
    AND b.is_personal = true
  LIMIT 1
)
WHERE t.band_id IS NULL;

-- Step 4: Verify no tracks have null band_id
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM tracks WHERE band_id IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % tracks still have null band_id', null_count;
  END IF;

  RAISE NOTICE 'Migration successful: All tracks have band_id';
END $$;

COMMIT;
```

**Run this migration:**
```bash
# In Supabase SQL Editor
# Copy/paste the above SQL
# Execute
```

---

## Rollback Plan

**If UI changes are problematic:**
```bash
git revert <commit-hash>
```

**Database migration is permanent:**
- Personal bands created (this is good, keep them)
- Tracks moved from null → personal band (also good)
- No rollback needed - this is an improvement

**If we need to revert to Band/Personal tabs:**
- Change TabId back to 'band' | 'personal'
- Update TabBar component
- Update MainDashboard logic
- Personal bands stay in database (just unused)

---

## Timeline Estimate

**Backend Migration:** 4-6 hours
- Write migration SQL (1 hour)
- Test on development (1 hour)
- Update onboarding to create personal band (2 hours)
- Test migration on staging (1-2 hours)

**UI Changes:** 12-16 hours
- Update types and TabBar (1.5 hours)
- Create Playlists tab logic (6-8 hours)
- Create Profile tab with band switcher (4-6 hours)
- Update empty states (2 hours)

**Testing:** 3-4 hours
- Test all user scenarios
- Fix bugs found during testing

**Total: 19-26 hours**

---

## Key Decisions Made

1. ✅ Auto-create "Personal" band on signup
2. ✅ Name it "Personal" (not "[User]'s Workspace")
3. ✅ Keep upload button in header (no FAB)
4. ✅ Two tabs only: Playlists, Profile
5. ✅ Band switcher in Profile tab (always visible)
6. ✅ Optional: Dropdown in header for multi-band users
7. ⏸️ Activity feed - Not implementing (future feature)

---

## Open Question

**Playlists Tab Content:**

Should it show:
- **Option A:** List of playlists → tap → see tracks
- **Option B:** All tracks (flat list, optionally grouped by playlist)

**Current app behavior:**
Looking at the code, it seems to show tracks directly, not playlists.

**Recommendation:**
Show **all tracks** in current band on Playlists tab.
- If we want to add playlist organization later, it can be a filter/group feature
- Simpler initial implementation
- Matches current user expectations

**Please confirm:** Should Playlists tab show playlists or tracks?

---

*Ready to begin implementation once the Playlists tab content question is answered.*
