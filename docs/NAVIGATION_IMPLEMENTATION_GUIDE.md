# Navigation Redesign - Implementation Guide
**Date:** 2025-11-03
**Status:** Work in Progress - Foundation Complete, MainDashboard Pending

---

## What's Been Completed ✅

### 1. Backend Migration (Ready to Run)
- **File:** `migrations/002-create-personal-bands.sql`
- **Status:** Written, not yet executed
- **Action Required:** Run in Supabase SQL Editor when ready to deploy

### 2. Onboarding Updated
- **File:** `src/components/screens/OnboardingScreen.tsx`
- **Changes:** Auto-creates "Personal" band after user sets name
- **Status:** ✅ Complete

### 3. Type Definitions Updated
- **File:** `src/types/index.ts`
- **Changes:** `TabId` changed from `'band' | 'personal'` to `'playlists' | 'profile'`
- **Status:** ✅ Complete

### 4. TabBar Component Updated
- **File:** `src/components/molecules/TabBar.tsx`
- **Changes:** Shows "Playlists" and "Profile" tabs with new icons
- **Status:** ✅ Complete

---

## What Remains - MainDashboard Refactor ⏳

### Current Build Status
**❌ Build fails** - TypeScript errors because MainDashboard still references old tab IDs

### Required Changes

The MainDashboard component needs to be refactored to handle the new navigation structure. Here's the step-by-step guide:

---

## Step 1: Update Default Tab and State

**File:** `src/components/screens/MainDashboard.tsx`

**Find:**
```typescript
const [activeTab, setActiveTab] = useState<TabId>('band');
```

**Replace with:**
```typescript
const [activeTab, setActiveTab] = useState<TabId>('playlists');
```

---

## Step 2: Create Playlists Tab Content

**Location:** In the main render section of MainDashboard

**Current Structure:**
```typescript
// Band tab shows tracks from current band
if (activeTab === 'band') {
  // ... track list for current band
}

// Personal tab shows tracks with band_id = null
if (activeTab === 'personal') {
  // ... track list for personal tracks
}
```

**New Structure:**
```typescript
// Playlists tab shows list of playlists in current band
if (activeTab === 'playlists') {
  return (
    <div>
      {/* Header with band name and upload button */}
      <header style={{ ... }}>
        <h1>{currentBand?.name || 'CoreTet'}</h1>
        <div>
          <UploadButton onClick={() => setShowUploader(true)} />
        </div>
      </header>

      {/* Playlist List */}
      <div>
        {loadingPlaylists ? (
          <InlineSpinner text="Loading playlists..." />
        ) : playlistsInCurrentBand.length === 0 ? (
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
        ) : (
          playlistsInCurrentBand.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              trackCount={playlist.trackIds?.length || 0}
              onClick={() => handlePlaylistClick(playlist.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

**Helper Variable:**
```typescript
// Filter playlists for current band
const playlistsInCurrentBand = useMemo(() => {
  if (!currentBand) return [];
  return myPlaylists.filter(p => p.band_id === currentBand.id);
}, [myPlaylists, currentBand]);
```

---

## Step 3: Create Profile Tab Content

**Add after playlists tab:**

```typescript
// Profile tab shows user settings and band switcher
if (activeTab === 'profile') {
  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* User Info Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '16px',
        }}>
          Profile
        </h2>

        <div style={{
          backgroundColor: designTokens.colors.surface.primary,
          border: `1px solid ${designTokens.colors.borders.default}`,
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '12px',
              color: designTokens.colors.neutral.darkGray,
              display: 'block',
              marginBottom: '4px',
            }}>
              Name
            </label>
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: designTokens.colors.neutral.charcoal,
            }}>
              {currentUser?.name || 'User'}
            </p>
          </div>

          {currentUser?.email && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                fontSize: '12px',
                color: designTokens.colors.neutral.darkGray,
                display: 'block',
                marginBottom: '4px',
              }}>
                Email
              </label>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: designTokens.colors.neutral.charcoal,
              }}>
                {currentUser.email}
              </p>
            </div>
          )}

          {currentUser?.phone && (
            <div>
              <label style={{
                fontSize: '12px',
                color: designTokens.colors.neutral.darkGray,
                display: 'block',
                marginBottom: '4px',
              }}>
                Phone
              </label>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: designTokens.colors.neutral.charcoal,
              }}>
                {currentUser.phone}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* My Bands Section */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
        }}>
          My Bands
        </h3>

        {userBands.map(band => (
          <button
            key={band.id}
            onClick={() => {
              switchBand(band.id);
              setActiveTab('playlists'); // Navigate back to playlists
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '16px',
              marginBottom: '8px',
              border: currentBand?.id === band.id
                ? `2px solid ${designTokens.colors.primary.blue}`
                : `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '8px',
              backgroundColor: currentBand?.id === band.id
                ? designTokens.colors.surface.secondary
                : designTokens.colors.neutral.white,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: designTokens.colors.neutral.charcoal,
                marginBottom: '4px',
              }}>
                {band.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: designTokens.colors.neutral.darkGray,
              }}>
                {band.is_personal ? 'Personal Workspace' : 'Band'}
              </div>
            </div>
            {currentBand?.id === band.id && (
              <Check size={20} color={designTokens.colors.primary.blue} />
            )}
          </button>
        ))}

        <button
          onClick={() => setShowBandModal(true)}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '8px',
            border: `1px dashed ${designTokens.colors.neutral.gray}`,
            borderRadius: '8px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '16px',
            color: designTokens.colors.primary.blue,
            fontWeight: '500',
          }}
        >
          + Create New Band
        </button>
      </section>

      {/* Help Section */}
      <section style={{ marginBottom: '32px' }}>
        <button
          onClick={() => {
            setShowTutorial(true);
          }}
          style={{
            width: '100%',
            padding: '16px',
            marginBottom: '12px',
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: '8px',
            backgroundColor: designTokens.colors.surface.secondary,
            cursor: 'pointer',
            fontSize: '16px',
            color: designTokens.colors.primary.blue,
            fontWeight: '500',
          }}
        >
          How to Use CoreTet
        </button>

        <button
          onClick={() => {
            setShowIntro(true);
          }}
          style={{
            width: '100%',
            padding: '16px',
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: '8px',
            backgroundColor: designTokens.colors.surface.secondary,
            cursor: 'pointer',
            fontSize: '16px',
            color: designTokens.colors.primary.blue,
            fontWeight: '500',
          }}
        >
          Replay Intro Screens
        </button>
      </section>

      {/* Sign Out */}
      <button
        onClick={async () => {
          await auth.signOut();
        }}
        style={{
          width: '100%',
          padding: '16px',
          border: `1px solid ${designTokens.colors.borders.default}`,
          borderRadius: '8px',
          backgroundColor: designTokens.colors.surface.secondary,
          cursor: 'pointer',
          fontSize: '16px',
          color: designTokens.colors.neutral.darkGray,
          fontWeight: '500',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
```

**Required Import:**
```typescript
import { Check } from 'lucide-react'; // Add to existing lucide imports
```

---

## Step 4: Remove Old Tab Logic

**Search and Remove:**
- All references to `activeTab === 'band'`
- All references to `activeTab === 'personal'`
- Logic that filters tracks by `band_id === null` (no longer needed after migration)

---

## Step 5: Remove Settings Gear Icon

Since settings are now in the Profile tab, remove the settings icon from the header.

**Find:**
```typescript
<button onClick={() => setShowSettings(true)}>
  <Settings />
</button>
```

**Remove it** - Settings modal is no longer needed in header.

---

## Step 6: Update Upload Logic

**Current:** Upload checks which tab is active to determine band_id
**New:** Upload always uses `currentBand?.id` from BandContext

**Find:**
```typescript
// In upload handler
const bandId = activeTab === 'band' ? currentBand?.id : null;
```

**Replace with:**
```typescript
// In upload handler
const bandId = currentBand?.id;
```

---

## Step 7: Create PlaylistCard Component (Optional but Recommended)

**File:** `src/components/molecules/PlaylistCard.tsx`

```typescript
import React from 'react';
import { List, Music } from 'lucide-react';
import { designTokens } from '../../design/designTokens';

interface PlaylistCardProps {
  playlist: {
    id: string;
    title: string;
    description?: string;
    trackIds?: string[];
  };
  trackCount: number;
  onClick: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  trackCount,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        marginBottom: '12px',
        border: `1px solid ${designTokens.colors.neutral.lightGray}`,
        borderRadius: '8px',
        backgroundColor: designTokens.colors.neutral.white,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: designTokens.colors.surface.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <List size={24} color={designTokens.colors.primary.blue} />
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            marginBottom: '4px',
          }}
        >
          {playlist.title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: designTokens.colors.neutral.darkGray,
          }}
        >
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </p>
      </div>

      <Music size={20} color={designTokens.colors.neutral.gray} />
    </button>
  );
};
```

---

## Step 8: Update Playlist Detail View

When a playlist is clicked, the existing playlist detail view should work as-is, but verify:

**Check:**
- Playlist detail still shows tracks correctly
- Back button returns to Playlists tab (not Band tab)
- Upload to playlist works

**Update if needed:**
```typescript
const handleBackToPlaylists = () => {
  setSelectedPlaylistId(null);
  setActiveTab('playlists'); // Changed from 'band'
};
```

---

## Testing Checklist

### After MainDashboard Changes:

**Build:**
- [ ] `npm run build` succeeds with no errors
- [ ] No TypeScript errors
- [ ] Bundle size similar to before

**New User Flow:**
- [ ] Sign up → Name entry → Intro screens
- [ ] Personal band auto-created
- [ ] Land on Playlists tab (empty state)
- [ ] Can create playlist
- [ ] Can upload track
- [ ] Profile tab shows "Personal" band

**Existing User (after migration):**
- [ ] Run migration SQL in Supabase
- [ ] Refresh app
- [ ] Playlists tab shows playlists from current band
- [ ] Profile tab shows all bands
- [ ] Can switch bands
- [ ] Upload goes to current band

**Multi-Band User:**
- [ ] Profile shows all bands
- [ ] Can tap band to switch
- [ ] Playlists tab updates when switching
- [ ] Each band has separate playlists

**Edge Cases:**
- [ ] User with no playlists sees empty state
- [ ] User creates first playlist
- [ ] User switches to band with no playlists
- [ ] Band switcher works on Profile tab

---

## Migration Deployment Steps

### 1. Run Migration SQL

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Create new query
3. Paste contents of `migrations/002-create-personal-bands.sql`
4. Click "Run"
5. Verify success message shows all users have Personal bands

### 2. Deploy Frontend

```bash
# Build
npm run build

# Sync to iOS
npx cap sync ios

# Test in simulator
open ios/App/App.xcodeproj

# Or push to production (when ready)
git push origin master
```

### 3. Monitor

- Check for errors in Supabase logs
- Test with real user accounts
- Verify no users stuck without bands

---

## Rollback Plan

**If issues arise after deployment:**

### Frontend Rollback:
```bash
git revert <commit-hash>
npm run build
npx cap sync ios
```

### Database Rollback (NOT RECOMMENDED):
The migration improves data integrity (no more null band_ids).
If absolutely necessary:

```sql
-- This is destructive - only use if migration failed
UPDATE tracks
SET band_id = NULL
WHERE band_id IN (SELECT id FROM bands WHERE is_personal = true);

UPDATE playlists
SET band_id = NULL
WHERE band_id IN (SELECT id FROM bands WHERE is_personal = true);
```

**Better approach:** Fix forward, don't rollback data migration.

---

## Estimated Time to Complete

**MainDashboard Refactor:** 12-16 hours
- Update tab logic: 4-6 hours
- Create Playlists tab: 4-5 hours
- Create Profile tab: 3-4 hours
- Testing and bug fixes: 2-3 hours

**Total for entire navigation redesign:** 20-26 hours
- Backend (done): 4 hours
- Frontend basics (done): 2 hours
- MainDashboard (remaining): 12-16 hours
- Testing (remaining): 2-4 hours

---

## Next Steps

1. **Review this guide** - Make sure approach is correct
2. **Run migration SQL** - Can be done before or after frontend changes
3. **Implement MainDashboard changes** - Follow steps 1-8 above
4. **Test thoroughly** - Use checklist
5. **Deploy to staging first** - Test with real data
6. **Deploy to production** - When confident

---

## Files Modified Summary

### Completed ✅
- `migrations/002-create-personal-bands.sql` - Created
- `src/components/screens/OnboardingScreen.tsx` - Modified
- `src/types/index.ts` - Modified
- `src/components/molecules/TabBar.tsx` - Modified

### Remaining ⏳
- `src/components/screens/MainDashboard.tsx` - **Major refactor needed**
- `src/components/molecules/PlaylistCard.tsx` - **Create new (optional)**

### Unchanged ✅
- `src/contexts/BandContext.tsx` - No changes needed
- `src/contexts/PlaylistContext.tsx` - No changes needed
- Upload logic - Minimal changes (just use currentBand)

---

*This guide provides everything needed to complete the navigation redesign. Follow steps sequentially, test thoroughly, and deploy with confidence.*
