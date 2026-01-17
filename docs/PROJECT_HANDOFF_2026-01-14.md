# CoreTet Band - Project Handoff Documentation
## Date: 2026-01-14

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current State](#current-state)
3. [Tech Stack & Architecture](#tech-stack--architecture)
4. [Development Environment](#development-environment)
5. [Database & Backend](#database--backend)
6. [Key Features Implemented](#key-features-implemented)
7. [Recent Work (Jan 7-14, 2026)](#recent-work-jan-7-14-2026)
8. [Critical Files & Locations](#critical-files--locations)
9. [Development Workflows](#development-workflows)
10. [Known Issues & Next Steps](#known-issues--next-steps)
11. [Important Documentation](#important-documentation)

---

## Project Overview

**Project Name**: CoreTet
**Product**: Mobile-first music collaboration platform for bands
**Current Phase**: Pre-beta testing preparation
**Repository**: `/Users/exleymini/Apps/coretet-band`
**Branch**: `master`
**Last Commit**: `bba122f0` - "Complete dark mode implementation and playlist UX improvements"

### Product Vision
CoreTet is a music collaboration tool that allows band members to:
- Upload and share track versions (rehearsals, demos, live recordings)
- Organize tracks into playlists/set lists
- Provide timestamped feedback on tracks
- Rate tracks (liked/loved system)
- Collaborate across multiple bands
- Keep all music private within the band

### Core Value Proposition
- **Version tracking without redundancy** - Upload once, use in multiple playlists
- **Timestamped feedback** - Comment at specific points in tracks
- **Private collaboration** - Music stays within the band
- **Multi-band support** - Musicians can be in multiple bands

---

## Current State

### Build Status
- ✅ **Builds successfully** - No compilation errors
- ✅ **iOS app synced** - Latest build synced via Capacitor
- ✅ **Dark mode complete** - All components themed with V8 logo colors
- ✅ **App icon updated** - V8 logo as iOS app icon
- ⚠️ **Ready for iOS testing** - Needs manual testing in Xcode

### Development Servers
Currently running:
- Dev server on `http://localhost:3000/` (Vite)
- Background processes: 541590, 4a57e8

### Recent Milestone
**Jan 14, 2026** - Completed comprehensive dark mode implementation and playlist UX improvements:
- Dark mode now default across entire app
- "Add from Library" feature prevents redundant uploads
- "View All Tracks" button for quick library access
- V8 logo integration (gold #e9a63c, navy #1a2332, white #ffffff)

---

## Tech Stack & Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 4.5.14
- **Routing**: React Router DOM
- **Styling**: CSS-in-JS with design tokens system
- **Mobile**: Capacitor 7.x for iOS/Android
- **Icons**: Lucide React
- **Audio**: HTML5 Audio API + Capacitor plugins

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (phone/email)
- **Storage**: Supabase Storage (audio files)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Auto-generated from database schema

### Key Libraries
```json
{
  "@capacitor/app": "7.1.0",
  "@capacitor/filesystem": "7.1.4",
  "@capacitor/share": "7.0.2",
  "@capawesome/capacitor-file-picker": "7.2.0",
  "react": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "lucide-react": "^0.468.0"
}
```

### Architecture Pattern
**Atomic Design Structure**:
```
src/
├── components/
│   ├── atoms/          # Button, Input, Spinner
│   ├── molecules/      # TrackRow, TabBar, Modals
│   ├── screens/        # MainDashboard, PhoneAuthScreen
│   └── ui/             # BaseModal, DropdownMenu
├── contexts/           # React Context for state
├── design/             # Design tokens & theme system
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

---

## Development Environment

### Prerequisites
- Node.js (version in package.json)
- npm
- Xcode (for iOS development)
- Supabase CLI (for database work)

### Environment Variables
Required in `.env`:
```bash
VITE_SUPABASE_URL=https://tvvztlizyciaafqkigwe.supabase.co
VITE_SUPABASE_ANON_KEY=[your-key]
SUPABASE_SERVICE_ROLE_KEY=[your-key]
SUPABASE_PROJECT_ID=tvvztlizyciaafqkigwe
```

### Build Commands
```bash
# Development
npm run dev                    # Start dev server

# Build & Deploy
npm run build                  # Build for production
npx cap sync ios              # Sync to iOS
npx cap sync android          # Sync to Android

# Database
npm run db:types              # Generate TypeScript types from DB
npm run db:types:check        # Verify types are up to date
./scripts/generate-types.sh   # Direct type generation script

# Testing
npm run test:qa               # Run QA test suite
```

### Project Structure
```
coretet-band/
├── docs/                      # All documentation
│   ├── eod-status/           # Daily status reports
│   ├── dec-dev/              # December dev docs
│   ├── business/             # Business docs
│   ├── logos/                # Brand assets
│   └── screenshots/          # App screenshots
├── ios/                       # iOS native project
│   └── App/
│       ├── App.xcodeproj/    # Xcode project
│       └── App/Assets.xcassets/  # iOS assets
├── lib/                       # Supabase client
│   ├── supabase.ts           # Client initialization
│   └── database.types.ts     # Generated DB types
├── public/                    # Static assets
│   ├── logo.png              # Dark mode logo
│   └── logo-light.png        # Light mode logo
├── src/                       # Source code
│   ├── components/           # React components
│   ├── contexts/             # State management
│   ├── design/               # Design system
│   ├── types/                # TypeScript types
│   └── utils/                # Utilities
├── supabase/                  # Database migrations
│   └── migrations/           # SQL migration files
└── scripts/                   # Build scripts
    ├── generate-types.sh     # DB type generation
    └── backup-database.sh    # DB backup
```

---

## Database & Backend

### Supabase Project
- **Project ID**: `tvvztlizyciaafqkigwe`
- **URL**: `https://tvvztlizyciaafqkigwe.supabase.co`

### Core Tables
```
profiles              # User profiles (name, phone, email)
bands                 # Band information
band_members          # User-band relationships (with roles)
band_invites          # Pending invitations
tracks                # Audio files metadata
set_lists             # Playlists/set lists
set_list_entries      # Tracks within playlists
track_ratings         # User ratings (liked/loved)
comments              # Track feedback with timestamps
feedback              # Additional feedback system
```

### Database Workflow
1. **Make schema changes** in Supabase Dashboard
2. **Generate types**: `npm run db:types`
3. **Update docs**: Edit `docs/DATABASE_SCHEMA.md`
4. **Commit types + code** together

### Type-Safe Database Access
```typescript
import { db } from '../lib/supabase';

// Auto-generated, type-safe database operations
const { data: tracks, error } = await db.tracks.getByUser(userId);
const { data: playlist } = await db.setLists.create({ title: 'New Playlist' });
```

### RLS (Row Level Security)
All tables have RLS policies enforcing:
- Users only see their own data
- Band members only see their band's content
- Admins/owners have additional permissions

---

## Key Features Implemented

### 1. Authentication System
**Location**: `src/components/screens/PhoneAuthScreen.tsx`
- Phone number authentication via Supabase
- Email verification flow
- Onboarding with name collection
- Deep link handling for email verification

### 2. Multi-Band Support
**Location**: `src/contexts/BandContext.tsx`, `src/components/molecules/BandModal.tsx`
- Create/join multiple bands
- Switch between bands
- Band invitation system via email
- Role-based permissions (owner/admin/member)

### 3. Track Management
**Location**: `src/components/screens/MainDashboard.tsx`
- Upload audio files (MP3, WAV, M4A, etc.)
- Track metadata (title, artist, duration)
- Album art support
- Audio playback with HTML5 Audio API
- Track version grouping via keywords

### 4. Playlist System (Set Lists)
**Location**: `src/contexts/SetListContext.tsx`
- Create playlists/set lists
- Add tracks to playlists (no duplicates within playlist)
- **Add from Library** - Reuse existing tracks across playlists
- Reorder tracks via drag & drop
- Sort by: name, duration, rating, position
- Filter by rating (all, loved, liked, listened, unrated)

### 5. Rating System
**Location**: `src/components/molecules/SwipeableTrackRow.tsx`
- Swipe-to-rate interaction
- Three rating levels: liked, loved, listened
- Visual feedback with color coding
- Persistent across sessions

### 6. Feedback & Comments
**Location**: `src/components/molecules/TrackDetailModal.tsx`
- Timestamped comments on tracks
- Keyword tagging system
- Version grouping via keywords

### 7. Dark Mode
**Location**: `src/design/darkTheme.ts`, `src/design/useDesignTokens.ts`
- Complete dark mode implementation
- V8 logo color palette (gold, navy, white)
- Theme-aware logo switching
- Dynamic theming via React hooks
- Default dark mode

### 8. View All Tracks
**Location**: `src/components/screens/MainDashboard.tsx` (lines 1718-1735)
- "View All" button in playlist view
- Shows all band tracks in detail format
- Read-only view with sort/filter
- No upload/edit controls

---

## Recent Work (Jan 7-14, 2026)

### Session 1: Jan 7 (Dark Mode Foundation)
- Implemented dark theme based on V8 logo colors
- Created `darkTheme.ts` with exact color specifications
- Made dark mode the default theme
- Added theme-aware logo switching

### Session 2: Jan 10 (Dark Mode Debugging)
**Problem**: iOS blank screen crash - `ReferenceError: Can't find variable: designTokens`

**Root Cause**: Module-level constants like:
```typescript
// ❌ WRONG - Evaluated before React context available
const baseStyle = { fontFamily: designTokens.typography.fontFamily };
```

**Solution**: Move all constants inside component functions:
```typescript
// ✅ CORRECT - Evaluated after hooks
export function Component() {
  const designTokens = useDesignTokens();
  const baseStyle = { fontFamily: designTokens.typography.fontFamily };
  // ...
}
```

**Files Fixed**:
- WelcomeScreen, CodeVerificationScreen, PhoneVerificationScreen
- WaitlistScreen, BandJoiningScreen, BandCreationScreen
- MainDashboard

### Session 3: Jan 12-14 (Dark Mode Completion + UX Improvements)

#### Dark Mode Coverage
Converted 10+ components from static `import { designTokens }` to dynamic `useDesignTokens()` hook:
- SortButton, FilterButton, AudioUploader
- PlaybackBar, TabBar, SwipeableTrackRow
- BaseModal, BottomSheetModal, DropdownMenu
- TrackDetailModal, EmailConfirmedScreen

#### App Icon Update
- Resized V8 logo to 1024x1024
- Replaced iOS app icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

#### Add from Library Feature
**Problem**: Users forced to upload tracks multiple times for different playlists

**Solution**:
- Updated `UploadButton.tsx` to show dropdown menu:
  - "Add from Library" - Opens TrackSelectorModal
  - "Upload New" - Opens file picker
- Button label changes based on context ("Add" in playlists, "Upload" elsewhere)
- Wired up existing TrackSelectorModal component

#### View All Tracks Feature
**Problem**: No way to view all band tracks without creating a playlist

**Solution**:
- Added "View All" button next to "+ New" in playlist list
- Shows all `bandScopedTracks` in detail view format
- Header displays "All Tracks"
- Read-only mode (no upload/edit/reorder)
- Supports sort and filter operations
- Back button returns to playlist list

**Implementation Details**:
```typescript
// State
const [showAllTracks, setShowAllTracks] = useState(false);

// View All button handler
onClick={() => {
  setShowAllTracks(true);
  setViewMode('detail');
  setCurrentSetList(null);
}}

// Track list uses bandScopedTracks when showAllTracks=true
const tracksToFilter = showAllTracks
  ? bandScopedTracks.map((track, index) => ({
      id: track.id,
      tracks: track,
      position: index,
      set_list_id: null,
    }))
  : playlistTracks;
```

### Commit Summary
**Commit `bba122f0`** (pushed to origin/master):
- 53 files changed
- +1922 lines added
- -220 lines removed
- Dark mode complete
- App icon updated
- Add from Library implemented
- View All Tracks implemented

---

## Critical Files & Locations

### Core Application Files
```
src/App.tsx                          # App root with routing
src/main.tsx                         # Entry point

# Authentication
src/contexts/AuthContext.tsx         # Auth state management
src/components/screens/PhoneAuthScreen.tsx
src/components/screens/OnboardingScreen.tsx
src/components/screens/EmailConfirmedScreen.tsx

# Main Application
src/components/screens/MainDashboard.tsx      # Primary app screen (1900+ lines)
src/contexts/SetListContext.tsx               # Playlist state
src/contexts/BandContext.tsx                  # Band state

# Design System
src/design/designTokens.ts           # Base design tokens
src/design/darkTheme.ts              # Dark theme colors
src/design/useDesignTokens.ts        # Dynamic theme hook
src/contexts/ThemeContext.tsx        # Theme state

# Key Components
src/components/molecules/SwipeableTrackRow.tsx    # Track with rating
src/components/molecules/PlaybackBar.tsx          # Audio player
src/components/molecules/TabBar.tsx               # Bottom navigation
src/components/molecules/UploadButton.tsx         # Upload dropdown
src/components/molecules/TrackDetailModal.tsx     # Track details
src/components/ui/BaseModal.tsx                   # Modal base
src/components/ui/DropdownMenu.tsx                # Dropdown base
```

### Database & Backend
```
lib/supabase.ts                      # Supabase client init
lib/database.types.ts                # Auto-generated DB types
supabase/migrations/                 # Database migrations
scripts/generate-types.sh            # Type generation script
```

### Documentation
```
docs/eod-status/2026-01-14-eod.md              # Latest status
docs/dec-dev/pre-tester-priority-checklist.md  # Ship-blocking issues
docs/BETA_READY_CHECKLIST.md                   # Beta readiness
docs/DATABASE_SCHEMA.md                        # DB schema docs
docs/SUPABASE_EMAIL_CONFIGURATION.md           # Email setup guide
```

### Configuration
```
capacitor.config.ts                  # Capacitor config
vite.config.ts                       # Vite build config
tsconfig.json                        # TypeScript config
package.json                         # Dependencies & scripts
.env                                 # Environment variables
```

---

## Development Workflows

### Daily Development Cycle
1. **Start dev server**: `npm run dev`
2. **Make changes** in `src/`
3. **Test in browser** at `localhost:3000`
4. **Build**: `npm run build`
5. **Sync to iOS**: `npx cap sync ios`
6. **Test in Xcode** on device/simulator

### Database Changes
1. **Modify schema** in Supabase Dashboard
2. **Generate types**: `npm run db:types`
3. **Update docs**: `docs/DATABASE_SCHEMA.md`
4. **Test type safety** in TypeScript
5. **Commit together**: types + code + docs

### Component Development
1. **Choose atomic level**: atom, molecule, or screen
2. **Create in appropriate folder**: `src/components/atoms/`, etc.
3. **Use design tokens**: `const designTokens = useDesignTokens();`
4. **Follow naming**: PascalCase for components
5. **Export from index**: Add to barrel export if needed

### Theme/Styling Pattern
```typescript
// ✅ CORRECT - Dynamic theme-aware styling
import { useDesignTokens } from '../../design/useDesignTokens';

export function MyComponent() {
  const designTokens = useDesignTokens();

  return (
    <div style={{
      backgroundColor: designTokens.colors.surface.primary,
      color: designTokens.colors.text.primary,
      padding: designTokens.spacing.md,
    }}>
      Content
    </div>
  );
}
```

### Git Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit with detailed message
git commit -m "feat: Description

- Bullet points of changes
- Reference files modified
- Note any breaking changes

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push
```

---

## Known Issues & Next Steps

### Immediate Testing Needed (HIGH PRIORITY)
From `docs/eod-status/2026-01-14-eod.md`:
1. ✅ Dark mode thoroughly tested on iOS device
2. ✅ "Add from Library" functionality with multiple playlists
3. ✅ "View All Tracks" sorting and filtering
4. ✅ App icon displays correctly on iOS home screen

### Ship-Blocking Issues (PHASE A)
From `docs/dec-dev/pre-tester-priority-checklist.md`:

**A1. Fix AuthContext Form State** (1-2 hours)
- Form inputs in Context cause app-wide re-renders
- Move to local state in components
- Status: ⏸️ Not started

**A2. Add Error Boundaries** (1 hour)
- Prevent white screen crashes
- User-friendly error messages
- Status: ⏸️ Not started

**A3. Audit Critical User Flows** (1-2 hours)
- Test auth, playlist, playback flows
- Add graceful error handling
- Status: ⏸️ Not started

**A4. Network Error Handling** (1-2 hours)
- Offline detection
- Retry mechanisms
- Status: ⏸️ Not started

**A5. Offline Mode Messaging** (30 min)
- Clear "offline" indicators
- Status: ⏸️ Not started

**A6. Loading States** (1 hour)
- Add spinners/skeletons everywhere
- Status: ⏸️ Not started

### Technical Debt (PHASE B - After Tester Feedback)
- Refactor MainDashboard.tsx (1900+ lines → break into components)
- State management cleanup (consider Zustand/Redux)
- Performance optimization (React.memo, useMemo)
- Test coverage (currently minimal)

### Future Features (PHASE C - Post-Beta)
- Push notifications for comments/feedback
- Advanced audio features (waveform visualization)
- Export playlists
- Analytics dashboard
- Desktop app (Electron)

---

## Important Documentation

### Must-Read Docs
1. **[docs/eod-status/2026-01-14-eod.md](docs/eod-status/2026-01-14-eod.md)** - Latest session status
2. **[docs/dec-dev/pre-tester-priority-checklist.md](docs/dec-dev/pre-tester-priority-checklist.md)** - Ship-blocking issues
3. **[docs/BETA_READY_CHECKLIST.md](docs/BETA_READY_CHECKLIST.md)** - Full beta checklist
4. **[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database schema
5. **[README.md](README.md)** - Design system overview

### Recent EOD Reports
```
docs/eod-status/2026-01-14-eod.md    # Today's work
docs/eod-status/2026-01-12-midday.md # Mid-day review
docs/eod-status/2026-01-10-eod.md    # Dark mode debugging
docs/eod-status/2026-01-07-eod.md    # Dark mode foundation
docs/eod-status/2026-01-01-eod.md    # Year start
```

### Architecture Docs
```
docs/dec-dev/PHASE_1_ARCHITECTURE_AUDIT.md
docs/dec-dev/PHASE_2_COMPONENT_ANALYSIS.md
docs/dec-dev/PHASE_2_STATE_MANAGEMENT_AUDIT.md
docs/dec-dev/A3_CRITICAL_FLOW_AUDIT.md
docs/dec-dev/A5_OFFLINE_AUDIT.md
```

### Feature Guides
```
docs/SUPABASE_EMAIL_CONFIGURATION.md     # Email verification
docs/SIGNUP_FLOW_GUIDE.md                # Onboarding flow
docs/LANDING_PAGE_GUIDE.md               # Marketing page
docs/LOGO_AND_BRANDING_GUIDE.md          # Brand assets
```

---

## Quick Reference

### Design Tokens (V8 Logo Colors)
```typescript
colors: {
  primary: {
    blue: '#e9a63c',      // Gold (was blue)
  },
  surface: {
    primary: '#222d3a',   // Lighter navy
    secondary: '#1a2332', // Main background (logo navy)
    tertiary: '#1a2332',  // Page background
  },
  text: {
    primary: '#ffffff',   // White
    link: '#e9a63c',      // Gold
  }
}
```

### Common Commands
```bash
# Start development
npm run dev

# Build and deploy to iOS
npm run build && npx cap sync ios

# Update database types
npm run db:types

# View git log
git log --oneline -10

# Check current branch
git branch --show-current
```

### Key Keyboard Shortcuts in Xcode
- `Cmd+R` - Build and run
- `Cmd+B` - Build only
- `Cmd+.` - Stop running
- `Cmd+Shift+K` - Clean build folder

### Supabase Dashboard
- URL: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe
- Tables: Table Editor
- SQL: SQL Editor
- Storage: Storage (for audio files)
- Auth: Authentication

---

## Session Handoff Checklist

✅ **Code Status**:
- [x] All changes committed (bba122f0)
- [x] Pushed to origin/master
- [x] No merge conflicts
- [x] Build succeeds
- [x] iOS synced

✅ **Documentation**:
- [x] EOD report created (2026-01-14-eod.md)
- [x] Handoff doc created (this file)
- [x] Next steps documented

✅ **Environment**:
- [x] Dev servers running (optional to stop)
- [x] No uncommitted changes
- [x] .env file configured

✅ **Next Session Setup**:
- [ ] Read this handoff doc
- [ ] Review latest EOD: `docs/eod-status/2026-01-14-eod.md`
- [ ] Check pre-tester checklist: `docs/dec-dev/pre-tester-priority-checklist.md`
- [ ] Test dark mode on iOS device
- [ ] Address PHASE A ship-blocking issues

---

## Contact & Resources

### Project Resources
- **GitHub**: (Add if applicable)
- **Supabase Project**: https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe
- **Local Dev**: http://localhost:3000

### Key Patterns to Remember
1. **Always use `useDesignTokens()` hook** - Never static import
2. **Move constants inside components** - After hooks
3. **Type-safe DB operations** - Use generated types
4. **Commit types + code together** - After DB changes
5. **Test on iOS device** - Not just browser

---

**Last Updated**: 2026-01-14 11:53 PST
**Author**: Claude Code (Handoff for new session)
**Status**: Ready for continuation
**Next Priority**: iOS testing + PHASE A ship-blocking fixes

---

## Additional Notes

This project is approaching beta testing readiness. The dark mode implementation is complete, core features are functional, and the app is buildable. The immediate focus should be on:

1. **Testing** - Manual iOS testing of recent changes
2. **Error handling** - PHASE A ship-blocking issues
3. **User experience** - Polish based on internal testing
4. **Beta preparation** - Complete pre-tester checklist

The codebase is well-organized with clear patterns. Follow the established conventions (atomic design, design tokens, TypeScript types) and refer to recent EOD reports for context on what's been done.

Good luck with the handoff! 🎵
