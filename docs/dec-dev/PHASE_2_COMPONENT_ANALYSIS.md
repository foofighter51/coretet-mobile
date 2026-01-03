# Phase 2: Component Analysis & Code Quality

**Generated**: 2026-01-02
**Project**: CoreTet Band (Music Collaboration Platform)
**Follows**: Phase 1 Architecture Audit

---

## 2.1 Component Quality Review

### Critical Issues - File Size

**Files over 500 lines (recommended max: 300-400 lines):**

```
1. MainDashboard.tsx          - 2,086 lines  🔴 CRITICAL - Needs immediate refactoring
2. NewLandingPage.tsx          -   836 lines  🔴 HIGH - Split into sections
3. AcceptInvite.tsx            -   794 lines  🔴 HIGH - Extract form components
4. FeedbackDashboard.tsx       -   677 lines  🟡 MEDIUM - Extract feature modules
5. FeedbackBoard.tsx           -   623 lines  🟡 MEDIUM - Split board/comments
6. AudioUploader.tsx           -   520 lines  🟡 MEDIUM - Extract upload logic
7. LandingPage.tsx             -   493 lines  🟡 MEDIUM - Remove (duplicate of NewLandingPage?)
```

### MainDashboard.tsx Deep Dive (2,086 lines)

**What it contains:**
- TrackSelectorModal (nested component, lines 32-197)
- Audio playback logic (lines 282-754)
- Playlist management (CRUD operations)
- Track reordering system (drag & drop)
- Rating system with aggregation
- Comment status tracking
- Multiple view modes (list/detail)
- Edit tracks feature
- Band/personal context switching
- Tutorial/intro modals
- Three different tab views (playlists, library, profile)

**State Management Issues:**
```typescript
// 30+ useState calls in one component
const [activeTab, setActiveTab] = useState<TabId>('playlists');
const [tracks, setTracks] = useState<any[]>([]);
const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
const [showUploader, setShowUploader] = useState(false);
const [showPlaylistUploader, setShowPlaylistUploader] = useState(false);
const [showTrackSelector, setShowTrackSelector] = useState(false);
const [showBandModal, setShowBandModal] = useState(false);
const [showBandSettings, setShowBandSettings] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
const [currentTrack, setCurrentTrack] = useState<any | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [audioError, setAudioError] = useState<string | null>(null);
const [trackRatings, setTrackRatings] = useState<Record<string, 'listened' | 'liked' | 'loved'>>({});
const [aggregatedRatings, setAggregatedRatings] = useState<Record<string, { listened: number; liked: number; loved: number }>>({});
const [ratingFilter, setRatingFilter] = useState<'all' | 'listened' | 'liked' | 'loved' | 'unrated'>('all');
const [playlistSortBy, setPlaylistSortBy] = useState<'position' | 'name' | 'duration' | 'rating'>('position');
const [sortAscending, setSortAscending] = useState(true);
const [isReordering, setIsReordering] = useState(false);
const [reorderedTracks, setReorderedTracks] = useState<any[]>([]);
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
const [error, setError] = useState<string | null>(null);
const [createSetListLoading, setCreatePlaylistLoading] = useState(false);
const [loadingTracks, setLoadingTracks] = useState(false);
const [editingPlaylistTitle, setEditingPlaylistTitle] = useState<string | null>(null);
const [newTitle, setNewTitle] = useState('');
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [isEditingTracks, setIsEditingTracks] = useState(false);
const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
const [trackCommentStatus, setTrackCommentStatus] = useState<Record<string, boolean>>({});
const [trackUnreadStatus, setTrackUnreadStatus] = useState<Record<string, boolean>>({});
const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<any | null>(null);
const [showTutorial, setShowTutorial] = useState(false);
const [showIntro, setShowIntro] = useState(false);
// + multiple useRef hooks
```

**Recommended Refactoring:**

Split MainDashboard into:
1. **PlaylistListView.tsx** - List of playlists with create/delete
2. **PlaylistDetailView.tsx** - Individual playlist with tracks
3. **AudioPlayerProvider.tsx** - Context for audio playback state
4. **TrackListWithControls.tsx** - Track list with sort/filter/reorder
5. **useAudioPlayer.ts** - Custom hook for audio logic
6. **useTrackRatings.ts** - Custom hook for rating state
7. **usePlaylistManager.ts** - Custom hook for playlist CRUD
8. Keep MainDashboard as orchestrator with tabs

---

## 2.2 Nested Components (Anti-Pattern)

### Issue: Components Defined Inside Other Components

**TrackSelectorModal inside MainDashboard.tsx (lines 32-197)**
```typescript
// ❌ BAD: Nested component recreated on every render
function TrackSelectorModal({ tracks, existingTrackIds, onAddTracks, onCancel }: {...}) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  // ... 165 lines of component logic
}

export function MainDashboard({ currentUser }: MainDashboardProps) {
  // MainDashboard logic...
}
```

**Problem:**
- TrackSelectorModal is redefined on every MainDashboard render
- Causes unnecessary re-mounts
- Breaks React DevTools component tree
- Lost state during parent re-renders

**Fix:**
Move to separate file: `src/components/molecules/TrackSelectorModal.tsx`

---

## 2.3 PropTypes & TypeScript Issues

### Good: Strong TypeScript usage overall

**Examples:**
```typescript
interface CurrentUser {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
}

interface MainDashboardProps {
  currentUser: CurrentUser;
}
```

### ⚠️ Issues Found:

**1. Excessive `any` types in MainDashboard:**
```typescript
const [tracks, setTracks] = useState<any[]>([]);           // ❌ Should be Track[]
const [playlistTracks, setPlaylistTracks] = useState<any[]>([]); // ❌ Should be PlaylistEntry[]
const [currentTrack, setCurrentTrack] = useState<any | null>(null); // ❌ Should be Track | null
```

**2. TrackSelectorModal has weak typing:**
```typescript
tracks: any[];  // ❌ Should be Track[]
```

**3. Inline object types instead of interfaces:**
```typescript
// In SwipeableTrackRow usage
track={{
  id: item.tracks.id,
  title: item.tracks.title,
  duration_seconds: item.tracks.duration_seconds,
  folder_path: item.tracks.folder_path
}} // ❌ Should use Track interface
```

**Recommendation:** Create comprehensive types in `src/types/index.ts`:
```typescript
export interface Track {
  id: string;
  title: string;
  duration_seconds: number;
  file_url: string;
  folder_path: string;
  band_id?: string;
  created_at?: string;
  user_id?: string;
}

export interface PlaylistEntry {
  id: string;
  set_list_id: string;
  track_id: string;
  position: number;
  added_by: string;
  tracks: Track;
}
```

---

## 2.4 Inline Styles vs StyleSheet

### Issue: 100% inline styles throughout app

**Current Pattern:**
```typescript
<div style={{
  backgroundColor: designTokens.colors.surface.secondary,
  border: `1px solid ${designTokens.colors.borders.default}`,
  borderRadius: designTokens.borderRadius.md,
  padding: designTokens.spacing.md,
  marginBottom: designTokens.spacing.md,
}}>
```

**Problems:**
- Styles recreated on every render
- No style reuse across components
- Difficult to maintain consistency
- Bundle size bloat (repeated strings)

**Recommendation:**
Given that this is a React web app (not React Native), consider:

1. **CSS Modules** - Best for component-scoped styles
2. **Styled Components** - Type-safe CSS-in-JS
3. **Tailwind Classes** - Already using Tailwind v4 alpha

**Example with CSS Modules:**
```typescript
// PlaylistCard.module.css
.card {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

// PlaylistCard.tsx
import styles from './PlaylistCard.module.css';

<div className={styles.card}>
```

**Note:** Current Tailwind v4 alpha installation should be leveraged once stable.

---

## 2.5 Anonymous Functions in Render

### ⚠️ Performance Issues

**Examples from MainDashboard:**
```typescript
// ❌ New function created on every render
<button onClick={() => setShowCreatePlaylist(false)}>

// ❌ New function in map callback
{availableTracks.map(track => {
  const isSelected = selectedTracks.includes(track.id);
  return <div onClick={() => toggleTrack(track.id)}>...</div>
})}

// ❌ Complex inline handler
onChange={(e) => {
  setNewPlaylistTitle(e.target.value);
  setError(null);
}}
```

**Impact:**
- Child components re-render unnecessarily
- Memory allocation on every render
- Performance degrades with large lists

**Fix:**
```typescript
// ✅ Use useCallback for stable references
const handleCloseCreate = useCallback(() => {
  setShowCreatePlaylist(false);
}, []);

const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setNewPlaylistTitle(e.target.value);
  setError(null);
}, []);

// ✅ Extract row component and memoize
const TrackRow = React.memo(({ track, isSelected, onToggle }: TrackRowProps) => {
  return <div onClick={onToggle}>...</div>;
});
```

---

## 2.6 Missing Keys in List Renders

### Status: ✅ GOOD

All list renders properly use keys:
```typescript
{availableTracks.map(track => (
  <div key={track.id}>  // ✅ Unique, stable key
    ...
  </div>
))}

{(isReordering ? reorderedTracks : filteredPlaylistTracks).map((item: any, index: number) => (
  <div key={item.id}>  // ✅ Using ID, not index (except during drag)
    ...
  </div>
))}
```

**No issues found.**

---

## 2.7 TODO/FIXME Audit

### Found Comments:

| Location | Type | Priority | Comment |
|----------|------|----------|---------|
| App.tsx:13 | TODO | Minor | "Re-enable after TestFlight phase" (commented feature) |
| App.tsx:235 | TODO | Minor | Same - appears to be email verification redirect |
| NewLandingPage.tsx:398 | TODO | Minor | "Add your app screenshots here" |
| MainDashboard.tsx:1836 | TODO | Medium | "Review external sharing permissions for bands" |

### Assessment:

**Critical:** None ✅
**Important:** 1 item (band sharing permissions)
**Minor:** 3 items (cosmetic/deferred features)

**Recommendation:** Address band sharing permissions before beta launch.

---

## 2.8 Component Complexity Scoring

| Component | Lines | State Vars | Functions | Complexity | Action |
|-----------|-------|------------|-----------|------------|--------|
| MainDashboard.tsx | 2,086 | 35+ | 25+ | 🔴 EXTREME | Split immediately |
| NewLandingPage.tsx | 836 | 5 | 8 | 🟡 MEDIUM | Extract sections |
| AcceptInvite.tsx | 794 | 12 | 15 | 🟡 MEDIUM | Extract forms |
| FeedbackDashboard.tsx | 677 | 8 | 10 | 🟡 MEDIUM | Extract features |
| FeedbackBoard.tsx | 623 | 10 | 12 | 🟡 MEDIUM | Split board/comments |
| AudioUploader.tsx | 520 | 8 | 10 | 🟡 MEDIUM | Extract upload logic |

**Complexity Formula:** Lines + (State * 10) + (Functions * 5)

---

## 2.9 Recommendations Summary

### Immediate (This Week)

1. **Extract TrackSelectorModal** - Move to separate file
   - File: `src/components/molecules/TrackSelectorModal.tsx`
   - Impact: Fixes nested component anti-pattern

2. **Replace `any` types in MainDashboard**
   - Create proper Track/PlaylistEntry interfaces
   - Add to `src/types/index.ts`

3. **Add useCallback to event handlers**
   - Focus on MainDashboard list renders
   - Prevents unnecessary re-renders

### Short Term (This Month)

4. **Split MainDashboard into modules** (Priority #1)
   - Create organisms/PlaylistListView
   - Create organisms/PlaylistDetailView
   - Create hooks/useAudioPlayer
   - Create hooks/useTrackRatings
   - Create hooks/usePlaylistManager
   - Keep MainDashboard as thin orchestrator

5. **Standardize styling approach**
   - Decide: CSS Modules vs Styled Components vs Tailwind
   - Create style guide document
   - Apply to new components first

6. **Extract large screen components**
   - NewLandingPage → sections (Hero, Features, CTA)
   - AcceptInvite → InviteForm + InviteSuccess
   - FeedbackDashboard → FeedbackList + FeedbackFilters

### Long Term (This Quarter)

7. **Performance optimization pass**
   - Add React.memo to list item components
   - Virtualize long track lists (react-window)
   - Code-split heavy screens with React.lazy

8. **Style system unification**
   - Remove all inline styles
   - Centralize theme in CSS variables
   - Use design tokens consistently

---

## 2.10 Code Quality Score

| Category | Score | Status |
|----------|-------|--------|
| Component Size | 3/10 | 🔴 MainDashboard far exceeds limits |
| Prop Types | 7/10 | 🟡 Some `any` types, mostly good |
| Inline Styles | 2/10 | 🔴 100% inline, no CSS reuse |
| Anonymous Functions | 4/10 | 🟡 Many in renders, needs useCallback |
| List Keys | 10/10 | ✅ All lists properly keyed |
| Component Nesting | 6/10 | 🟡 One nested component found |
| TODO Comments | 9/10 | ✅ Only 4 found, all documented |

**Overall Code Quality Grade: C**

Solid TypeScript foundation with good practices (keys, types), but critical issues with component size and performance patterns. MainDashboard refactoring is blocking progress.

---

**Next Steps:** Proceed to Phase 2.2 (State Management Audit) or begin MainDashboard refactoring if user approves.
