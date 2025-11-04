# Navigation Implementation - Revised Practical Steps
**Date:** 2025-11-03
**Status:** Simplified approach for safer implementation

---

## Problem

The MainDashboard.tsx is ~2700 lines with deeply integrated Band/Personal logic.
A full refactor is risky and time-consuming (12-16 hours).

## Revised Strategy: Incremental Migration

Instead of rewriting everything at once, we'll:
1. Add new Profile tab alongside existing tabs
2. Update existing tabs to work with new navigation
3. Clean up old code incrementally
4. Test at each step

---

## Phase 1: Add Profile Tab (2-3 hours)

### Step 1.1: Add Profile Tab Rendering

**Location:** After line 2700 (near the end of the main return statement, before `</div>`)

**Add this code block:**

```typescript
{/* Profile Tab - NEW */}
{activeTab === 'profile' && (
  <div style={{
    padding: '16px',
    paddingBottom: '100px',
    overflowY: 'auto',
  }}>
    {/* User Info */}
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '16px',
        color: designTokens.colors.neutral.charcoal,
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

        {(currentUser?.phone || currentUser?.phoneNumber) && (
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
              {currentUser.phoneNumber || currentUser.phone}
            </p>
          </div>
        )}
      </div>
    </section>

    {/* My Bands */}
    <section style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: designTokens.colors.neutral.charcoal,
      }}>
        My Bands
      </h3>

      {userBands.map(band => (
        <button
          key={band.id}
          onClick={() => {
            switchBand(band.id);
            setActiveTab('playlists');
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
        onClick={() => setShowTutorial(true)}
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
        onClick={() => setShowIntro(true)}
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
)}
```

**Required Import:**
Add `Check` to the lucide-react imports at the top of the file.

**Test:** Build should compile, Profile tab should be accessible and functional.

---

## Phase 2: Rename Existing Tabs (1 hour)

### Step 2.1: Rename 'band' → 'playlists'

**Find and replace ALL instances:**
- `activeTab === 'band'` → `activeTab === 'playlists'`
- `setActiveTab('band')` → `setActiveTab('playlists')`

**Use VS Code Find & Replace:**
1. Open Find (Cmd+F)
2. Enable regex mode
3. Find: `activeTab === 'band'`
4. Replace: `activeTab === 'playlists'`
5. Replace All

**Then repeat for:**
- `setActiveTab('band')` → `setActiveTab('playlists')`

### Step 2.2: Remove 'personal' Tab Logic

**Find all instances of:**
- `activeTab === 'personal'`
- `setActiveTab('personal')`

**Strategy:** Since "Personal" is now just another band, all personal logic becomes regular band logic.

**Replace:**
- `activeTab === 'personal'` → `activeTab === 'playlists'`
- `setActiveTab('personal')` → `setActiveTab('playlists')`

**Special case - combined conditions:**
```typescript
// Old
(activeTab === 'band' || activeTab === 'personal')

// New
activeTab === 'playlists'
```

---

## Phase 3: Clean Up Upload Logic (30 min)

### Step 3.1: Remove Tab-Based Band Selection

**Find:**
```typescript
const bandId = activeTab === 'band' ? currentBand?.id : null;
```

**Replace:**
```typescript
const bandId = currentBand?.id;
```

**Explanation:** After migration, ALL tracks have a band_id. No more null.

---

## Phase 4: Update Empty States (30 min)

### Step 4.1: Update Playlist Empty State

**Find:**
```typescript
title={activeTab === 'band' ? 'No playlists yet' : 'No playlists yet'}
```

**Replace:**
```typescript
title="No playlists yet"
```

**Remove conditional logic** - it's the same message regardless of tab now.

---

## Phase 5: Test & Deploy (2 hours)

### Build Test:
```bash
npm run build
```

**Should succeed** with no TypeScript errors.

### Manual Testing:

**Playlists Tab:**
- [ ] Shows playlists from current band
- [ ] Can click playlist to view tracks
- [ ] Upload button works
- [ ] Empty state shows when no playlists

**Profile Tab:**
- [ ] Shows user info
- [ ] Shows list of bands
- [ ] Can switch bands
- [ ] Switching updates Playlists tab
- [ ] Create band button works
- [ ] Tutorial/Intro buttons work
- [ ] Sign out works

**After Migration SQL:**
- [ ] Run `migrations/002-create-personal-bands.sql` in Supabase
- [ ] Verify all users have Personal band
- [ ] Verify no tracks with null band_id
- [ ] Test with existing user account

---

## Rollback Steps

If something breaks:

```bash
git reset --hard HEAD~1  # Undo last commit
npm run build
npx cap sync ios
```

---

## Summary of Changes

**Files Modified:**
- `src/components/screens/MainDashboard.tsx` - Add Profile tab, rename band→playlists, remove personal logic

**Estimated Time:**
- Phase 1: 2-3 hours (add Profile tab)
- Phase 2: 1 hour (rename tabs)
- Phase 3: 30 min (upload logic)
- Phase 4: 30 min (empty states)
- Phase 5: 2 hours (testing)

**Total: 6-7 hours** (much less than 12-16 hours full refactor)

---

## Next Session Continuation

Start with Phase 1, commit after each phase, test incrementally.

This approach is:
- ✅ Safer (smaller changes)
- ✅ Faster (no full rewrite)
- ✅ Testable (works at each step)
- ✅ Reversible (easy to rollback)
