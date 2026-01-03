# CoreTet MVP Implementation Guide
**Date**: 2025-12-05
**Status**: Migrations Ready - Awaiting Application
**Breaking Changes**: YES (playlists → set_lists)

---

## 🎯 Overview

This guide covers the implementation of 5 MVP collaboration features:
1. **Hero System** (Track Versions)
2. **Listened Indicator**
3. **Comments** (existing, needs polish)
4. **Keywords**
5. **Set Lists** (renamed from Playlists)

**Philosophy**: No artificial tier gating. Only natural limits (storage, collaborators).

---

## 📋 Migration Files Created

All 4 migrations are ready in `/supabase/migrations/`:

1. `20251205000001_create_track_versions.sql` - Track versions + Hero system
2. `20251205000002_create_track_listens.sql` - Listened indicator tracking
3. `20251205000003_create_keywords_system.sql` - Keywords for organization
4. `20251205000004_migrate_playlists_to_setlists.sql` - Rename & add version support

**Verification**: `VERIFY_MVP_MIGRATIONS.sql`

---

## ⚠️ Pre-Migration Checklist

### Before Running Migrations:

- [ ] **Backup database** - These are breaking changes
- [ ] **Test in local Supabase** first (if possible)
- [ ] **Review rollback procedures** in each migration file
- [ ] **Notify team** - playlists → set_lists is a breaking change
- [ ] **Check current data**:
  - How many playlists exist?
  - How many playlist_items exist?
  - Any custom queries using playlists table?

### Known Impacts:

**Breaking Changes**:
- `playlists` → `set_lists` (table renamed)
- `playlist_items` → `set_list_entries` (table renamed)
- `playlist_id` → `set_list_id` (column renamed everywhere)
- `set_list_entries` now references `version_id` instead of just `track_id`

**Frontend Updates Required**:
- All Supabase queries using `playlists` must change to `set_lists`
- All references to `playlist_items` must change to `set_list_entries`
- [lib/supabase.ts](../../lib/supabase.ts) needs updates
- Context files using playlists need updates

---

## 🚀 Running the Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref tvvztlizyciaafqkigwe

# 3. Push migrations
supabase db push

# 4. Verify
psql <connection-string> -f supabase/migrations/VERIFY_MVP_MIGRATIONS.sql
```

### Option 2: Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order (1→2→3→4)
3. Check for errors after each
4. Run VERIFY_MVP_MIGRATIONS.sql to confirm

### Option 3: Direct psql

```bash
psql "postgresql://postgres.tvvztlizyciaafqkigwe:PASSWORD@HOST/postgres" \
  -f supabase/migrations/20251205000001_create_track_versions.sql

# Repeat for migrations 2, 3, 4
```

---

## 🔄 Post-Migration: Update TypeScript Types

After migrations succeed:

```bash
npm run db:types
```

This regenerates `lib/database.types.ts` with new tables.

**Expected new types**:
- `track_versions`
- `track_listens`
- `keywords`
- `track_keywords`
- `set_lists` (was playlists)
- `set_list_entries` (was playlist_items)
- `set_list_followers` (was playlist_followers)
- `shared_set_lists` (was shared_playlists)
- `set_list_access_grants` (was playlist_access_grants)

---

## 💻 Frontend Implementation Tasks

### Phase 1: Track Versions (Days 1-2)

#### 1.1 Update Database Helpers ([lib/supabase.ts](../../lib/supabase.ts))

**Add version operations**:

```typescript
// Add to db object
versions: {
  async getByTrack(trackId: string) {
    const { data, error } = await supabase
      .from('track_versions')
      .select('*')
      .eq('track_id', trackId)
      .order('version_number', { ascending: false });
    return { data, error };
  },

  async getHeroVersion(trackId: string) {
    const { data, error } = await supabase
      .from('track_versions')
      .select('*')
      .eq('track_id', trackId)
      .eq('is_hero', true)
      .single();
    return { data, error };
  },

  async setHeroVersion(versionId: string, trackId: string) {
    // Update is_hero = true for this version
    // Trigger will handle unsetting others
    const { data, error } = await supabase
      .from('track_versions')
      .update({ is_hero: true })
      .eq('id', versionId)
      .eq('track_id', trackId)
      .select()
      .single();
    return { data, error };
  },

  async uploadNewVersion(trackId: string, file: File, userId: string) {
    // 1. Upload file to storage
    const filePath = `tracks/${trackId}/v${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await storage.uploadAudio(file, filePath);
    if (uploadError) return { data: null, error: uploadError };

    // 2. Get next version number
    const { data: versions } = await this.getByTrack(trackId);
    const nextVersion = (versions?.length || 0) + 1;

    // 3. Create version record
    const { data, error } = await supabase
      .from('track_versions')
      .insert({
        track_id: trackId,
        version_number: nextVersion,
        file_url: uploadData.path,
        file_size: file.size,
        uploaded_by: userId,
        is_hero: false, // Admin can promote later
      })
      .select()
      .single();

    return { data, error };
  },
},
```

#### 1.2 Create Version Selector Component

**New file**: `src/components/molecules/VersionSelector.tsx`

```typescript
import React from 'react';
import { ChevronDown, Star } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  is_hero: boolean;
  uploaded_at: string;
  file_url: string;
}

interface VersionSelectorProps {
  versions: Version[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  onSetHero?: (versionId: string) => void;
  canSetHero: boolean; // Admin only
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  currentVersionId,
  onVersionChange,
  onSetHero,
  canSetHero,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const heroVersion = versions.find(v => v.is_hero);
  const currentVersion = versions.find(v => v.id === currentVersionId);

  return (
    <div className="version-selector">
      {/* Hero badge */}
      {currentVersion?.is_hero && (
        <span className="hero-badge">
          <Star size={14} /> Hero Version
        </span>
      )}

      {/* Version dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="version-button"
      >
        Version {currentVersion?.version_number || '?'}
        <ChevronDown size={16} />
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div className="version-dropdown">
          {versions.map(version => (
            <div
              key={version.id}
              onClick={() => {
                onVersionChange(version.id);
                setIsOpen(false);
              }}
              className={`version-item ${version.id === currentVersionId ? 'active' : ''}`}
            >
              <span>Version {version.version_number}</span>
              {version.is_hero && <Star size={12} />}
              {canSetHero && !version.is_hero && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetHero?.(version.id);
                  }}
                  className="set-hero-button"
                >
                  Make Hero
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 1.3 Update Track Upload Flow

When admin uploads new version:
1. Prompt: "Is this a new version or replace existing?"
2. If new version → call `db.versions.uploadNewVersion()`
3. If replace → update current hero version
4. Ask: "Make this the Hero version?"

---

### Phase 2: Listened Indicator (Days 3-4)

#### 2.1 Update Audio Player

**File**: [src/utils/audioPlayerManager.ts](../../src/utils/audioPlayerManager.ts)

Add listened tracking:

```typescript
// In AudioPlayerManager class
private hasTrackedListen: boolean = false;
private currentUserId: string | null = null;
private currentVersionId: string | null = null;

// Add method to track listen
private async trackListenIfNeeded(currentTime: number, duration: number) {
  if (this.hasTrackedListen) return;
  if (!this.currentUserId || !this.currentVersionId) return;

  const percentage = (currentTime / duration) * 100;

  if (percentage >= 80) {
    try {
      await supabase.rpc('record_track_listen', {
        p_track_id: this.currentTrack.id,
        p_version_id: this.currentVersionId,
        p_user_id: this.currentUserId,
        p_playback_percentage: percentage,
      });
      this.hasTrackedListen = true;
    } catch (error) {
      console.error('Failed to track listen:', error);
    }
  }
}

// Update onTimeUpdate callback
onTimeUpdate: (currentTime, duration) => {
  this.trackListenIfNeeded(currentTime, duration);
  // ... existing code
}
```

#### 2.2 Create Listened Indicator UI

**New file**: `src/components/atoms/ListenedIndicator.tsx`

```typescript
interface ListenedIndicatorProps {
  trackId: string;
  versionId: string;
  bandMembers: { id: string; name: string }[];
}

export const ListenedIndicator: React.FC<ListenedIndicatorProps> = ({
  trackId,
  versionId,
  bandMembers,
}) => {
  const [listens, setListens] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function fetchListens() {
      const { data } = await supabase
        .from('track_listens')
        .select('user_id')
        .eq('version_id', versionId);

      setListens(data?.map(l => l.user_id) || []);
    }
    fetchListens();
  }, [versionId]);

  const listenedMembers = bandMembers.filter(m => listens.includes(m.id));

  return (
    <div className="listened-indicator">
      <Headphones size={16} />
      <span>{listenedMembers.length} / {bandMembers.length} listened</span>
      {/* Optional: Show member names on hover */}
    </div>
  );
};
```

---

### Phase 3: Keywords (Days 5-6)

#### 3.1 Update Database Helpers

```typescript
keywords: {
  async getOrCreate(bandId: string, name: string, userId: string, color?: string) {
    const { data, error } = await supabase.rpc('get_or_create_keyword', {
      p_band_id: bandId,
      p_name: name,
      p_created_by: userId,
      p_color: color,
    });
    return { data, error };
  },

  async addToTrack(trackId: string, keywordId: string, userId: string) {
    const { data, error } = await supabase.rpc('add_keyword_to_track', {
      p_track_id: trackId,
      p_keyword_id: keywordId,
      p_added_by: userId,
    });
    return { data, error };
  },

  async getByBand(bandId: string) {
    const { data, error } = await supabase
      .from('keyword_stats')
      .select('*')
      .eq('band_id', bandId)
      .order('track_count', { ascending: false });
    return { data, error };
  },

  async getByTrack(trackId: string) {
    const { data, error } = await supabase
      .from('track_keywords')
      .select(`
        keyword_id,
        keywords (
          id,
          name,
          color
        )
      `)
      .eq('track_id', trackId);
    return { data, error };
  },
},
```

#### 3.2 Create Keyword UI Components

**Keyword Pills** (display on track cards):
```typescript
// src/components/atoms/KeywordPill.tsx
export const KeywordPill = ({ name, color, onClick }) => (
  <span
    className="keyword-pill"
    style={{ backgroundColor: color || '#e5e7eb' }}
    onClick={onClick}
  >
    {name}
  </span>
);
```

**Keyword Manager** (admin modal):
```typescript
// src/components/molecules/KeywordManager.tsx
// Allow admin to:
// 1. Type new keyword (autocomplete from existing)
// 2. Add keyword to track
// 3. Remove keyword from track
// 4. Filter tracks by keyword
```

---

### Phase 4: Set Lists (Days 7-8)

#### 4.1 Update All Playlist References

**CRITICAL**: Search codebase for:
- `playlists` → `set_lists`
- `playlist_items` → `set_list_entries`
- `playlist_id` → `set_list_id`
- `PlaylistContext` → `SetListContext`

**Files to update**:
- [lib/supabase.ts](../../lib/supabase.ts) - All `db.playlists.*` → `db.setLists.*`
- [src/contexts/PlaylistContext.tsx](../../src/contexts/PlaylistContext.tsx) - Rename to SetListContext
- All components using playlists

#### 4.2 Add Version Selection to Set Lists

```typescript
// When adding track to set list:
setLists: {
  async addEntry(setListId: string, versionId: string, userId: string, position: number) {
    const { data, error } = await supabase
      .from('set_list_entries')
      .insert({
        set_list_id: setListId,
        version_id: versionId, // ← NEW: version instead of track
        added_by: userId,
        position: position,
      })
      .select()
      .single();
    return { data, error };
  },

  async getEntries(setListId: string) {
    const { data, error } = await supabase
      .from('set_list_entries')
      .select(`
        *,
        track_versions (
          id,
          version_number,
          file_url,
          duration_seconds,
          is_hero,
          tracks (
            id,
            title
          )
        )
      `)
      .eq('set_list_id', setListId)
      .order('position');
    return { data, error };
  },
},
```

#### 4.3 Update Set List UI

**Add version selector when adding track**:
- Show all versions
- Default to Hero
- Allow admin to pick specific version

---

## 🧪 Testing Checklist

### Migration Testing
- [ ] All migrations run without errors
- [ ] VERIFY_MVP_MIGRATIONS.sql shows all ✅
- [ ] TypeScript types regenerated successfully
- [ ] No foreign key constraint violations

### Feature Testing

**Track Versions**:
- [ ] Existing tracks have version 1 as hero
- [ ] Can upload new version
- [ ] Can set different version as hero
- [ ] Only one hero per track
- [ ] Non-hero versions are "behind" hero in UI

**Listened Indicator**:
- [ ] Listen recorded at 80% playback
- [ ] Shows who listened on track card
- [ ] Band members can see who hasn't listened

**Keywords**:
- [ ] Admin can create keyword
- [ ] Keyword autocomplete works (case-insensitive)
- [ ] Can add/remove keywords from tracks
- [ ] Can filter tracks by keyword
- [ ] Keywords unique per band

**Set Lists**:
- [ ] Existing playlists migrated to set lists
- [ ] Can create new set list
- [ ] Can add track with version selection
- [ ] Default version is Hero
- [ ] Can pick non-hero version
- [ ] Same track can appear with different versions

---

## 🔄 Rollback Procedures

Each migration file includes rollback instructions at the bottom.

**To rollback all migrations** (CAREFUL):

```sql
-- Run in reverse order: 4 → 3 → 2 → 1
-- See each file's rollback section
```

**Recommended**: Test migrations in local/staging environment first.

---

## 📞 Support

If migrations fail:
1. Check error messages in Supabase logs
2. Review VERIFY_MVP_MIGRATIONS.sql output
3. Check for data conflicts (duplicate heroes, etc.)
4. Review RLS policy errors (auth issues)

---

## 🎉 Next Steps After Implementation

1. **UI Polish**: Design tweaks for version carousel, keyword pills
2. **Comments Fix**: Address timestamp sync issue (separate task)
3. **Performance**: Test with larger datasets (100+ tracks)
4. **Mobile**: Ensure features work on iOS/Android
5. **Onboarding**: Add tooltips explaining new features
6. **Analytics**: Track feature usage (keywords, set lists, listens)

---

**Migration Status**: ✅ Ready to apply
**Breaking Changes**: ⚠️ YES - Test carefully
**Estimated Downtime**: < 5 minutes (for migrations)

