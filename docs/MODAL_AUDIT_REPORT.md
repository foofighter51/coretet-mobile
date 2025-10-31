# CoreTet Modal/Overlay Components - Comprehensive Audit Report

**Date:** 2025-10-29
**Auditor:** Claude
**Purpose:** Document all modal/popup/overlay patterns in CoreTet for iOS keyboard issue remediation and future unified modal system

---

## Executive Summary

This audit identified **12 distinct modal/overlay components** across the CoreTet codebase, with **4 major pattern categories**. The current implementation is fragmented with inconsistent approaches to positioning, z-index management, keyboard handling, and body scroll manipulation.

**Key Findings:**
- 6 full-page modals with backdrop overlays
- 4 dropdown menu components (position: absolute)
- 2 inline confirmation dialogs
- Multiple inconsistencies in z-index values (1000, 1100, 2000, 9998)
- **NO components currently manipulate document.body** (positive finding)
- 3 modals have keyboard inputs with potential iOS issues
- Inconsistent ESC key and outside-click handling

---

## Section 1: Modal Inventory

### Full Page Modals & Overlays

| Component Name | File Path | Type | Has Keyboard | Z-index | Body Manipulation | iOS Workarounds |
|----------------|-----------|------|--------------|---------|-------------------|-----------------|
| **SettingsModal** | `/src/components/molecules/SettingsModal.tsx` | Bottom Sheet | No | 1000 | No | None |
| **BandModal** | `/src/components/molecules/BandModal.tsx` | Centered Dialog | Yes (text input) | 9998 | No | Comment notes global overflow:hidden |
| **Tutorial** | `/src/components/molecules/Tutorial.tsx` | Centered Dialog | No | 2000 | No | None |
| **TrackDetailModal** | `/src/components/screens/MainDashboard.tsx` (lines 25-538) | Centered Dialog | Yes (comment input) | 1000 | No | None |
| **CreateInvite** | `/src/components/molecules/CreateInvite.tsx` | Centered Dialog | Yes (email input) | 1100 | No | None |
| **BandSettings** | `/src/components/molecules/BandSettings.tsx` | Centered Dialog | No | 1000 | No | None |

### Dropdown Menus (Position: Absolute)

| Component Name | File Path | Type | Has Keyboard | Z-index | Close Mechanism |
|----------------|-----------|------|--------------|---------|-----------------|
| **FilterButton** | `/src/components/molecules/FilterButton.tsx` | Dropdown Menu | No | 1000 | Outside click |
| **SortButton** | `/src/components/molecules/SortButton.tsx` | Dropdown Menu | No | 1000 | Outside click |
| **UploadButton** | `/src/components/molecules/UploadButton.tsx` | Dropdown Menu | No | 1000 | Outside click |
| **Playlist Menu** | `/src/components/screens/MainDashboard.tsx` (line 2507) | Dropdown Menu | No | 1000 | Outside click |

### Inline Overlays & Dialogs

| Component Name | File Path | Type | Has Keyboard | Position Type |
|----------------|-----------|------|--------------|---------------|
| **CreatePlaylist Form** | `/src/components/screens/MainDashboard.tsx` (line 1577) | Inline Expansion | Yes (text input) | Static |
| **Delete Confirmation** | `/src/components/screens/MainDashboard.tsx` (line 1788) | Inline Dialog | No | Static |
| **Copy to Personal Confirmation** | `/src/components/screens/MainDashboard.tsx` (line 1835) | Inline Dialog | No | Static |
| **TrackSelectorModal** | `/src/components/screens/MainDashboard.tsx` (line 541) | Inline Expansion | No | Static |
| **AudioUploader (Playlist)** | `/src/components/screens/MainDashboard.tsx` (line 1897) | Inline Expansion | No | Static |

### Fixed UI Elements (Not Modals)

| Component Name | File Path | Type | Z-index | Notes |
|----------------|-----------|------|---------|-------|
| **TabBar** | `/src/components/molecules/TabBar.tsx` | Fixed Bottom Nav | 100 | Not a modal |
| **PlaybackBar** | `/src/components/molecules/PlaybackBar.tsx` | Fixed Bottom Bar | 99 | Not a modal |

---

## Section 2: Detailed Component Analysis

### 2.1 SettingsModal

**File:** `/src/components/molecules/SettingsModal.tsx`

**Type:** Bottom Sheet (slides up from bottom)

**Implementation Details:**
- **Position:** `position: fixed` overlay covering full viewport
- **Z-index:** 1000
- **Background Overlay:** `rgba(0, 0, 0, 0.5)`
- **Animation:** CSS keyframe `slideUp` (translateY: 100% → 0)
- **Close Mechanisms:**
  - X button in header
  - ESC key listener (✓)
  - Outside click on backdrop (✓)
- **Keyboard Input:** None
- **Body Scroll:** No manipulation
- **Max Height:** `90vh` with `overflowY: auto` on modal content

**Code Snippet - Positioning:**
```tsx
<div
  onClick={handleOverlayClick}
  style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }}
>
  <div style={{
    backgroundColor: designTokens.colors.neutral.white,
    borderTopLeftRadius: designTokens.borderRadius.lg,
    borderTopRightRadius: designTokens.borderRadius.lg,
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideUp 0.3s ease-out',
  }}>
```

**Issues Identified:**
- None - well implemented

---

### 2.2 BandModal

**File:** `/src/components/molecules/BandModal.tsx`

**Type:** Centered Dialog with Form

**Implementation Details:**
- **Position:** `position: fixed` with centered flex layout
- **Z-index:** 9998 (inconsistent - highest value)
- **Background Overlay:** `rgba(0, 0, 0, 0.5)` as separate div
- **Animation:** None
- **Close Mechanisms:**
  - X button in header (✓)
  - Outside click on backdrop (✓)
  - No ESC key (✗)
- **Keyboard Input:** Yes - text input for creating new band
- **Body Scroll:** Comment at line 20-21 notes: "Body overflow is already set to 'hidden' globally in styles.css - No need to manipulate it here - doing so causes iOS viewport issues"
- **Max Height:** `80vh` with `overflow: auto`

**Code Snippet - Positioning:**
```tsx
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 9998,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {/* Backdrop */}
  <div onClick={onClose} style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }} />

  {/* Modal */}
  <div style={{
    position: 'relative',
    backgroundColor: designTokens.colors.surface.primary,
    borderRadius: designTokens.borderRadius.lg,
    maxWidth: '90%',
    width: '400px',
    maxHeight: '80vh',
    overflow: 'auto',
    zIndex: 1,
  }}>
```

**Issues Identified:**
- ⚠️ **iOS Issue:** Text input with no keyboard handling - when keyboard appears, input may be obscured
- ⚠️ Inconsistent z-index (9998 vs. 1000 for other modals)
- ⚠️ Missing ESC key handler
- ✓ Good: Documents iOS viewport issue with body manipulation

---

### 2.3 Tutorial

**File:** `/src/components/molecules/Tutorial.tsx`

**Type:** Centered Dialog (multi-step wizard)

**Implementation Details:**
- **Position:** `position: fixed` overlay
- **Z-index:** 2000 (inconsistent - second highest)
- **Background Overlay:** `rgba(0, 0, 0, 0.7)` (darker than others)
- **Animation:** None
- **Close Mechanisms:**
  - X button (✓)
  - Outside click on backdrop (✓)
  - "Get Started" button on last step (✓)
  - No ESC key (✗)
- **Keyboard Input:** None (navigation only)
- **Body Scroll:** No manipulation
- **Max Height:** `80vh` with `overflowY: auto`
- **User Select:** Disabled (`userSelect: 'none'`)

**Code Snippet - Positioning:**
```tsx
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: designTokens.spacing.lg,
}} onClick={onClose}>
  <div style={{
    backgroundColor: designTokens.colors.surface.primary,
    borderRadius: designTokens.borderRadius.xl,
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: designTokens.spacing.xl,
  }} onClick={(e) => e.stopPropagation()}>
```

**Issues Identified:**
- ⚠️ Inconsistent z-index (2000)
- ⚠️ Missing ESC key handler
- Darker backdrop than other modals (intentional?)

---

### 2.4 TrackDetailModal

**File:** `/src/components/screens/MainDashboard.tsx` (inline component, lines 25-538)

**Type:** Centered Dialog with Comments & Ratings

**Implementation Details:**
- **Position:** `position: fixed` overlay
- **Z-index:** 1000
- **Background Overlay:** `rgba(0, 0, 0, 0.5)`
- **Animation:** None
- **Close Mechanisms:**
  - X button (✓)
  - Outside click on backdrop (✓)
  - No ESC key (✗)
- **Keyboard Input:** Yes - comment text input with Enter key submission
- **Body Scroll:** No manipulation (but has scroll position save/restore)
- **Max Height:** `85vh` with `overflowY: auto`
- **User Select:** Disabled (`userSelect: 'none'`) except on input
- **Special Features:**
  - Captures playback timestamp when opened
  - Comment input with timestamp attachment
  - Timestamp buttons jump to audio position
  - Marks comments as viewed on open
  - Restores scroll position on close

**Code Snippet - Keyboard Input:**
```tsx
<input
  type="text"
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && !submittingComment && handleSubmitComment()}
  placeholder={capturedTimestamp !== null ? `Comment at ${formatTime(capturedTimestamp)}...` : "Add a comment..."}
  disabled={submittingComment}
  style={{
    flex: 1,
    padding: designTokens.spacing.sm,
    userSelect: 'text',
    WebkitUserSelect: 'text',
  }}
/>
```

**Issues Identified:**
- ⚠️ **iOS Critical:** Text input with no keyboard handling - when iOS keyboard appears, input likely obscured
- ⚠️ Missing ESC key handler
- ⚠️ Defined inline in MainDashboard (should be extracted)
- ✓ Good: Scroll position preservation
- ✓ Good: Timestamp capture feature

---

### 2.5 CreateInvite

**File:** `/src/components/molecules/CreateInvite.tsx`

**Type:** Centered Dialog with Form

**Implementation Details:**
- **Position:** `position: fixed` centered
- **Z-index:** 1100 (higher than BandSettings parent at 1000)
- **Background Overlay:** `rgba(0, 0, 0, 0.5)`
- **Animation:** None
- **Close Mechanisms:**
  - X button (✓)
  - Outside click on backdrop (✓)
  - "Done" button after success (✓)
  - No ESC key (✗)
- **Keyboard Input:** Yes - email input with Enter key submission
- **Body Scroll:** Uses `overflow: auto` on overlay (allows scroll if needed)
- **Max Height:** None specified on modal content
- **Special Features:**
  - Multi-step flow (email input → generated link display)
  - Native share integration
  - Image upload capability (future)

**Code Snippet - Z-index Strategy:**
```tsx
// Parent: BandSettings has zIndex: 1000
// Child: CreateInvite has zIndex: 1100 to stack above
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100, // Higher than BandSettings
  padding: designTokens.spacing.md,
  overflow: 'auto', // Allow scrolling if content overflows
}} onClick={onClose}>
```

**Issues Identified:**
- ⚠️ **iOS Issue:** Email input with Enter key submission - keyboard may obscure input
- ⚠️ Missing ESC key handler
- ⚠️ No max height constraint
- ✓ Good: Stacking z-index strategy for nested modals

---

### 2.6 BandSettings

**File:** `/src/components/molecules/BandSettings.tsx`

**Type:** Centered Dialog with List Content

**Implementation Details:**
- **Position:** `position: fixed` centered
- **Z-index:** 1000
- **Background Overlay:** `rgba(0, 0, 0, 0.5)`
- **Animation:** None
- **Close Mechanisms:**
  - X button (✓)
  - Outside click on backdrop (✓)
  - No ESC key (✗)
- **Keyboard Input:** No
- **Body Scroll:** No manipulation
- **Max Height:** `80vh` with flex layout and `overflowY: auto` on content area
- **Special Features:**
  - Opens nested CreateInvite modal (z-index stacking)
  - Displays member list with roles
  - Pending invites management

**Code Snippet - Nested Modal Support:**
```tsx
{/* Main Modal - z-index 1000 */}
<div style={{ zIndex: 1000, position: 'fixed', ... }}>
  {/* Content */}
</div>

{/* Create Invite Modal - z-index 1100 */}
{showCreateInvite && (
  <CreateInvite
    // Renders at z-index 1100
  />
)}
```

**Issues Identified:**
- ⚠️ Missing ESC key handler
- ✓ Good: Proper z-index stacking for nested modals

---

### 2.7 FilterButton Dropdown

**File:** `/src/components/molecules/FilterButton.tsx`

**Type:** Dropdown Menu (position: absolute)

**Implementation Details:**
- **Position:** `position: relative` container with `position: absolute` dropdown
- **Z-index:** 1000
- **Background Overlay:** None (no backdrop)
- **Animation:** None
- **Close Mechanisms:**
  - Outside click (document mousedown listener) (✓)
  - Selection click (✓)
  - No ESC key (✗)
- **Keyboard Input:** No
- **Positioning:** `top: 100%` (below button), `left: 0`

**Code Snippet:**
```tsx
<div style={{ position: 'relative' }} ref={menuRef}>
  <button onClick={() => setIsOpen(!isOpen)}>...</button>

  {isOpen && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: designTokens.spacing.xs,
      backgroundColor: designTokens.colors.surface.primary,
      border: `1px solid ${designTokens.colors.borders.default}`,
      borderRadius: designTokens.borderRadius.md,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '180px',
      zIndex: 1000,
      overflow: 'hidden',
    }}>
```

**Issues Identified:**
- ⚠️ Missing ESC key handler
- No viewport edge detection (could overflow screen)

---

### 2.8 SortButton Dropdown

**File:** `/src/components/molecules/SortButton.tsx`

**Type:** Dropdown Menu (position: absolute)

**Implementation Details:**
- **Position:** `position: relative` container with `position: absolute` dropdown
- **Z-index:** 1000
- **Close Mechanisms:** Same as FilterButton
- **Special Features:** Reorder option with divider

**Issues Identified:**
- Same as FilterButton

---

### 2.9 UploadButton Dropdown

**File:** `/src/components/molecules/UploadButton.tsx`

**Type:** Dropdown Menu (position: absolute)

**Implementation Details:**
- **Position:** `position: relative` container with `position: absolute` dropdown
- **Z-index:** 1000
- **Close Mechanisms:** Same as FilterButton
- **Options:** "From Library" vs "Upload New"

**Issues Identified:**
- Same as FilterButton

---

### 2.10 Playlist Menu Dropdown

**File:** `/src/components/screens/MainDashboard.tsx` (line 2507)

**Type:** Dropdown Menu (position: absolute)

**Implementation Details:**
- **Position:** `position: absolute` in header
- **Z-index:** 1000
- **Positioning:** `top: 60px`, `right: designTokens.spacing.lg`
- **Close Mechanisms:** Selection only (no outside click handler)

**Code Snippet:**
```tsx
{showPlaylistMenu && (
  <div style={{
    position: 'absolute',
    top: '60px',
    right: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.surface.primary,
    border: `1px solid ${designTokens.colors.borders.default}`,
    borderRadius: designTokens.borderRadius.md,
    boxShadow: designTokens.shadows.elevated,
    zIndex: 1000,
    minWidth: '180px',
  }}>
```

**Issues Identified:**
- ⚠️ **Critical:** No outside click handler (menu stays open)
- ⚠️ No ESC key handler
- Inconsistent with other dropdown patterns

---

### 2.11 Inline Confirmation Dialogs

**File:** `/src/components/screens/MainDashboard.tsx` (lines 1788, 1835)

**Type:** Inline Dialogs (not modals)

**Components:**
1. Delete Playlist Confirmation (line 1788)
2. Copy to Personal Confirmation (line 1835)

**Implementation Details:**
- **Position:** Static inline (not overlays)
- **Z-index:** None (in document flow)
- **Background:** Colored background boxes
- **Close Mechanisms:** Cancel button only

**Code Snippet - Delete Confirmation:**
```tsx
{showDeleteConfirm && (
  <div style={{
    backgroundColor: designTokens.colors.ratings.loved.bgLight,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.md,
    border: `1px solid ${designTokens.colors.system.error}`,
  }}>
    <h3>Delete Playlist?</h3>
    <p>This will permanently delete...</p>
    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
      <button onClick={handleDeletePlaylist}>Delete</button>
      <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
    </div>
  </div>
)}
```

**Issues Identified:**
- Not true modals - inline expansions
- Good for non-critical confirmations
- No keyboard input issues

---

### 2.12 TrackSelectorModal

**File:** `/src/components/screens/MainDashboard.tsx` (inline component, lines 541-704)

**Type:** Inline Expansion (not full overlay)

**Implementation Details:**
- **Position:** Static inline within playlist detail view
- **Z-index:** None
- **Background:** Secondary surface color with border
- **Close Mechanisms:** X button, Cancel button
- **Max Height:** `300px` scrollable list
- **Special Features:**
  - Checkbox selection UI
  - Filters out existing tracks
  - Batch add to playlist

**Code Snippet:**
```tsx
function TrackSelectorModal({ tracks, existingTrackIds, onAddTracks, onCancel }) {
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  return (
    <div style={{
      backgroundColor: designTokens.colors.surface.secondary,
      border: `1px solid ${designTokens.colors.borders.default}`,
      borderRadius: designTokens.borderRadius.md,
      padding: designTokens.spacing.md,
      marginBottom: designTokens.spacing.md,
    }}>
      {/* Content with 300px max-height scrollable list */}
    </div>
  );
}
```

**Issues Identified:**
- Misleading name (not a modal, should be "TrackSelector")
- Should be extracted to separate component
- No keyboard issues (no inputs)

---

## Section 3: Pattern Analysis

### 3.1 Common Patterns

#### Full Overlay Pattern (6 instances)
```tsx
// Backdrop + Centered Content
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center' | 'flex-end',
  justifyContent: 'center',
  zIndex: VARIES,
}} onClick={handleBackdropClick}>
  <div style={{
    backgroundColor: 'white',
    borderRadius: '...',
    maxWidth: '...',
    maxHeight: '80vh' | '85vh' | '90vh',
    overflowY: 'auto',
  }} onClick={(e) => e.stopPropagation()}>
    {/* Modal content */}
  </div>
</div>
```

**Used By:**
- SettingsModal (bottom sheet variant)
- BandModal
- Tutorial
- TrackDetailModal
- CreateInvite
- BandSettings

**Consistency:** High - all follow similar structure
**Variations:** Bottom sheet vs centered, different max heights

#### Dropdown Menu Pattern (4 instances)
```tsx
<div style={{ position: 'relative' }} ref={menuRef}>
  <button onClick={() => setIsOpen(!isOpen)}>...</button>

  {isOpen && (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 1000,
      backgroundColor: 'white',
      border: '...',
      boxShadow: '...',
    }}>
      {/* Menu items */}
    </div>
  )}
</div>

// Outside click handler
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isOpen]);
```

**Used By:**
- FilterButton
- SortButton
- UploadButton
- Playlist Menu (partial - missing outside click)

**Consistency:** High - 3/4 identical, 1 outlier

### 3.2 Inconsistencies

#### Z-Index Values (CRITICAL)
| Z-Index | Components | Notes |
|---------|-----------|-------|
| 9998 | BandModal | Highest - why? |
| 2000 | Tutorial | Second highest - no justification |
| 1100 | CreateInvite | Intentional stacking above BandSettings |
| 1000 | SettingsModal, TrackDetailModal, BandSettings, All Dropdowns | Most common |
| 100 | TabBar | Fixed bottom nav |
| 99 | PlaybackBar | Below TabBar |

**Issues:**
- No clear z-index system or constants
- BandModal at 9998 has no justification
- Tutorial at 2000 conflicts with potential future modals

**Recommendation:** Define z-index constants:
```typescript
const Z_INDEX = {
  BASE: 0,
  FIXED_BOTTOM_NAV: 100,
  PLAYBACK_BAR: 99,
  DROPDOWN: 1000,
  MODAL: 1500,
  MODAL_STACKED: 1600, // For modals above modals
  TOAST: 2000,
  TUTORIAL: 2500,
} as const;
```

#### Background Overlay Opacity
| Opacity | Components |
|---------|-----------|
| 0.7 | Tutorial (darker) |
| 0.5 | All others |

**Recommendation:** Use consistent 0.5 or define semantic constants

#### Max Height Values
| Max Height | Components |
|------------|-----------|
| 90vh | SettingsModal |
| 85vh | TrackDetailModal |
| 80vh | BandModal, Tutorial, BandSettings |
| None | CreateInvite |

**Recommendation:** Standardize to `min(80vh, 600px)` with size variants (sm/md/lg)

#### ESC Key Handling
Only SettingsModal implements ESC key listener. All others missing.

**Code:**
```tsx
// SettingsModal - only component with ESC
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }
}, [isOpen, onClose]);
```

### 3.3 Body Scroll Manipulation

**CRITICAL FINDING:** No components currently manipulate `document.body` styles.

**Evidence:**
- BandModal line 20-21: "Body overflow is already set to 'hidden' globally in styles.css. No need to manipulate it here - doing so causes iOS viewport issues"
- Global styles.css likely has `overflow: hidden` on body
- This is actually a good iOS-safe approach

**Recommendation:** Keep current approach, document it clearly

### 3.4 Keyboard Interactions

#### Components with Text Inputs (iOS Critical)

| Component | Input Type | Enter Key | Focus Management | iOS Safe? |
|-----------|-----------|-----------|------------------|-----------|
| BandModal | Text (band name) | ❌ | AutoFocus ✓ | ⚠️ No |
| TrackDetailModal | Text (comment) | ✓ Submit | Manual select | ⚠️ No |
| CreateInvite | Email | ✓ Submit | No | ⚠️ No |
| CreatePlaylist | Text (title) | ✓ Submit | AutoFocus ✓ | ⚠️ No |

**Common Issue:** None implement iOS keyboard appearance handling
- When keyboard appears (350px+ height on iPhone), input often obscured
- No `scrollIntoView()` or padding adjustment
- No detection of keyboard show/hide

**iOS Keyboard Issue Pattern:**
```tsx
// Current (problematic on iOS)
<input
  type="text"
  value={value}
  onChange={onChange}
  autoFocus  // Opens keyboard immediately
  style={{
    padding: designTokens.spacing.sm,
    // No special iOS handling
  }}
/>

// Needed for iOS
<input
  type="text"
  value={value}
  onChange={onChange}
  ref={inputRef}
  onFocus={() => {
    // Scroll input into view when keyboard appears
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300); // iOS keyboard animation time
  }}
  style={{
    padding: designTokens.spacing.sm,
  }}
/>
```

---

## Section 4: iOS-Specific Issues

### 4.1 Keyboard Input Modals (High Priority)

**Affected Components:**
1. **TrackDetailModal** - Comment input
2. **BandModal** - Band name input
3. **CreateInvite** - Email input
4. **CreatePlaylist** (inline) - Playlist title input

**Issue Description:**
When iOS keyboard appears (~350px height), it pushes content up and may obscure the input field. Current modals have no compensation for this.

**Evidence:**
- BandModal comment (line 20-21) mentions "iOS viewport issues" with body manipulation
- No modals implement keyboard show/hide detection
- No `scrollIntoView` or input position adjustment

**Recommended Fix:**
```typescript
// Hook for iOS keyboard handling
function useIOSKeyboardAdjust(inputRef: RefObject<HTMLInputElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const handleFocus = () => {
      // Wait for keyboard animation
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    };

    const input = inputRef.current;
    input?.addEventListener('focus', handleFocus);

    return () => {
      input?.removeEventListener('focus', handleFocus);
    };
  }, [isOpen, inputRef]);
}
```

### 4.2 Document Body Manipulation (✓ Not an Issue)

**Good News:** No components manipulate `document.body.style.overflow`

BandModal explicitly documents this as an iOS-safe decision:
```tsx
// Note: Body overflow is already set to 'hidden' globally in styles.css
// No need to manipulate it here - doing so causes iOS viewport issues
```

**Current Approach:** Global `overflow: hidden` on body (in styles.css)

**Recommendation:** Keep this approach, it's iOS-safe

### 4.3 Fixed Position + Transform Issues

**No Issues Found:** Modals use simple fixed positioning without transforms

**Safe Pattern:**
```tsx
// Current - iOS safe
<div style={{
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
}}>
```

**Avoid This:**
```tsx
// Problematic on iOS
<div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)', // Can cause rendering bugs on iOS
}}>
```

### 4.4 Scroll Locking

**Current:** No scroll locking implemented (body has `overflow: hidden` globally)

**Recommendation:** Implement proper scroll locking with position preservation:

```typescript
// iOS-safe scroll lock hook
function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const body = document.body;

    // Lock scroll
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      // Restore scroll
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
```

---

## Section 5: Duplicate Implementations

### 5.1 Full Overlay Modal Pattern (6 duplicates)

**Duplicated Code:**
- Backdrop structure
- Click-outside handling
- Stop propagation on content
- Flex centering/alignment

**Consolidation Opportunity:** HIGH

**Recommendation:** Create `<BaseModal>` component:

```tsx
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom';
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  maxHeight?: string;
  zIndex?: number;
}

function BaseModal({ isOpen, onClose, children, ... }: BaseModalProps) {
  // Shared logic:
  // - ESC key handler
  // - Outside click handler
  // - Backdrop rendering
  // - Positioning logic
  // - Scroll lock
  // - iOS keyboard handling
}
```

### 5.2 Dropdown Menu Pattern (4 duplicates)

**Duplicated Code:**
- Position: relative/absolute structure
- Outside click detection
- Open/close state management
- Ref-based click detection

**Consolidation Opportunity:** MEDIUM

**Recommendation:** Create `<DropdownMenu>` component:

```tsx
interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  closeOnSelect?: boolean;
}

function DropdownMenu({ trigger, children, align = 'left' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setIsOpen(false));
  useEscKey(() => setIsOpen(false));

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          [align]: 0,
          zIndex: Z_INDEX.DROPDOWN,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
```

---

## Section 6: Proposed New Modal System

### 6.1 Base Modal Component Architecture

```typescript
// /src/components/ui/Modal.tsx

import { ReactNode, useEffect, useRef, RefObject } from 'react';
import { createPortal } from 'react-dom';

// Z-Index Constants
export const MODAL_Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1500,
  MODAL_STACKED: 1600,
  TOAST: 2000,
  TUTORIAL: 2500,
} as const;

// Size Presets
const SIZE_PRESETS = {
  sm: { maxWidth: '400px', maxHeight: '60vh' },
  md: { maxWidth: '600px', maxHeight: '80vh' },
  lg: { maxWidth: '800px', maxHeight: '85vh' },
  full: { maxWidth: '100%', maxHeight: '100vh' },
} as const;

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;

  // Layout
  size?: keyof typeof SIZE_PRESETS;
  position?: 'center' | 'bottom';
  fullScreenMobile?: boolean;

  // Behavior
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  lockScroll?: boolean;

  // Styling
  backdropOpacity?: number;
  animation?: 'fade' | 'slideUp' | 'none';
  className?: string;

  // Z-Index
  zIndex?: number;

  // iOS Support
  hasKeyboardInput?: boolean;
  keyboardInputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  size = 'md',
  position = 'center',
  fullScreenMobile = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  lockScroll = true,
  backdropOpacity = 0.5,
  animation = 'fade',
  zIndex = MODAL_Z_INDEX.MODAL,
  hasKeyboardInput = false,
  keyboardInputRef,
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // iOS keyboard adjustment
  useEffect(() => {
    if (!isOpen || !hasKeyboardInput || !keyboardInputRef?.current) return;

    const handleFocus = () => {
      setTimeout(() => {
        keyboardInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300); // Wait for iOS keyboard animation
    };

    const input = keyboardInputRef.current;
    input?.addEventListener('focus', handleFocus);

    return () => {
      input?.removeEventListener('focus', handleFocus);
    };
  }, [isOpen, hasKeyboardInput, keyboardInputRef]);

  // Scroll lock (iOS-safe)
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    const scrollY = window.scrollY;
    const body = document.body;

    // Lock scroll
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      // Restore scroll
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, lockScroll]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeStyles = SIZE_PRESETS[size];

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    display: 'flex',
    alignItems: position === 'bottom' ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex,
    padding: position === 'bottom' ? 0 : 16,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: position === 'bottom' ? '16px 16px 0 0' : '12px',
    width: '100%',
    maxWidth: fullScreenMobile ? '100%' : sizeStyles.maxWidth,
    maxHeight: sizeStyles.maxHeight,
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    animation: animation === 'slideUp' ? 'modalSlideUp 0.3s ease-out' :
               animation === 'fade' ? 'modalFade 0.2s ease-out' :
               'none',
  };

  const content = (
    <div style={backdropStyles} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        style={modalStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes modalFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  // Render in portal for proper stacking
  return createPortal(content, document.body);
}
```

### 6.2 Specialized Modal Components

#### Dialog Modal
```tsx
interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
  hasKeyboardInput?: boolean;
  keyboardInputRef?: RefObject<HTMLInputElement>;
}

export function DialogModal({
  title,
  footer,
  children,
  ...baseProps
}: DialogModalProps) {
  return (
    <BaseModal {...baseProps} position="center">
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            {title}
          </h2>
          <button
            onClick={baseProps.onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div>{children}</div>

        {footer && (
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
          }}>
            {footer}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
```

#### Bottom Sheet Modal
```tsx
interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheetModal({
  title,
  children,
  ...baseProps
}: BottomSheetModalProps) {
  return (
    <BaseModal
      {...baseProps}
      position="bottom"
      animation="slideUp"
      size="md"
    >
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          {title}
        </h2>
        <button
          onClick={baseProps.onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </BaseModal>
  );
}
```

### 6.3 Dropdown Menu Component

```tsx
import { ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  closeOnSelect?: boolean;
}

export function DropdownMenu({
  trigger,
  children,
  align = 'left',
  closeOnSelect = true,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Outside click handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            [align]: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '180px',
            zIndex: MODAL_Z_INDEX.DROPDOWN,
            overflow: 'hidden',
          }}
          onClick={closeOnSelect ? () => setIsOpen(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
```

### 6.4 Usage Examples

#### Replace SettingsModal
```tsx
// Before
<SettingsModal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  currentUser={currentUser}
  onShowTutorial={onShowTutorial}
  onSignOut={onSignOut}
/>

// After
<BottomSheetModal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  title="Settings"
>
  {/* Settings content */}
</BottomSheetModal>
```

#### Replace TrackDetailModal with Keyboard Input
```tsx
// Before (inline component)
<TrackDetailModal
  track={selectedTrack}
  onClose={handleClose}
  currentUser={currentUser}
  audioRef={audioRef}
  currentTrack={currentTrack}
/>

// After
const commentInputRef = useRef<HTMLInputElement>(null);

<DialogModal
  isOpen={!!selectedTrack}
  onClose={handleClose}
  title={selectedTrack?.title}
  size="md"
  hasKeyboardInput={true}
  keyboardInputRef={commentInputRef}
>
  {/* Track detail content */}
  <input
    ref={commentInputRef}
    type="text"
    placeholder="Add comment..."
  />
</DialogModal>
```

#### Replace FilterButton Dropdown
```tsx
// Before
<FilterButton
  activeFilter={activeFilter}
  onFilterChange={onFilterChange}
/>

// After
<DropdownMenu
  trigger={
    <button>
      <Filter size={20} />
      <span>Filter</span>
    </button>
  }
  align="left"
>
  {['all', 'listened', 'liked', 'loved'].map(filter => (
    <button
      key={filter}
      onClick={() => onFilterChange(filter)}
    >
      {filter}
    </button>
  ))}
</DropdownMenu>
```

---

## Section 7: Migration Strategy

### 7.1 Phase 1: Create Base Components (Week 1)

**Tasks:**
1. Create `/src/components/ui/Modal.tsx` with `BaseModal` component
2. Create specialized components:
   - `DialogModal`
   - `BottomSheetModal`
   - `ConfirmDialog`
3. Create `/src/components/ui/DropdownMenu.tsx`
4. Create z-index constants file: `/src/constants/zIndex.ts`
5. Write Storybook stories for all components
6. Unit tests for keyboard, ESC, outside-click behaviors

**Deliverables:**
- Reusable modal system
- Full test coverage
- Documentation

### 7.2 Phase 2: Migrate High-Priority Modals (Week 2)

**Priority Order:**
1. **TrackDetailModal** (highest iOS impact - has keyboard input)
2. **CreateInvite** (has keyboard input)
3. **BandModal** (has keyboard input)
4. **SettingsModal** (good reference implementation)
5. Tutorial
6. BandSettings

**For each migration:**
1. Create new component using `DialogModal` or `BottomSheetModal`
2. Add iOS keyboard handling if needed
3. Test on iOS device
4. Compare behavior to original
5. Replace original with new version
6. Delete old component

### 7.3 Phase 3: Migrate Dropdown Menus (Week 2)

**Components:**
1. FilterButton → use `DropdownMenu`
2. SortButton → use `DropdownMenu`
3. UploadButton → use `DropdownMenu`
4. Playlist Menu → use `DropdownMenu`

### 7.4 Phase 4: Migrate Inline Components (Week 3)

**Components:**
1. CreatePlaylist form (extract to component)
2. Delete Confirmation → use `ConfirmDialog`
3. Copy to Personal Confirmation → use `ConfirmDialog`
4. TrackSelectorModal → rename to `TrackSelector`, extract to component

### 7.5 Phase 5: Cleanup & Documentation (Week 3)

**Tasks:**
1. Delete old modal components
2. Update documentation
3. Add iOS testing checklist
4. Create modal usage guide
5. Code review and refinement

---

## Section 8: iOS Testing Checklist

### Before Deployment (iOS Device Required)

For each modal with keyboard input:

#### Test Case 1: Keyboard Appearance
- [ ] Open modal
- [ ] Tap input field
- [ ] **Verify:** Input field scrolls into view and is not obscured by keyboard
- [ ] **Verify:** Modal backdrop remains visible above keyboard
- [ ] **Verify:** Can type into input

#### Test Case 2: Keyboard Dismissal
- [ ] Open modal with keyboard visible
- [ ] Dismiss keyboard (swipe down or tap Done)
- [ ] **Verify:** Modal returns to original position
- [ ] **Verify:** Can re-open keyboard

#### Test Case 3: Scroll Behavior
- [ ] Open modal with long content
- [ ] Scroll to bottom
- [ ] Tap input at top
- [ ] **Verify:** Auto-scrolls to input when keyboard appears
- [ ] **Verify:** Can manually scroll content with keyboard open

#### Test Case 4: Orientation Change
- [ ] Open modal in portrait
- [ ] Rotate to landscape
- [ ] Tap input
- [ ] **Verify:** Keyboard doesn't obscure input in landscape
- [ ] Rotate back to portrait
- [ ] **Verify:** Modal maintains state

#### Test Case 5: Multi-Input Forms
- [ ] Modal with multiple inputs
- [ ] Tab through inputs
- [ ] **Verify:** Each input scrolls into view as it gains focus

### Devices to Test
- iPhone SE (small screen - worst case)
- iPhone 14/15 (standard)
- iPhone 14/15 Plus (large)
- iPad (different keyboard behavior)

---

## Section 9: Recommendations Summary

### Critical (Fix Immediately)
1. **Add iOS keyboard handling to all modals with text inputs**
   - TrackDetailModal
   - BandModal
   - CreateInvite
   - CreatePlaylist form

2. **Fix Playlist Menu missing outside-click handler**

3. **Standardize z-index values** - define constants

### High Priority
4. **Extract TrackDetailModal** from MainDashboard (5000+ line file)

5. **Add ESC key handlers** to all modals (currently only SettingsModal has it)

6. **Implement proper scroll locking** (iOS-safe version)

### Medium Priority
7. **Create unified modal system** (BaseModal, DialogModal, BottomSheetModal)

8. **Consolidate dropdown menu implementations**

9. **Rename TrackSelectorModal** to TrackSelector (it's not a modal)

### Low Priority
10. **Standardize max height values** across modals

11. **Consistent backdrop opacity** (currently Tutorial uses 0.7, others use 0.5)

---

## Appendix A: Complete File Listing

### Modals
- `/src/components/molecules/SettingsModal.tsx` - 258 lines
- `/src/components/molecules/BandModal.tsx` - 333 lines
- `/src/components/molecules/Tutorial.tsx` - 257 lines
- `/src/components/molecules/CreateInvite.tsx` - 383 lines
- `/src/components/molecules/BandSettings.tsx` - 374 lines

### Inline Components (in MainDashboard.tsx)
- TrackDetailModal - lines 25-538
- TrackSelectorModal - lines 541-704
- CreatePlaylist form - line 1577
- Delete Confirmation - line 1788
- Copy to Personal Confirmation - line 1835
- Playlist Menu dropdown - line 2507

### Dropdown Menus
- `/src/components/molecules/FilterButton.tsx` - 163 lines
- `/src/components/molecules/SortButton.tsx` - 223 lines
- `/src/components/molecules/UploadButton.tsx` - 163 lines

### Fixed UI (Not Modals)
- `/src/components/molecules/TabBar.tsx` - 93 lines
- `/src/components/molecules/PlaybackBar.tsx` - 305 lines

---

## Appendix B: Z-Index Map

```
Layer 7: Tutorial (z: 2000)
Layer 6: [Reserved for Toasts]
Layer 5: CreateInvite (z: 1100) - stacked above BandSettings
Layer 4: BandModal (z: 9998) ⚠️ WRONG - should be 1000-1500
Layer 3: All Standard Modals (z: 1000)
         - SettingsModal
         - TrackDetailModal
         - BandSettings
         - All Dropdowns
Layer 2: TabBar (z: 100)
Layer 1: PlaybackBar (z: 99)
Layer 0: Content (z: auto)
```

---

## Appendix C: Body Scroll Handling

**Current Implementation:** Global `overflow: hidden` on body (in styles.css)

**BandModal Comment (line 20-21):**
```typescript
// Note: Body overflow is already set to 'hidden' globally in styles.css
// No need to manipulate it here - doing so causes iOS viewport issues
```

**Verification Needed:**
- Check `/src/styles.css` for body styles
- Confirm this is intentional and working correctly
- Document this pattern for future developers

**Recommended Approach (if not using global overflow:hidden):**
```typescript
// iOS-safe scroll lock
useEffect(() => {
  if (!isOpen) return;

  const scrollY = window.scrollY;
  const body = document.body;

  // Lock scroll
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.width = '100%';

  return () => {
    // Restore scroll
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    window.scrollTo(0, scrollY);
  };
}, [isOpen]);
```

---

**END OF REPORT**

**Next Steps:**
1. Review findings with team
2. Prioritize fixes based on user impact
3. Create issues for each recommendation
4. Begin Phase 1 of migration
5. Test on iOS devices after each change
