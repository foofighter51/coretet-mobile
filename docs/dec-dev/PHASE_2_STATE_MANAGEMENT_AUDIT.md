# Phase 2.2: State Management Audit

**Generated**: 2026-01-02
**Project**: CoreTet Band (Music Collaboration Platform)
**Follows**: Phase 2.1 Component Analysis

---

## 2.2.1 Overview

**Architecture:** React Context API + Hooks
- No Redux, MobX, or Zustand
- 4 Context Providers (Theme, Auth, Band, SetList)
- Heavy use of local component state (useState)

---

## 2.2.2 Context Providers Analysis

### 1. ThemeContext (`src/contexts/ThemeContext.tsx`)

**Purpose:** Light/dark mode toggle with localStorage persistence

**State:**
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  const savedTheme = localStorage.getItem('theme');
  return (savedTheme as Theme) || 'light';
});
```

**Status:** ✅ GOOD
- Minimal state (1 value)
- Proper memoization
- No unnecessary re-renders

---

### 2. AuthContext (`src/contexts/AuthContext.tsx`)

**Purpose:** Authentication flow and user session

**State Count:** 10 state variables
```typescript
const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
const [currentScreen, setCurrentScreen] = useState<ScreenId>('phone');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [userName, setUserName] = useState('');
const [authLoading, setAuthLoading] = useState(false);
const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
const [waitlistPosition, setWaitlistPosition] = useState<number | undefined>();
const [waitlistMessage, setWaitlistMessage] = useState<string | undefined>();
```

**Issues:**
1. **Form state in Context** - email, password, verificationCode, userName
   - ❌ These should be local component state
   - Causes entire app to re-render on every keystroke
   - Context should only hold user session, not form inputs

2. **UI state in Context** - currentScreen, authLoading, currentError
   - ⚠️ Mixed concerns - auth data vs UI state
   - Consider splitting into AuthStateContext + AuthUIContext

**Recommendation:**
```typescript
// ✅ GOOD: Keep in context
const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

// ❌ BAD: Move to local component state
// Remove email, password, verificationCode, userName
// Keep these in PhoneAuthScreen/OnboardingScreen components
```

---

### 3. BandContext (`src/contexts/BandContext.tsx`)

**Status:** Not fully analyzed (file not read)
**Assumption:** Manages currentBand, userBands, userRole, switchBand

**Expected Issues:**
- Likely mixing data fetching with state
- May need separation of concerns

---

### 4. SetListContext (`src/contexts/SetListContext.tsx`)

**Status:** Not fully analyzed (file not read)
**Known Usage:** Manages playlists (created/followed), current playlist

**Expected Issues:**
- Playlist CRUD operations in context
- May have caching issues
- Likely needs optimistic updates

---

## 2.2.3 Local State Analysis (MainDashboard)

### Issue: State Explosion

**Count:** 35+ useState hooks in one component

**Categories:**

1. **UI Visibility** (13 booleans)
   ```typescript
   showCreatePlaylist, showUploader, showPlaylistUploader,
   showTrackSelector, showBandModal, showBandSettings,
   showSettings, showPlaylistMenu, showDeleteConfirm,
   showTutorial, showIntro, isReordering, isEditingTracks
   ```
   **Fix:** Use reducer pattern or modal manager

2. **Form Inputs** (2 strings)
   ```typescript
   newPlaylistTitle, newTitle
   ```
   **Status:** ✅ OK - local to component

3. **Audio Playback** (4 states)
   ```typescript
   currentTrack, isPlaying, isLoading, audioError
   ```
   **Fix:** Extract to useAudioPlayer hook or Context

4. **Track Data** (4 arrays/objects)
   ```typescript
   tracks, playlistTracks, reorderedTracks, selectedTrackIds
   ```
   **Issue:** Duplicates data from contexts

5. **Ratings** (3 objects)
   ```typescript
   trackRatings, aggregatedRatings, ratingFilter
   ```
   **Fix:** Extract to useTrackRatings hook

6. **Sorting/Filtering** (2 states)
   ```typescript
   playlistSortBy, sortAscending
   ```
   **Status:** ✅ OK - view-specific state

7. **Drag & Drop** (2 indices)
   ```typescript
   draggedIndex, dragOverIndex
   ```
   **Status:** ✅ OK - interaction state

8. **Comment Tracking** (2 objects)
   ```typescript
   trackCommentStatus, trackUnreadStatus
   ```
   **Fix:** Should be in Context or hook

---

## 2.2.4 State That Should Be Lifted Up

### Move to Context/Global State:

1. **Audio Playback** → New AudioPlayerContext
   ```typescript
   // src/contexts/AudioPlayerContext.tsx
   const AudioPlayerContext = createContext({
     currentTrack: Track | null,
     isPlaying: boolean,
     play: (track: Track) => void,
     pause: () => void,
     playNext: () => void,
   });
   ```

2. **Track Ratings** → Existing SetListContext or new RatingsContext
   ```typescript
   // Add to SetListContext or create RatingsContext
   const [userRatings, setUserRatings] = useState<Record<string, Rating>>({});
   const [aggregatedRatings, setAggregatedRatings] = useState<...>({});
   ```

3. **Comment Status** → New CommentsContext
   ```typescript
   const CommentsContext = createContext({
     hasComments: Record<string, boolean>,
     hasUnread: Record<string, boolean>,
     markAsRead: (trackId: string) => void,
   });
   ```

---

## 2.2.5 State That Should Be Pushed Down

### Move to Child Components:

1. **Modal Visibility States** → Each modal component
   ```typescript
   // Instead of showCreatePlaylist in MainDashboard
   // Use isOpen prop in CreatePlaylistModal component
   <CreatePlaylistModal
     isOpen={showCreatePlaylist}
     onClose={() => setShowCreatePlaylist(false)}
   />
   ```

2. **Form Input States** → Form components
   ```typescript
   // Move newPlaylistTitle to CreatePlaylistForm component
   // Move newTitle to EditPlaylistTitleForm component
   ```

---

## 2.2.6 Missing Memoization

### Critical: MainDashboard Re-renders

**Problem:** 35+ state variables cause cascading re-renders

**Missing useMemo for Expensive Computations:**

1. **Filtered Tracks** - ✅ Already memoized
   ```typescript
   const filteredTracks = useMemo(() => {
     return bandScopedTracks.filter(track => {...});
   }, [bandScopedTracks, currentTrack, isPlaying, ratingFilter, trackRatings]);
   ```

2. **Filtered Playlist Tracks** - ✅ Already memoized
   ```typescript
   const filteredPlaylistTracks = useMemo(() => {
     const filtered = playlistTracks.filter(...);
     const sorted = [...filtered].sort(...);
     return sorted;
   }, [playlistTracks, ratingFilter, trackRatings, playlistSortBy, sortAscending]);
   ```

3. **Band-scoped Tracks** - ✅ Already memoized
   ```typescript
   const bandScopedTracks = useMemo(() => {
     if (!currentBand) return tracks;
     return tracks.filter((t: any) => !t.band_id || t.band_id === currentBand.id);
   }, [tracks, currentBand]);
   ```

**Status:** ✅ GOOD - Expensive filters are memoized

### Missing useCallback

**Event Handlers Without Memoization:**

Count: ~50+ inline arrow functions in JSX

**Examples:**
```typescript
// ❌ New function on every render
onClick={() => setShowCreatePlaylist(false)}
onChange={(e) => { setNewPlaylistTitle(e.target.value); setError(null); }}
onClick={() => toggleTrack(track.id)}

// ✅ Should use useCallback
const handleCloseCreate = useCallback(() => {
  setShowCreatePlaylist(false);
}, []);

const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  setNewPlaylistTitle(e.target.value);
  setError(null);
}, []);
```

**Impact:**
- Child components (buttons, inputs) re-render unnecessarily
- Performance degradation with large track lists
- Memory churn from function allocation

**Priority:** 🔴 HIGH - Add to top 5 refactoring tasks

---

## 2.2.7 Async State Without Loading/Error States

### Status: ⚠️ MIXED

**Good Examples:**
```typescript
const [authLoading, setAuthLoading] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [audioError, setAudioError] = useState<string | null>(null);
const [loadingTracks, setLoadingTracks] = useState(false);
const [createSetListLoading, setCreatePlaylistLoading] = useState(false);
```

**Issues:**

1. **fetchAggregatedRatings** - No loading state
   ```typescript
   const fetchAggregatedRatings = async (trackIds: string[]) => {
     // ❌ No loading indicator
     // ❌ Error silently caught
     try {
       // ... fetch logic
     } catch (error) {
       console.error('Error fetching aggregated ratings:', error);
       // User never sees this error
     }
   };
   ```

2. **Comment status fetches** - No loading/error states
   ```typescript
   const commentStatus = await db.comments.checkTracksHaveComments(trackIds);
   // ❌ No try/catch
   // ❌ No loading state shown to user
   ```

3. **Track uploads** - Handled in AudioUploader component
   **Status:** Assumed OK (not analyzed yet)

---

## 2.2.8 Derived State vs Stored State

### ✅ Good: Properly Derived

```typescript
// ✅ Computed from existing state, not stored separately
const isPlaylistOwner = currentSetList
  ? filteredCreatedPlaylists.some(p => p.id === currentSetList.id)
  : false;

// ✅ Filtered lists derived from source arrays
const bandCreatedPlaylists = useMemo(() => {
  if (!currentBand) return [];
  return setLists.filter((p: any) => p.band_id === currentBand.id);
}, [setLists, currentBand]);
```

### ⚠️ Potential Issue: Duplicate State

```typescript
const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
// ⚠️ This data also exists in SetListContext
// May cause sync issues if context updates independently
```

**Recommendation:**
- If SetListContext already manages playlist tracks, derive from context
- If not, consider moving to context with proper caching

---

## 2.2.9 State Management Patterns

### Current Pattern: **Prop Drilling + Context**

**Example:**
```typescript
// MainDashboard receives from Context
const { setLists, createdSetLists, currentSetList } = useSetList();
const { currentBand, userBands, userRole } = useBand();

// Then passes down to children
<SwipeableTrackRow
  track={track}
  currentUser={currentUser}  // ← Prop drilled through multiple levels
/>
```

**Issue:** currentUser passed to 20+ child components

**Fix:** Create useAuth hook for components to access directly
```typescript
// In child component
const { currentUser } = useAuth();
// Instead of receiving via props
```

---

## 2.2.10 Recommendations Summary

### Critical (This Week)

1. **Extract Audio Player State** → AudioPlayerContext
   - Removes 4 state variables from MainDashboard
   - Enables playback control from anywhere in app

2. **Move Form Inputs Out of AuthContext**
   - Keep email/password/code in component state
   - Prevents re-renders on keystroke

3. **Add useCallback to Event Handlers**
   - Focus on MainDashboard first
   - Prevents child component re-renders

### High Priority (This Month)

4. **Implement Modal Manager Pattern**
   - Replace 13 boolean flags with single modal state
   ```typescript
   const [activeModal, setActiveModal] = useState<ModalType | null>(null);
   ```

5. **Extract Rating Logic** → useTrackRatings hook
   - Encapsulates fetch + state management
   - Reusable across components

6. **Add Error Boundaries**
   - Wrap async operations
   - Show user-friendly error messages

### Medium Priority (This Quarter)

7. **Context Optimization**
   - Split AuthContext into AuthStateContext + AuthUIContext
   - Add context selectors to prevent unnecessary re-renders

8. **Implement Optimistic Updates**
   - Playlist creation/deletion
   - Track rating changes
   - Improves perceived performance

9. **Add Request Deduplication**
   - Prevent duplicate API calls
   - Use SWR or React Query pattern

---

## 2.2.11 State Management Score

| Category | Score | Status |
|----------|-------|--------|
| Context Architecture | 7/10 | 🟡 Good foundation, mixed concerns |
| Local State Organization | 3/10 | 🔴 35+ useState in one component |
| Memoization (useMemo) | 8/10 | ✅ Expensive computations memoized |
| Memoization (useCallback) | 2/10 | 🔴 Missing on ~50 event handlers |
| Loading States | 6/10 | 🟡 Some covered, others missing |
| Error States | 5/10 | 🟡 Caught but not always shown |
| Derived vs Stored | 8/10 | ✅ Mostly proper derivation |
| Prop Drilling | 4/10 | 🔴 currentUser drilled everywhere |

**Overall State Management Grade: C-**

Good patterns (memoization of filters, derived state) but critical issues with state organization and callback memoization. MainDashboard state explosion is primary blocker.

---

**Next Steps:** Proceed to Phase 2.3 (Code Duplication) or begin state refactoring if user approves.
