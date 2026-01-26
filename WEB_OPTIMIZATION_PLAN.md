# CoreTet Web Optimization Plan
## Desktop-First Redesign Strategy

**Platform**: Music Collaboration Platform (FrameIO for Audio)
**Target Users**: Songwriters, Producers, Power Users
**Primary Platform**: Web Browser (Desktop/Laptop)
**Future Phase**: Mobile App (4-6 weeks out)

**Last Updated**: January 25, 2026
**Status**: Architecture Shift - Mobile-First → Desktop-First

---

## Executive Summary

CoreTet is currently **heavily optimized for mobile-first design** with systematic constraints that prevent desktop optimization. The main application is capped at **425px width** regardless of screen size, uses **fixed-height viewports**, and implements **touch-only interactions** for core features.

**Key Finding**: The codebase already demonstrates responsive capability in admin screens (AdminInviteCodesScreen uses 1200px max-width, FeedbackDashboard uses full-width), proving desktop-first patterns are achievable within the existing architecture.

**Conversion Strategy**: Incremental migration with mobile fallbacks, leveraging existing patterns from admin screens.

**Estimated Effort**: 3-4 sprints to achieve desktop-first with mobile compatibility.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Desktop-First Design Principles](#2-desktop-first-design-principles)
3. [Component Redesign Priorities](#3-component-redesign-priorities)
4. [New Desktop Features](#4-new-desktop-features)
5. [Implementation Roadmap](#5-implementation-roadmap)
6. [Technical Architecture](#6-technical-architecture)
7. [Success Metrics](#7-success-metrics)

---

## 1. Current State Analysis

### 1.1 Critical Mobile-First Constraints

#### **Global Width Constraint** (BLOCKING)

**File**: `src/components/screens/MainDashboard.tsx` (Line 221)
```tsx
const baseStyle: React.CSSProperties = {
  maxWidth: '425px',  // ❌ HARD CONSTRAINT - blocks desktop expansion
  height: '100vh',    // ❌ Fixed viewport height
};
```

**Impact**:
- All screens capped at 425px width on desktop
- Applies to: MainDashboard, PublicPlaylistView, WelcomeScreen, all auth screens
- Forces single-column layouts
- Wastes 75% of screen space on 1920px displays

**Fix Priority**: 🔴 **CRITICAL** - Week 1

---

#### **Fixed Bottom Navigation Stack**

**Current Layout** (MainDashboard.tsx lines 2009-2020):
```
Total Bottom Reserved: 164px
  ├── TabBar: 60px (fixed bottom)
  ├── PlaybackBar: ~84px (when playing)
  └── Gaps/margins: 20px
```

**Files Affected**:
- `src/components/molecules/TabBar.tsx` - Bottom navigation (60px)
- `src/components/molecules/PlaybackBar.tsx` - Audio player (84px)

**Desktop Waste**:
- Content scrolls under fixed bars (164px wasted)
- No sidebar space for navigation
- No expanded track details panel
- Playlists must pad bottom by 164px

**Fix Priority**: 🔴 **CRITICAL** - Week 2

---

#### **Touch-Only Interactions** (6 Components)

1. **SwipeableTrackRow** (`src/components/molecules/SwipeableTrackRow.tsx`)
   - Lines 60-144: Touch gesture implementation
   - Swipe-right reveals rating actions (Liked/Loved)
   - Desktop users must right-swipe to rate tracks
   - **Desktop Alternative**: Right-click context menu + inline buttons

2. **TrackCard** (`src/components/molecules/TrackCard.tsx`)
   - Fixed width: 343px (line 154)
   - Swipe-to-reveal actions (max 80px swipe)
   - Haptic feedback: `navigator.vibrate(50)` (lines 128-129)
   - **Desktop Alternative**: Hover actions, flexible card grid

3. **PlaybackBar** (`src/components/molecules/PlaybackBar.tsx`)
   - Touch-priority scrubbing (44px minimum target)
   - Oversized for desktop mouse precision
   - **Desktop Alternative**: Standard scrubber, waveform preview

4. **TabBar** (`src/components/molecules/TabBar.tsx`)
   - Vertical icon + label layout (mobile-optimized)
   - Fixed bottom position
   - **Desktop Alternative**: Horizontal sidebar, top nav bar

5. **AudioUploader** (`src/components/molecules/AudioUploader.tsx`)
   - Mobile file picker priority (Capacitor.isNativePlatform())
   - Basic drag-drop (minHeight: 200px)
   - **Desktop Alternative**: Folder upload, batch queue, multi-file preview

6. **BottomSheetModal** (`src/components/ui/BottomSheetModal.tsx`)
   - Position: bottom animation (mobile pattern)
   - **Desktop Alternative**: Center modal or side panel

**Fix Priority**: 🟡 **HIGH** - Week 3-4

---

### 1.2 Positive Findings (Desktop-Ready Patterns)

#### **Admin Screens Already Responsive!**

**AdminInviteCodesScreen** (Line 125-130):
```tsx
<div style={{
  maxWidth: '1200px',  // ✅ Desktop-optimized width!
  margin: '0 auto',
  padding: designTokens.spacing.xl,
}}>
```

**Features**:
- Grid layout: `gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`
- Responsive form inputs
- Full-width tables
- Already leverages desktop space

**FeedbackDashboard**:
- Full-width when `data-admin-page="true"` attribute set
- 5-column stats grid: `gridTemplateColumns: 'repeat(5, 1fr)'`

**Takeaway**: Responsive patterns **already work** in this codebase. Admin screens prove desktop-first is achievable.

**Action**: Use admin screen patterns as blueprint for main app redesign.

---

### 1.3 Missing Infrastructure

**Responsive Hooks**: ❌ None exist
- No `useWindowSize()`
- No `useMediaQuery()`
- No `useResponsive()`
- No viewport breakpoint detection

**Media Queries**: ❌ Zero found
- No `@media` queries in component styles
- No breakpoint constants
- Global CSS has no responsive rules

**Platform Detection**: ⚠️ Limited
- `Capacitor.isNativePlatform()` - Detects native vs. web only
- No desktop vs. mobile logic
- No input method detection (touch vs. mouse)

**Action**: Build responsive infrastructure from scratch (Week 1).

---

## 2. Desktop-First Design Principles

### 2.1 Layout Principles

**Desktop (1920x1080 primary target)**:
- Sidebar navigation (200-280px fixed left)
- Main content area (flexible width, 800-1400px ideal)
- Details panel (300-400px collapsible right)
- No fixed bottom bars (sidebar contains player)

**Tablet (1024-1366px)**:
- Collapsible sidebar
- Main content expands to fill
- Details panel overlay on demand

**Mobile (< 768px)**:
- Current mobile-first layout preserved
- Bottom tab bar returns
- Fixed bottom player
- Full-screen modals

---

### 2.2 Interaction Principles

**Mouse & Keyboard First**:
- Right-click context menus for all actions
- Hover states reveal actions (not swipe)
- Keyboard shortcuts for common operations:
  - `Space`: Play/pause
  - `→/←`: Skip forward/back 5 seconds
  - `↑/↓`: Volume up/down
  - `Cmd/Ctrl + N`: New playlist
  - `Cmd/Ctrl + U`: Upload files
  - `Cmd/Ctrl + F`: Search tracks
  - `Del/Backspace`: Delete selected
  - `Cmd/Ctrl + A`: Select all
  - `Cmd/Ctrl + Z/Y`: Undo/redo

**Multi-Select Everywhere**:
- Checkbox selection for tracks
- Shift-click range selection
- Cmd/Ctrl-click multi-selection
- Bulk operations (delete, rate, move, download)

**Drag-Drop Extensions**:
- Drag tracks between playlists
- Drag files from desktop to upload
- Drag folders for batch upload
- Visual drag preview with count badge

---

### 2.3 Information Density

**Desktop Advantage**: Show more data per screen
- List view: 20-30 tracks visible (vs. 5-8 on mobile)
- Grid view: 4-6 columns (vs. 1-2 on mobile)
- Table view: Multiple columns with sortable headers
- Waveform thumbnails in track rows
- Metadata always visible (no tap-to-expand)

**Data Display Priorities**:
- Track title, artist, duration (always visible)
- Waveform thumbnail (desktop-only)
- Rating, play count, upload date (desktop-only)
- Version indicator (desktop-only)
- Comments count badge (desktop-only)

---

## 3. Component Redesign Priorities

### Priority 1: Foundation (Week 1) 🔴

#### 1.1 Remove Hard Constraints

**MainDashboard.tsx**:
```tsx
// BEFORE (Mobile):
const baseStyle: React.CSSProperties = {
  maxWidth: '425px',
  height: '100vh',
  overflow: 'hidden',
};

// AFTER (Desktop-First):
const baseStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  display: 'flex',  // Enable sidebar layout
  overflow: 'hidden',
};
```

**Impact**: Unlocks full viewport width for desktop users.

---

#### 1.2 Create Responsive Infrastructure

**New File**: `src/hooks/useResponsive.ts`
```tsx
import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768-1024px
  isDesktop: boolean;     // > 1024px
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => ({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    width: window.innerWidth,
    height: window.innerHeight,
    breakpoint: window.innerWidth < 768 ? 'mobile'
               : window.innerWidth < 1024 ? 'tablet'
               : 'desktop'
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height: window.innerHeight,
        breakpoint: width < 768 ? 'mobile'
                   : width < 1024 ? 'tablet'
                   : 'desktop'
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
```

**Usage Example**:
```tsx
function TrackList() {
  const { isDesktop, isMobile } = useResponsive();

  return isDesktop ? (
    <TrackTable columns={6} /> // Desktop: Table view
  ) : (
    <TrackListMobile />         // Mobile: List view
  );
}
```

---

#### 1.3 Responsive Design Tokens

**Update**: `src/design/designTokens.ts`
```tsx
export const designTokens = {
  // ... existing tokens ...

  // NEW: Responsive breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1920px',
  },

  // NEW: Responsive spacing
  spacing: {
    // Mobile (existing)
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',

    // Desktop (new)
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // NEW: Responsive font sizes
  fontSize: {
    mobile: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    },
    desktop: {
      xs: '13px',
      sm: '15px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '30px',
      '3xl': '36px',
    }
  },

  // Update touch targets for desktop
  dimensions: {
    touchTarget: {
      mobile: '44px',    // iOS/Android minimum
      desktop: '32px',   // Mouse precision
    },
    button: {
      mobile: '40px',
      desktop: '36px',
    },
    input: {
      mobile: '44px',
      desktop: '38px',
    },
  }
};
```

---

### Priority 2: Navigation & Layout (Week 2) 🔴

#### 2.1 Adaptive Navigation Component

**New File**: `src/components/layouts/AdaptiveNavigation.tsx`
```tsx
import { useResponsive } from '../../hooks/useResponsive';
import { TabBar } from '../molecules/TabBar';
import { DesktopSidebar } from './DesktopSidebar';

export function AdaptiveNavigation({
  activeTab,
  onTabChange,
  children
}: AdaptiveNavigationProps) {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    );
  }

  // Mobile: Current bottom tab bar
  return (
    <>
      {children}
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </>
  );
}
```

**New File**: `src/components/layouts/DesktopSidebar.tsx`
```tsx
export function DesktopSidebar({ activeTab, onTabChange }: Props) {
  const designTokens = useDesignTokens();

  const navItems = [
    { id: 'library', icon: Music, label: 'Library', shortcut: '⌘1' },
    { id: 'playlists', icon: List, label: 'Playlists', shortcut: '⌘2' },
    { id: 'upload', icon: Upload, label: 'Upload', shortcut: '⌘U' },
    { id: 'settings', icon: Settings, label: 'Settings', shortcut: '⌘,' },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      backgroundColor: designTokens.colors.surface.secondary,
      borderRight: `1px solid ${designTokens.colors.borders.subtle}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <img src="/logo.png" alt="CoreTet" style={{ width: '120px' }} />
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              width: '100%',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: activeTab === item.id
                ? designTokens.colors.primary.blue
                : 'transparent',
              color: activeTab === item.id
                ? '#ffffff'
                : designTokens.colors.text.primary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '4px',
            }}
          >
            <item.icon size={20} />
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            <span style={{ fontSize: '12px', opacity: 0.6 }}>{item.shortcut}</span>
          </button>
        ))}
      </nav>

      {/* Player (docked in sidebar) */}
      <DesktopPlayerControls />

      {/* User Profile */}
      <UserProfileButton />
    </aside>
  );
}
```

---

#### 2.2 Responsive Player Component

**New File**: `src/components/molecules/AdaptivePlayer.tsx`
```tsx
import { useResponsive } from '../../hooks/useResponsive';
import { PlaybackBar } from './PlaybackBar'; // Mobile player
import { DesktopPlayer } from './DesktopPlayer'; // New desktop player

export function AdaptivePlayer({ track, onClose }: Props) {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <DesktopPlayer
        track={track}
        onClose={onClose}
        position="sidebar" // or "floating" or "expanded"
      />
    );
  }

  // Mobile: Fixed bottom player
  return <PlaybackBar track={track} onClose={onClose} />;
}
```

**New File**: `src/components/molecules/DesktopPlayer.tsx`
```tsx
export function DesktopPlayer({ track, position = 'sidebar' }: Props) {
  const designTokens = useDesignTokens();

  if (position === 'sidebar') {
    // Docked in sidebar (compact view)
    return (
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${designTokens.colors.borders.subtle}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ /* Play/pause */ }}>▶️</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{track.title}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>0:00 / 3:45</div>
          </div>
          <button onClick={/* Expand to full view */}>⤢</button>
        </div>
      </div>
    );
  }

  if (position === 'floating') {
    // Floating corner player (minimized)
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '320px',
        backgroundColor: designTokens.colors.surface.primary,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '16px',
      }}>
        {/* Waveform, controls, expand button */}
      </div>
    );
  }

  // position === 'expanded': Full-page player with waveform
  return <ExpandedPlayer track={track} />;
}
```

---

### Priority 3: Touch → Multi-Input (Week 3-4) 🟡

#### 3.1 TrackRow with Context Menu

**New File**: `src/components/molecules/AdaptiveTrackRow.tsx`
```tsx
import { useResponsive } from '../../hooks/useResponsive';
import { SwipeableTrackRow } from './SwipeableTrackRow';
import { DesktopTrackRow } from './DesktopTrackRow';

export function AdaptiveTrackRow(props: TrackRowProps) {
  const { isDesktop } = useResponsive();

  return isDesktop ? (
    <DesktopTrackRow {...props} />
  ) : (
    <SwipeableTrackRow {...props} />
  );
}
```

**New File**: `src/components/molecules/DesktopTrackRow.tsx`
```tsx
import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export function DesktopTrackRow({ track, onRate, onDelete, onAddToPlaylist }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: isHovered ? 'rgba(0,0,0,0.03)' : 'transparent',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenuOpen(true);
      }}
    >
      {/* Checkbox (visible on hover or when selected) */}
      <input
        type="checkbox"
        style={{
          opacity: isHovered || track.selected ? 1 : 0,
          marginRight: '12px'
        }}
      />

      {/* Waveform thumbnail (desktop-only) */}
      <div style={{ width: '80px', height: '40px', marginRight: '16px' }}>
        <WaveformThumbnail src={track.waveformUrl} />
      </div>

      {/* Track info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{track.title}</div>
        <div style={{ fontSize: '13px', opacity: 0.7 }}>
          {track.duration} • {track.uploadedBy} • {formatDate(track.uploadedAt)}
        </div>
      </div>

      {/* Rating (always visible on desktop) */}
      <div style={{ marginRight: '16px' }}>
        <RatingButtons track={track} onChange={onRate} />
      </div>

      {/* Actions menu (visible on hover) */}
      {isHovered && (
        <button onClick={() => setContextMenuOpen(true)}>
          <MoreVertical size={20} />
        </button>
      )}

      {/* Context menu */}
      {contextMenuOpen && (
        <ContextMenu
          items={[
            { label: 'Add to Playlist', onClick: onAddToPlaylist },
            { label: 'Download', onClick: /* ... */ },
            { label: 'View Versions', onClick: /* ... */ },
            { label: 'Comments', onClick: /* ... */ },
            { label: 'Delete', onClick: onDelete, danger: true },
          ]}
          onClose={() => setContextMenuOpen(false)}
        />
      )}
    </div>
  );
}
```

---

#### 3.2 Keyboard Navigation Hook

**New File**: `src/hooks/useKeyboardNavigation.ts`
```tsx
import { useEffect } from 'react';

export function useKeyboardNavigation({
  items,
  selectedIndex,
  onSelect,
  onAction,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          onSelect(Math.min(selectedIndex + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSelect(Math.max(selectedIndex - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onAction(items[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onSelect(-1); // Deselect
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, onSelect, onAction]);
}
```

**Usage Example**:
```tsx
function TrackList({ tracks }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboardNavigation({
    items: tracks,
    selectedIndex,
    onSelect: setSelectedIndex,
    onAction: (track) => playTrack(track),
  });

  return (
    <div>
      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          selected={i === selectedIndex}
        />
      ))}
    </div>
  );
}
```

---

### Priority 4: Feature Expansion (Week 5-6) 🟢

#### 4.1 Multi-Select & Bulk Operations

**Update**: `src/components/screens/MainDashboard.tsx`
```tsx
// Add to state
const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());
const [bulkActionMode, setBulkActionMode] = useState(false);

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      // Select all visible tracks
      setSelectedTrackIds(new Set(filteredTracks.map(t => t.id)));
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedTrackIds.size > 0) {
        e.preventDefault();
        handleBulkDelete(Array.from(selectedTrackIds));
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedTrackIds, filteredTracks]);

// Bulk actions
const handleBulkDelete = async (trackIds: string[]) => {
  const confirmed = window.confirm(
    `Delete ${trackIds.length} tracks? This cannot be undone.`
  );
  if (!confirmed) return;

  for (const id of trackIds) {
    await AudioUploadService.deleteAudio(id);
  }
  setSelectedTrackIds(new Set());
  refreshTracks();
};

const handleBulkRate = async (trackIds: string[], rating: RatingType) => {
  for (const id of trackIds) {
    await db.ratings.upsert({ track_id: id, rating });
  }
  setSelectedTrackIds(new Set());
};

const handleBulkMove = async (trackIds: string[], targetPlaylistId: string) => {
  for (const id of trackIds) {
    await db.setLists.addTrack(targetPlaylistId, id);
  }
  setSelectedTrackIds(new Set());
};
```

**Bulk Action Toolbar** (shows when tracks selected):
```tsx
{selectedTrackIds.size > 0 && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: designTokens.colors.primary.blue,
    color: '#fff',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 100,
  }}>
    <span>{selectedTrackIds.size} tracks selected</span>

    <button onClick={() => handleBulkRate(Array.from(selectedTrackIds), 'liked')}>
      Rate as Liked
    </button>

    <button onClick={() => handleBulkMove(Array.from(selectedTrackIds), /* playlistId */)}>
      Add to Playlist
    </button>

    <button onClick={() => handleBulkDelete(Array.from(selectedTrackIds))}>
      Delete
    </button>

    <button onClick={() => setSelectedTrackIds(new Set())}>
      Cancel
    </button>
  </div>
)}
```

---

#### 4.2 Advanced Search & Filtering

**New File**: `src/components/molecules/AdvancedFilterPanel.tsx`
```tsx
export function AdvancedFilterPanel({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    rating: [],          // ['liked', 'loved']
    dateRange: null,     // { start: Date, end: Date }
    durationRange: null, // { min: number, max: number }
    uploadedBy: [],      // [userId1, userId2]
    hasComments: null,   // true/false/null
    isHeroVersion: null, // true/false/null
  });

  return (
    <aside style={{ width: '300px', padding: '24px' }}>
      <h3>Filters</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tracks..."
        value={filters.searchText}
        onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
      />

      {/* Rating filter */}
      <div>
        <h4>Rating</h4>
        <label>
          <input type="checkbox" checked={filters.rating.includes('liked')} />
          Liked
        </label>
        <label>
          <input type="checkbox" checked={filters.rating.includes('loved')} />
          Loved
        </label>
      </div>

      {/* Date range */}
      <div>
        <h4>Upload Date</h4>
        <input type="date" placeholder="From" />
        <input type="date" placeholder="To" />
      </div>

      {/* Duration range */}
      <div>
        <h4>Duration</h4>
        <input type="number" placeholder="Min (seconds)" />
        <input type="number" placeholder="Max (seconds)" />
      </div>

      {/* Uploaded by */}
      <div>
        <h4>Uploaded By</h4>
        <select multiple>
          {bandMembers.map(member => (
            <option key={member.id}>{member.name}</option>
          ))}
        </select>
      </div>

      {/* Hero version filter */}
      <div>
        <h4>Version Status</h4>
        <label>
          <input type="radio" name="heroVersion" value="hero" />
          Hero Versions Only
        </label>
        <label>
          <input type="radio" name="heroVersion" value="alternate" />
          Alternate Versions Only
        </label>
      </div>

      {/* Apply/Reset */}
      <button onClick={() => onFilterChange(filters)}>Apply Filters</button>
      <button onClick={() => setFilters(initialFilters)}>Reset</button>
    </aside>
  );
}
```

---

#### 4.3 Desktop Upload Workflow

**New File**: `src/components/organisms/DesktopUploadQueue.tsx`
```tsx
export function DesktopUploadQueue({ bandId, onComplete }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFolderDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = Array.from(e.dataTransfer.items);

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry?.isDirectory) {
        await processDirectory(entry as FileSystemDirectoryEntry);
      } else {
        const file = item.getAsFile();
        if (file) addToQueue(file);
      }
    }
  };

  const processDirectory = async (directory: FileSystemDirectoryEntry) => {
    const reader = directory.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries((entries) => resolve(entries));
    });

    for (const entry of entries) {
      if (entry.isFile) {
        const file = await getFileFromEntry(entry as FileSystemFileEntry);
        addToQueue(file, directory.name); // Preserve folder name
      } else if (entry.isDirectory) {
        await processDirectory(entry as FileSystemDirectoryEntry);
      }
    }
  };

  const addToQueue = (file: File, folderName?: string) => {
    setQueue(prev => [...prev, {
      id: crypto.randomUUID(),
      file,
      folderName,
      status: 'pending', // pending | uploading | complete | error
      progress: 0,
      error: null,
    }]);
  };

  const uploadQueue = async () => {
    setUploading(true);

    for (const item of queue) {
      if (item.status !== 'pending') continue;

      // Update status
      setQueue(prev => prev.map(q =>
        q.id === item.id ? { ...q, status: 'uploading' } : q
      ));

      try {
        const uploadService = new AudioUploadService(
          (progress) => {
            // Update progress for this item
            setQueue(prev => prev.map(q =>
              q.id === item.id ? { ...q, progress: progress.progress } : q
            ));
          },
          { id: currentUser.id }
        );

        await uploadService.uploadAudio(item.file, {
          bandId,
          title: item.file.name.replace(/\.[^/.]+$/, ''),
        });

        // Mark complete
        setQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, status: 'complete', progress: 100 } : q
        ));

      } catch (error) {
        // Mark error
        setQueue(prev => prev.map(q =>
          q.id === item.id ? {
            ...q,
            status: 'error',
            error: error.message
          } : q
        ));
      }
    }

    setUploading(false);
    onComplete();
  };

  return (
    <div
      onDrop={handleFolderDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <h3>Drag Folder or Files Here</h3>
      <p>Or click to browse</p>

      {/* Queue display */}
      {queue.length > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'left' }}>
          <h4>{queue.length} Files in Queue</h4>

          {queue.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              borderBottom: '1px solid #eee'
            }}>
              {/* Status icon */}
              {item.status === 'complete' && '✅'}
              {item.status === 'error' && '❌'}
              {item.status === 'uploading' && '⏳'}
              {item.status === 'pending' && '⏸️'}

              {/* File info */}
              <div style={{ flex: 1 }}>
                <div>{item.file.name}</div>
                {item.folderName && (
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {item.folderName}
                  </div>
                )}
              </div>

              {/* Progress */}
              {item.status === 'uploading' && (
                <div style={{ width: '100px' }}>
                  <progress value={item.progress} max={100} />
                  <span>{item.progress}%</span>
                </div>
              )}

              {/* Error message */}
              {item.error && (
                <div style={{ color: 'red', fontSize: '12px' }}>
                  {item.error}
                </div>
              )}

              {/* Remove button */}
              {item.status === 'pending' && (
                <button onClick={() => removeFromQueue(item.id)}>✕</button>
              )}
            </div>
          ))}

          {/* Upload all button */}
          <button
            onClick={uploadQueue}
            disabled={uploading}
            style={{ marginTop: '16px' }}
          >
            {uploading ? 'Uploading...' : `Upload ${queue.filter(q => q.status === 'pending').length} Files`}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 4. New Desktop Features

### 4.1 Waveform Visualization

**New Dependency**: `wavesurfer.js` or `peaks.js`

**Installation**:
```bash
npm install wavesurfer.js
```

**Component**: `src/components/molecules/WaveformPlayer.tsx`
```tsx
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useRef } from 'react';

export function WaveformPlayer({ audioUrl, onReady }: Props) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: '#e9a63c', // CoreTet gold
      height: 128,
      barWidth: 2,
      barGap: 1,
      responsive: true,
    });

    wavesurfer.current.load(audioUrl);
    wavesurfer.current.on('ready', onReady);

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  return <div ref={waveformRef} />;
}
```

**Usage**: Track detail modals, comparison views, expanded player

---

### 4.2 Table View for Tracks

**Component**: `src/components/organisms/TrackTable.tsx`
```tsx
export function TrackTable({ tracks, onSort, sortBy, sortDirection }: Props) {
  const columns = [
    { id: 'title', label: 'Title', sortable: true, width: '30%' },
    { id: 'duration', label: 'Duration', sortable: true, width: '10%' },
    { id: 'uploadedBy', label: 'Uploaded By', sortable: true, width: '15%' },
    { id: 'uploadedAt', label: 'Date', sortable: true, width: '15%' },
    { id: 'rating', label: 'Rating', sortable: true, width: '10%' },
    { id: 'comments', label: 'Comments', sortable: false, width: '10%' },
    { id: 'actions', label: '', sortable: false, width: '10%' },
  ];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{
          backgroundColor: designTokens.colors.surface.secondary,
          borderBottom: `2px solid ${designTokens.colors.borders.subtle}`
        }}>
          <th style={{ width: '40px', padding: '12px' }}>
            <input type="checkbox" onChange={onSelectAll} />
          </th>
          {columns.map(col => (
            <th
              key={col.id}
              style={{
                width: col.width,
                padding: '12px',
                textAlign: 'left',
                cursor: col.sortable ? 'pointer' : 'default'
              }}
              onClick={() => col.sortable && onSort(col.id)}
            >
              {col.label}
              {col.sortable && sortBy === col.id && (
                <span style={{ marginLeft: '4px' }}>
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tracks.map(track => (
          <tr
            key={track.id}
            style={{
              borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
              ':hover': { backgroundColor: 'rgba(0,0,0,0.03)' }
            }}
          >
            <td style={{ padding: '12px' }}>
              <input type="checkbox" checked={track.selected} />
            </td>
            <td style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <WaveformThumbnail src={track.waveformUrl} size="small" />
                <span>{track.title}</span>
              </div>
            </td>
            <td style={{ padding: '12px' }}>{formatDuration(track.duration)}</td>
            <td style={{ padding: '12px' }}>{track.uploadedBy}</td>
            <td style={{ padding: '12px' }}>{formatDate(track.uploadedAt)}</td>
            <td style={{ padding: '12px' }}>
              <RatingBadge rating={track.rating} />
            </td>
            <td style={{ padding: '12px' }}>
              {track.commentsCount > 0 && (
                <span>{track.commentsCount} 💬</span>
              )}
            </td>
            <td style={{ padding: '12px' }}>
              <DropdownMenu items={/* ... */} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### 4.3 Grid View for Playlists

**Component**: `src/components/organisms/PlaylistGrid.tsx`
```tsx
export function PlaylistGrid({ playlists, onSelect }: Props) {
  const { isDesktop } = useResponsive();

  const columns = isDesktop ? 4 : 2; // 4 columns desktop, 2 mobile

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '24px',
      padding: '24px',
    }}>
      {playlists.map(playlist => (
        <div
          key={playlist.id}
          onClick={() => onSelect(playlist)}
          style={{
            backgroundColor: designTokens.colors.surface.primary,
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            border: `1px solid ${designTokens.colors.borders.subtle}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            ':hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          }}
        >
          {/* Playlist cover (mosaic of track covers) */}
          <div style={{
            width: '100%',
            aspectRatio: '1',
            backgroundColor: '#eee',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {/* TODO: Generate cover from first 4 tracks */}
          </div>

          {/* Playlist info */}
          <h3 style={{ margin: 0, fontSize: '18px' }}>{playlist.title}</h3>
          <p style={{
            margin: '8px 0 0',
            fontSize: '14px',
            opacity: 0.7
          }}>
            {playlist.trackCount} tracks • Updated {formatRelativeDate(playlist.updatedAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

### 4.4 Keyboard Shortcut Overlay

**Component**: `src/components/molecules/KeyboardShortcutsHelp.tsx`
```tsx
export function KeyboardShortcutsHelp({ isOpen, onClose }: Props) {
  const shortcuts = [
    { category: 'Playback', items: [
      { keys: ['Space'], action: 'Play / Pause' },
      { keys: ['→'], action: 'Skip forward 5 seconds' },
      { keys: ['←'], action: 'Skip backward 5 seconds' },
      { keys: ['↑'], action: 'Volume up' },
      { keys: ['↓'], action: 'Volume down' },
    ]},
    { category: 'Navigation', items: [
      { keys: ['⌘', '1'], action: 'Go to Library' },
      { keys: ['⌘', '2'], action: 'Go to Playlists' },
      { keys: ['⌘', 'U'], action: 'Upload Files' },
      { keys: ['⌘', ','], action: 'Settings' },
      { keys: ['⌘', 'F'], action: 'Search' },
    ]},
    { category: 'Selection', items: [
      { keys: ['⌘', 'A'], action: 'Select All' },
      { keys: ['Shift', 'Click'], action: 'Range Select' },
      { keys: ['⌘', 'Click'], action: 'Multi-Select' },
      { keys: ['Esc'], action: 'Deselect All' },
    ]},
    { category: 'Actions', items: [
      { keys: ['⌘', 'N'], action: 'New Playlist' },
      { keys: ['Del'], action: 'Delete Selected' },
      { keys: ['⌘', 'Z'], action: 'Undo' },
      { keys: ['⌘', 'Shift', 'Z'], action: 'Redo' },
      { keys: ['⌘', 'D'], action: 'Download Selected' },
    ]},
  ];

  if (!isOpen) return null;

  return (
    <BaseModal onClose={onClose} size="lg">
      <div style={{ padding: '32px' }}>
        <h2>Keyboard Shortcuts</h2>

        {shortcuts.map(category => (
          <div key={category.category} style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '16px',
              opacity: 0.7
            }}>
              {category.category}
            </h3>

            {category.items.map(item => (
              <div
                key={item.action}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <span>{item.action}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {item.keys.map(key => (
                    <kbd
                      key={key}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </BaseModal>
  );
}
```

**Show with**: `⌘ + /` or `Ctrl + /`

---

## 5. Implementation Roadmap

### Week 1: Foundation 🔴 CRITICAL

**Goal**: Remove mobile constraints, establish responsive infrastructure

**Tasks**:
- [ ] Remove `maxWidth: 425px` from MainDashboard
- [ ] Create `useResponsive()` hook
- [ ] Update design tokens for responsive sizing
- [ ] Test admin screens still work (they already responsive)
- [ ] Establish breakpoint constants (768px, 1024px, 1280px)

**Deliverables**:
- `src/hooks/useResponsive.ts`
- Updated `src/design/designTokens.ts`
- MainDashboard accepts full viewport width

**Testing**:
- [ ] App renders at 1920x1080 without layout breaks
- [ ] Admin screens still display correctly
- [ ] Mobile breakpoint (< 768px) preserves current layout

---

### Week 2: Navigation & Layout 🔴 CRITICAL

**Goal**: Desktop sidebar navigation, adaptive player

**Tasks**:
- [ ] Create `DesktopSidebar` component
- [ ] Create `AdaptiveNavigation` wrapper
- [ ] Build `DesktopPlayer` component (sidebar variant)
- [ ] Update MainDashboard to use adaptive layout
- [ ] Implement keyboard shortcuts for navigation

**Deliverables**:
- `src/components/layouts/DesktopSidebar.tsx`
- `src/components/layouts/AdaptiveNavigation.tsx`
- `src/components/molecules/DesktopPlayer.tsx`
- `src/components/molecules/AdaptivePlayer.tsx`

**Testing**:
- [ ] Sidebar visible on desktop (> 1024px)
- [ ] TabBar visible on mobile (< 768px)
- [ ] Player docked in sidebar (desktop)
- [ ] Player fixed bottom (mobile)
- [ ] Keyboard shortcuts work (⌘1, ⌘2, etc.)

---

### Week 3: Multi-Input Interactions 🟡 HIGH

**Goal**: Replace touch-only with desktop-friendly interactions

**Tasks**:
- [ ] Create `DesktopTrackRow` with hover actions
- [ ] Implement right-click context menu
- [ ] Build `AdaptiveTrackRow` wrapper
- [ ] Add keyboard navigation to track lists
- [ ] Create `useKeyboardNavigation()` hook

**Deliverables**:
- `src/components/molecules/DesktopTrackRow.tsx`
- `src/components/molecules/AdaptiveTrackRow.tsx`
- `src/hooks/useKeyboardNavigation.ts`
- Context menu component

**Testing**:
- [ ] Desktop: Hover reveals actions
- [ ] Desktop: Right-click shows context menu
- [ ] Desktop: Arrow keys navigate tracks
- [ ] Mobile: Swipe gestures still work
- [ ] Keyboard: Enter plays track, Space rates

---

### Week 4: Bulk Operations 🟡 HIGH

**Goal**: Multi-select, bulk actions, desktop power features

**Tasks**:
- [ ] Add checkbox selection to track rows
- [ ] Implement Shift-click range selection
- [ ] Implement Cmd/Ctrl-click multi-selection
- [ ] Create bulk action toolbar
- [ ] Add keyboard shortcuts (⌘A, Del, etc.)

**Deliverables**:
- Checkbox selection system
- Bulk action toolbar component
- Keyboard shortcuts for bulk operations

**Testing**:
- [ ] Checkbox appears on hover (desktop)
- [ ] Shift-click selects range
- [ ] ⌘A selects all
- [ ] Bulk delete works
- [ ] Bulk rate works
- [ ] Selection persists across filter changes

---

### Week 5: Advanced Features 🟢 MEDIUM

**Goal**: Search, filtering, upload enhancements

**Tasks**:
- [ ] Build `AdvancedFilterPanel` component
- [ ] Implement full-text search
- [ ] Create `DesktopUploadQueue` component
- [ ] Add folder upload support
- [ ] Implement per-file progress tracking

**Deliverables**:
- `src/components/molecules/AdvancedFilterPanel.tsx`
- `src/components/organisms/DesktopUploadQueue.tsx`
- Search infrastructure

**Testing**:
- [ ] Search finds tracks by title
- [ ] Filters combine correctly (AND logic)
- [ ] Folder drag-drop uploads all files
- [ ] Progress shows per-file status
- [ ] Failed uploads can be retried

---

### Week 6: Visual Enhancements 🟢 MEDIUM

**Goal**: Waveforms, table view, grid view, shortcuts help

**Tasks**:
- [ ] Integrate WaveSurfer.js for waveforms
- [ ] Create `WaveformPlayer` component
- [ ] Build `TrackTable` component
- [ ] Build `PlaylistGrid` component
- [ ] Create `KeyboardShortcutsHelp` overlay

**Deliverables**:
- `src/components/molecules/WaveformPlayer.tsx`
- `src/components/organisms/TrackTable.tsx`
- `src/components/organisms/PlaylistGrid.tsx`
- `src/components/molecules/KeyboardShortcutsHelp.tsx`

**Testing**:
- [ ] Waveforms render correctly
- [ ] Table view sorts by column
- [ ] Grid view responsive (4 cols → 2 cols)
- [ ] Shortcuts help opens with ⌘/

---

## 6. Technical Architecture

### 6.1 Responsive Breakpoints

```typescript
export const BREAKPOINTS = {
  mobile: 768,    // 0-767px: Mobile phones
  tablet: 1024,   // 768-1023px: Tablets, small laptops
  desktop: 1280,  // 1024-1279px: Standard laptops
  wide: 1920,     // 1280+: Large desktops, 4K
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
```

---

### 6.2 Component Naming Convention

**Pattern**: `Adaptive{ComponentName}` for components with mobile/desktop variants

Examples:
- `AdaptiveNavigation` (DesktopSidebar | TabBar)
- `AdaptivePlayer` (DesktopPlayer | PlaybackBar)
- `AdaptiveTrackRow` (DesktopTrackRow | SwipeableTrackRow)

---

### 6.3 Layout Structure (Desktop)

```
┌─────────────────────────────────────────────────┐
│  DesktopSidebar (240px fixed)                   │
│  ┌──────────────────────────────────┐           │
│  │ Logo                             │           │
│  │                                  │           │
│  │ Navigation Items:                │           │
│  │  - Library                       │           │
│  │  - Playlists                     │           │
│  │  - Upload                        │           │
│  │  - Settings                      │           │
│  │                                  │           │
│  │ (Player docked here)             │           │
│  │                                  │           │
│  │ User Profile                     │           │
│  └──────────────────────────────────┘           │
├─────────────────────────────────────────────────┤
│  Main Content Area (flexible)                   │
│  ┌──────────────────────────────────────────┐   │
│  │ Toolbar (search, filters, sort)          │   │
│  ├──────────────────────────────────────────┤   │
│  │ Content (track list, playlist grid, etc) │   │
│  │                                          │   │
│  │                                          │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  Details Panel (300px collapsible, optional)    │
│  ┌──────────────────────────────────┐           │
│  │ Track Details                    │           │
│  │ Comments                         │           │
│  │ Metadata                         │           │
│  │ Version History                  │           │
│  └──────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
```

---

### 6.4 File Organization (New Files)

```
src/
├── hooks/
│   ├── useResponsive.ts         # NEW: Breakpoint detection
│   ├── useKeyboardNavigation.ts # NEW: Arrow key navigation
│   └── useInputMethod.ts        # NEW: Touch vs mouse detection
│
├── components/
│   ├── layouts/                 # NEW: Layout containers
│   │   ├── AdaptiveNavigation.tsx
│   │   ├── DesktopSidebar.tsx
│   │   ├── DesktopLayout.tsx
│   │   └── MobileLayout.tsx
│   │
│   ├── molecules/
│   │   ├── AdaptivePlayer.tsx   # NEW: Player wrapper
│   │   ├── DesktopPlayer.tsx    # NEW: Desktop player
│   │   ├── AdaptiveTrackRow.tsx # NEW: TrackRow wrapper
│   │   ├── DesktopTrackRow.tsx  # NEW: Desktop track row
│   │   ├── AdvancedFilterPanel.tsx # NEW: Desktop filters
│   │   ├── WaveformPlayer.tsx   # NEW: Waveform viz
│   │   └── KeyboardShortcutsHelp.tsx # NEW: Shortcuts
│   │
│   └── organisms/
│       ├── DesktopUploadQueue.tsx # NEW: Upload queue
│       ├── TrackTable.tsx         # NEW: Table view
│       └── PlaylistGrid.tsx       # NEW: Grid view
│
└── constants/
    └── breakpoints.ts            # NEW: Breakpoint constants
```

---

## 7. Success Metrics

### 7.1 Performance Metrics

**Desktop Load Time**:
- Target: < 2 seconds to interactive
- Current: Unknown (mobile-optimized)

**Desktop Rendering**:
- 60fps scrolling with 50+ tracks visible
- Smooth drag-drop operations
- No layout shift on window resize

---

### 7.2 Feature Adoption Metrics

**Desktop Features** (track usage):
- % users using keyboard shortcuts
- % uploads via folder drag-drop
- % users multi-selecting tracks
- % time spent in table view vs. list view

**Power User Indicators**:
- Average tracks uploaded per session (desktop vs. mobile)
- Average playlist size (desktop vs. mobile)
- Bulk operation usage frequency

---

### 7.3 User Experience Metrics

**Desktop-Specific**:
- % users expanding viewport beyond 425px
- Average session length (desktop vs. mobile)
- Feature discovery rate (context menus, shortcuts)

**Compatibility**:
- Mobile users still functional (no regressions)
- Tablet users get appropriate mid-point experience

---

## 8. Deferred to Mobile Phase

**DO NOT IMPLEMENT NOW** (4-6 weeks out):

- Touch gestures beyond existing SwipeableTrackRow
- Offline-first architecture
- Native file pickers (Capacitor)
- Camera/microphone access
- iOS-specific optimizations
- Native audio controls
- Haptic feedback
- Pull-to-refresh
- Bottom sheet animations
- Safe area insets (notch/home indicator)

**Keep Existing**:
- SwipeableTrackRow (will be mobile fallback)
- TabBar (will be mobile fallback)
- PlaybackBar (will be mobile fallback)
- Capacitor.isNativePlatform() checks

---

## 9. Migration Strategy

### 9.1 Incremental Approach

**Phase 1: Foundation** (no user-facing changes)
- Infrastructure only
- Tests pass on desktop AND mobile
- Feature flag for desktop layout (disabled by default)

**Phase 2: Opt-In Beta** (internal testing)
- Desktop users see new layout
- Mobile users unchanged
- Monitor for issues

**Phase 3: Gradual Rollout**
- 10% desktop users
- 50% desktop users
- 100% desktop users
- Mobile always uses legacy layout

**Phase 4: Cleanup**
- Remove feature flags
- Archive unused mobile-first components
- Final optimization pass

---

### 9.2 Rollback Plan

**If desktop conversion breaks critical flows**:

1. **Immediate**: Feature flag off (revert to 425px mobile layout)
2. **Short-term**: Fix specific issues, re-enable for subset of users
3. **Long-term**: Rethink approach if fundamentally broken

**Rollback Triggers**:
- Upload success rate drops > 10%
- Playback errors increase > 5%
- Session time decreases > 20%
- User complaints spike

---

### 9.3 A/B Testing Plan

**Test Cohorts**:
- **Control**: Current mobile-first (425px) layout
- **Variant A**: Desktop-first with sidebar
- **Variant B**: Desktop-first with top nav (alternative)

**Key Metrics**:
- Track upload count
- Playlist creation rate
- Session duration
- Feature discovery (keyboard shortcuts, bulk ops)

**Decision Criteria**:
- Variant must match or exceed control on core metrics
- Desktop-specific features must show > 20% adoption
- No increase in error rates

---

## 10. Conclusion

CoreTet is currently **optimized for mobile phones** with a 425px-wide viewport constraint that prevents desktop users from accessing the full power of the platform. This plan outlines a **6-week incremental migration** to desktop-first design while preserving mobile compatibility.

**Key Success Factors**:
1. ✅ Admin screens already prove responsive patterns work
2. ✅ Incremental approach reduces risk
3. ✅ Mobile fallbacks preserve existing UX
4. ✅ Keyboard shortcuts unlock power user workflows
5. ✅ Multi-select and bulk operations align with desktop expectations

**Next Steps**:
1. Review and approve this plan
2. Prioritize Weeks 1-2 (Foundation + Navigation) - CRITICAL
3. Establish success metrics and A/B test framework
4. Begin Week 1 implementation: Remove hard constraints

**Estimated Timeline**: 6 weeks to full desktop-first launch
**Risk Level**: Medium (mitigated by incremental rollout)
**Expected Impact**: High (unlocks desktop power users, aligns with FrameIO-for-audio positioning)

---

**Document Status**: Ready for Review & Implementation
**Author**: Claude Code (Architecture Analysis)
**Date**: January 25, 2026
