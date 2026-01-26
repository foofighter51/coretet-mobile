# Web Redesign Execution Plan
## Comprehensive Mobile-to-Desktop Transformation

**Date**: January 25, 2026
**Status**: Ready to Execute
**Reference**: WEB_OPTIMIZATION_PLAN.md (comprehensive strategy)

---

## Current Status

### ✅ Completed
- Storage quota system (backend + UI)
- Removed `maxWidth: 425px` from 6 screen files (incomplete - done in isolation)

### ❌ Incomplete Foundation
- No responsive hooks (`useResponsive`)
- No adaptive layouts
- No desktop navigation
- No desktop-friendly interactions
- Touch-only gestures block desktop users

### 🚨 Critical Issue
**You identified the core problem**: We're making piecemeal UI changes (like adding track deletion) without a cohesive desktop-first strategy. This creates an inconsistent, half-broken experience.

---

## Execution Philosophy

**"All or Nothing" Approach:**
1. Build the foundation first (responsive infrastructure)
2. Then systematically convert each component
3. Test comprehensively at each phase
4. Don't ship half-done features

**No More Band-Aids:**
- ❌ Don't add desktop track deletion without redesigning track rows
- ❌ Don't add hover states without responsive detection
- ❌ Don't modify individual components without the layout system

---

## Phase 1: Foundation (Week 1)
**Goal**: Establish responsive infrastructure that ALL components will use

### Step 1.1: Create Responsive Hook ✅ Ready
**File**: `src/hooks/useResponsive.ts`

```typescript
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
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height: typeof window !== 'undefined' ? window.innerHeight : 768,
      breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height: window.innerHeight,
        breakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

// Convenience hook for common checks
export function useIsDesktop(): boolean {
  const { isDesktop } = useResponsive();
  return isDesktop;
}

export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}
```

**Testing**:
- [ ] Import in MainDashboard
- [ ] Console log breakpoint on resize
- [ ] Verify 767px = mobile, 768px = tablet, 1025px = desktop

---

### Step 1.2: Update Design Tokens
**File**: `src/design/designTokens.ts`

Add to existing `designTokens` object:

```typescript
export const designTokens = {
  // ... existing tokens ...

  // NEW: Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    wide: 1920,
  },

  // NEW: Layout dimensions
  layout: {
    sidebar: {
      width: '240px',
      widthCollapsed: '60px',
    },
    header: {
      height: '64px',
    },
    player: {
      height: '80px',
    },
    tabBar: {
      height: '60px',
    },
  },
};
```

**Testing**:
- [ ] Import designTokens in new components
- [ ] Verify breakpoints are numbers, not strings

---

### Step 1.3: Revert Incomplete maxWidth Removals
**Why**: We removed maxWidth without adding responsive layouts. This stretched mobile components to desktop width incorrectly.

**Files to Revert** (temporarily):
- MainDashboard.tsx
- BandActionScreen.tsx
- FeedbackBoard.tsx
- PublicPlaylistView.tsx
- BandCreationScreen.tsx
- BandJoiningScreen.tsx

**Action**: Restore `maxWidth: '425px'` with conditional logic:

```tsx
import { useResponsive } from '../../hooks/useResponsive';

const { isMobile } = useResponsive();

const baseStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: isMobile ? '425px' : 'none', // Conditional instead of fixed
  height: '100vh',
  margin: '0 auto',
};
```

**Testing**:
- [ ] Mobile (< 768px): Layout looks normal at 425px
- [ ] Desktop (> 1024px): Layout expands to full width

---

### Step 1.4: Foundation Checkpoint
**Before proceeding to Phase 2, verify**:
- [ ] `useResponsive()` hook works
- [ ] Design tokens include breakpoints
- [ ] All screens use conditional maxWidth
- [ ] Mobile breakpoint preserves existing layout
- [ ] Desktop breakpoint shows full width

---

## Phase 2: Navigation & Layout (Week 2)
**Goal**: Desktop sidebar, adaptive player, proper layout structure

### Step 2.1: Create Desktop Sidebar Component
**File**: `src/components/layouts/DesktopSidebar.tsx`

```tsx
import React from 'react';
import { Music, Users, Upload, Settings, LogOut } from 'lucide-react';
import { useDesignTokens } from '../../design/useDesignTokens';

interface DesktopSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentPage,
  onNavigate,
  onSignOut,
}) => {
  const tokens = useDesignTokens();

  const navItems = [
    { id: 'playlists', label: 'Playlists', icon: Music },
    { id: 'bands', label: 'Bands', icon: Users },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: tokens.layout.sidebar.width,
        height: '100vh',
        backgroundColor: tokens.colors.surface.secondary,
        borderRight: `1px solid ${tokens.colors.borders.default}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: tokens.spacing.lg,
          borderBottom: `1px solid ${tokens.colors.borders.subtle}`,
        }}
      >
        <h1
          style={{
            fontSize: tokens.typography.fontSizes.h3,
            fontWeight: tokens.typography.fontWeights.bold,
            color: tokens.colors.text.primary,
          }}
        >
          CoreTet
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: tokens.spacing.md }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.md,
              padding: tokens.spacing.md,
              marginBottom: tokens.spacing.xs,
              backgroundColor:
                currentPage === item.id
                  ? tokens.colors.surface.active
                  : 'transparent',
              border: 'none',
              borderRadius: tokens.borderRadius.sm,
              color: tokens.colors.text.primary,
              cursor: 'pointer',
              fontSize: tokens.typography.fontSizes.body,
              fontWeight:
                currentPage === item.id
                  ? tokens.typography.fontWeights.semibold
                  : tokens.typography.fontWeights.normal,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = tokens.colors.surface.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sign Out */}
      <div
        style={{
          padding: tokens.spacing.md,
          borderTop: `1px solid ${tokens.colors.borders.subtle}`,
        }}
      >
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.md,
            padding: tokens.spacing.md,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: tokens.borderRadius.sm,
            color: tokens.colors.text.secondary,
            cursor: 'pointer',
            fontSize: tokens.typography.fontSizes.body,
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
```

---

### Step 2.2: Create Adaptive Layout Wrapper
**File**: `src/components/layouts/AdaptiveLayout.tsx`

```tsx
import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopSidebar } from './DesktopSidebar';
import { TabBar } from '../molecules/TabBar';
import { useDesignTokens } from '../../design/useDesignTokens';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  onSignOut,
}) => {
  const { isDesktop, isMobile } = useResponsive();
  const tokens = useDesignTokens();

  if (isDesktop) {
    // Desktop: Sidebar + Main Content
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <DesktopSidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
        />
        <main
          style={{
            marginLeft: tokens.layout.sidebar.width,
            flex: 1,
            overflowY: 'auto',
            backgroundColor: tokens.colors.surface.tertiary,
          }}
        >
          {children}
        </main>
      </div>
    );
  }

  // Mobile: Bottom Tab Bar
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <main
        style={{
          height: `calc(100vh - ${tokens.layout.tabBar.height})`,
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
      <TabBar activeTab={currentPage} onTabChange={onNavigate} />
    </div>
  );
};
```

---

### Step 2.3: Integrate Adaptive Layout in MainDashboard
**File**: `src/components/screens/MainDashboard.tsx`

Find the outermost container (around line 221) and wrap with AdaptiveLayout:

```tsx
import { AdaptiveLayout } from '../layouts/AdaptiveLayout';

export const MainDashboard = () => {
  // ... existing state ...

  return (
    <AdaptiveLayout
      currentPage={activeTab}
      onNavigate={setActiveTab}
      onSignOut={handleSignOut}
    >
      {/* Existing content goes here */}
      {/* Remove TabBar - now handled by AdaptiveLayout */}
    </AdaptiveLayout>
  );
};
```

**Testing**:
- [ ] Desktop (> 1024px): Shows sidebar on left
- [ ] Mobile (< 768px): Shows bottom tab bar
- [ ] Sidebar navigation switches pages
- [ ] Active page highlighted in sidebar
- [ ] Sign out button works

---

### Step 2.4: Phase 2 Checkpoint
**Before proceeding to Phase 3, verify**:
- [ ] Sidebar renders on desktop
- [ ] Sidebar navigation functional
- [ ] Mobile still shows bottom tabs
- [ ] Content area scrolls independently
- [ ] No layout breaks at any breakpoint

---

## Phase 3: Desktop Track Interactions (Week 3)
**Goal**: Replace touch gestures with mouse/keyboard-friendly controls

### Step 3.1: Create Desktop Track Row
**File**: `src/components/molecules/DesktopTrackRow.tsx`

Features:
- Hover reveals actions (delete, rate, comment)
- Right-click context menu
- Inline rating buttons
- Click to open details
- Checkbox for multi-select

(See WEB_TRACK_DELETION.md for full implementation)

---

### Step 3.2: Create Adaptive Track Row
**File**: `src/components/molecules/AdaptiveTrackRow.tsx`

```tsx
import { useResponsive } from '../../hooks/useResponsive';
import { DesktopTrackRow } from './DesktopTrackRow';
import { SwipeableTrackRow } from './SwipeableTrackRow';

export const AdaptiveTrackRow = (props) => {
  const { isDesktop } = useResponsive();

  return isDesktop ? (
    <DesktopTrackRow {...props} />
  ) : (
    <SwipeableTrackRow {...props} />
  );
};
```

---

### Step 3.3: Replace Track Rows in MainDashboard
**File**: `src/components/screens/MainDashboard.tsx`

Find where `SwipeableTrackRow` is used (around line 1522):

```tsx
// BEFORE:
<SwipeableTrackRow
  track={item.tracks}
  // ... props
/>

// AFTER:
<AdaptiveTrackRow
  track={item.tracks}
  // ... existing props
  onDelete={() => handlePermanentlyDeleteTrack(item.tracks.id)}
  onClick={() => handleOpenTrackDetail(item.tracks)}
/>
```

Add handler:

```tsx
const handlePermanentlyDeleteTrack = async (trackId: string) => {
  try {
    await AudioUploadService.deleteAudio(trackId);

    // Stop playback if current track was deleted
    if (currentTrack?.id === trackId && isPlaying) {
      handlePlayPause();
    }

    // Reload tracks
    if (currentSetList) {
      await loadPlaylistTracks(currentSetList.id);
    }

    showSuccess('Track deleted successfully');
  } catch (error) {
    showError('Failed to delete track');
  }
};
```

---

### Step 3.4: Phase 3 Checkpoint
**Before proceeding to Phase 4, verify**:
- [ ] Desktop: Hover shows delete button
- [ ] Desktop: Click opens track details
- [ ] Desktop: Delete works and updates quota
- [ ] Mobile: Swipe gestures still work
- [ ] Both: Playback controls work

---

## Phase 4: Bulk Operations (Week 4)
**Goal**: Multi-select, keyboard shortcuts, power user features

### Step 4.1: Add Multi-Select System
- Checkbox appears on hover (desktop)
- Shift-click range selection
- Cmd/Ctrl-click multi-selection
- Bulk action toolbar

### Step 4.2: Keyboard Shortcuts
- Space: Play/pause
- Arrow keys: Navigate tracks
- Delete: Delete selected
- Cmd+A: Select all

### Step 4.3: Bulk Operations
- Bulk delete
- Bulk rate
- Bulk move to playlist
- Bulk download

---

## Testing Strategy

### Per-Phase Testing
After each phase, test at these breakpoints:
- 375px (iPhone SE - mobile)
- 768px (iPad - tablet)
- 1024px (iPad Pro - desktop boundary)
- 1920px (Desktop - full desktop)

### Regression Testing
After each phase, verify:
- Mobile layout still works
- Touch gestures still work
- Existing features don't break
- Performance is acceptable

### User Acceptance
- Admin tests on desktop (1920x1080)
- Beta tester tests on mobile (iOS)
- Cross-browser: Chrome, Safari, Firefox

---

## Decision Points

### Ready to Start?
**Option A**: Execute Phase 1 now (1-2 hours)
- Create useResponsive hook
- Update design tokens
- Add conditional maxWidth

**Option B**: Review strategy first
- Discuss any concerns
- Adjust timeline
- Clarify requirements

**Option C**: Partial implementation
- Just do sidebar (Phase 2)
- Skip keyboard shortcuts
- Mobile stays as-is

---

## Recommendation

**Execute systematically in order**:
1. Phase 1 (Foundation) - 1-2 hours
2. Test Phase 1 thoroughly
3. Phase 2 (Layouts) - 3-4 hours
4. Test Phase 2 thoroughly
5. Phase 3 (Interactions) - 4-5 hours
6. Test Phase 3 thoroughly
7. Phase 4 (Bulk ops) - 3-4 hours
8. Final comprehensive testing

**Total Time**: 12-15 hours over 1-2 weeks

**Don't rush**. Build foundation properly, then everything else becomes easy.

---

## What Would You Like to Do?

1. **Start Phase 1 now** - I'll create the hooks and update design tokens
2. **Review the plan first** - Discuss any changes or concerns
3. **Different approach** - Suggest alternative strategy
4. **Show me a demo first** - I'll create a proof-of-concept component

Let me know how you'd like to proceed!
