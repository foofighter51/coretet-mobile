# CoreTet Project Instructions

> This file is automatically read by Claude Code at the start of every session.
> It provides persistent context about the project, conventions, and current priorities.

## Project Identity

**CoreTet** — "Your Band's Musical Brain"

A private music collaboration platform for bands and songwriters. Think Frame.io for audio tracks.

### Philosophy (ALWAYS REMEMBER)
- **Anti-social network**: Private, meaningful collaboration over public metrics
- **Musicians first**: Many users are non-technical ("So Easy a Drummer Can Do It")
- **Organize the chaos**: Solve scattered voice memos, lost demos, version confusion
- **Audio is sacred**: Playback must be rock-solid, never janky
- **Musician's journal, NOT project management**: CoreTet is a creative tool for musicians, not a professional project management platform. Avoid tech speak and corporate workflow concepts. Hide functionality in interfaces that make sense to musicians and songwriters.
- **The journey is the destination**: There is no formal "status" or "approval workflow" on tracks. Version Types (Demo, Rough Mix, Final, etc.) already let songwriters naturally notate what creative state a track is in. Avoid finality language — songs evolve.

### Rating System (NOT STARS)
- **Listened** — Auto-applied after user plays majority of track
- **Liked** — "This resonates with me" (thumbs up icon)
- **Loved** — "This is special, prioritize it" (heart icon)

### Current Phase
**Phase 1: Songwriter Mode** (CURRENT FOCUS)
- Upload and organize tracks
- Tags (keywords), Works (version groups), ratings
- Comments and dialogue (with timestamps)
- Set list creation
- Version history with hero track selection

**Phase 2: Production Mode** (FUTURE — mention in pitches only)
- AI analysis (BPM, key, mood, genre)
- Collaborator invites
- Professional review workflows

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript 5 + Vite 4.4 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **File Storage** | S3 via Supabase Storage |
| **Mobile** | Capacitor 7 (iOS native app) |
| **Audio** | Howler.js |
| **Routing** | react-router-dom v7 |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **UI Primitives** | Radix UI (Select, Tabs, Slider, Progress) |
| **Domain** | coretet.app |

---

## Code Conventions

### When You See: `@coretet-context`
Re-read this entire file and apply all conventions.

### When You See: `@coretet-preflight`
Run the full preflight checklist before marking work complete:
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Works at 375px (mobile)
- [ ] Works at 1440px (desktop)
- [ ] Has loading state (if async)
- [ ] Has error state (if can fail)
- [ ] Has empty state (if shows data)
- [ ] Audio controls work smoothly (if audio-related)
- [ ] Matches existing component patterns

### When You See: `@coretet-verify`
Take a screenshot or describe the current visual state, then self-assess:
1. Does it match our design system?
2. Are there any obvious UX issues?
3. What would a non-technical musician think?

### When You See: `@coretet-handoff`
Create/update `docs/SESSION_HANDOFF.md` with current state.

---

## Design System

### Colors
```
Primary Blue:       #0088cc (brand color, Rdio-inspired)
Primary Hover:      #006ba6
Primary Light:      #e8f4f8
Primary Ultra Light:#f5fafe

Text Primary:       #1e252b (charcoal)
Text Secondary:     #586069 (dark gray)
Text Tertiary:      #9da7b0 (gray)
Text Muted:         #4a5568
Text Disabled:      #cbd5e0

Surface Primary:    #ffffff (cards, modals)
Surface Secondary:  #f7fafc (subtle backgrounds)
Surface Tertiary:   #fafbfc (page backgrounds)
Surface Hover:      #ebf8ff (light blue hover)
Surface Active:     #e8f4f8 (active states)

Border Default:     #e2e8f0
Border Light:       #f7fafc
Border Divider:     #f0f1f3

Error:              #dc3545
Success:            #28a745
Warning:            #ffc107

Rating Liked:       #68d391 (green)
Rating Loved:       #fc8181 (red)
Rating Listened:    #90cdf4 (blue)
```

### Typography
```
Font Family:  SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif

Font Sizes:
  Giant:      96px (weight 200)
  H1:         42px (weight 300)
  H2:         32px (weight 400)
  H3:         24px (weight 500)
  H4:         20px (weight 600)
  Body:       16px (weight 400)
  Body Small: 14px
  Caption:    12px
  Label:      10px

Font Weights:
  ultralight: 200
  light:      300
  normal:     400
  medium:     500
  semibold:   600
  bold:       700
```

### Spacing & Radii
```
Spacing (8px grid):
  xs:   4px
  sm:   8px
  md:   16px
  lg:   24px
  xl:   32px
  xxl:  48px
  xxxl: 64px

Border Radius:
  sm:   4px  (small buttons, badges)
  md:   8px  (cards, inputs)
  lg:   12px (modals)
  xl:   16px (large cards)
  xxl:  20px (pill buttons)
  full: 50%  (circular)

Shadows:
  default:  0 1px 2px rgba(0,0,0,0.04)
  elevated: 0 4px 12px rgba(0,0,0,0.1)
```

### Layout Dimensions
```
Breakpoints:
  Mobile:  < 768px
  Tablet:  768px - 1024px
  Desktop: >= 1024px
  Wide:    >= 1920px

Desktop Layout:
  Sidebar:      240px (collapsed: 60px)
  Detail Panel: 420px (min: 360px, max: 500px)
  Header:       64px
  Player Bar:   80px
  Tab Bar:      60px (mobile only)

Touch Targets: 44px minimum (iOS/Android standard)
```

### Components
```
Modals:   Custom BaseModal component (src/components/ui/BaseModal.tsx)
          - Centered dialog with backdrop
          - Click outside or X to close
          - Supports responsive bottom-sheet on mobile

Toasts:   No dedicated toast system - use in-place error/success states
          Consider adding react-hot-toast if needed

Forms:    Controlled components with inline styles
          - No form library (no react-hook-form)
          - Validation done manually in handlers

Loading:  <Spinner /> component (src/components/atoms/Spinner.tsx)
          - CSS animation (keyframe spin)
          - Optional label prop

Empty:    <EmptyState /> component (src/components/molecules/EmptyState.tsx)
          - Icon, title, description, optional action button

Errors:   <ErrorDisplay /> component (src/components/molecules/ErrorDisplay.tsx)
          - Red-themed error card with message
```

---

## Project Structure

```
coretet-band/
├── src/
│   ├── App.tsx                      # Main router + auth state
│   ├── main.tsx                     # Entry point
│   ├── styles.css                   # Global CSS (keyframes, resets)
│   ├── tokens.json                  # Design tokens source
│   │
│   ├── components/
│   │   ├── atoms/                   # Spinner, basic primitives
│   │   ├── molecules/               # TrackCard, AudioPlayer, Modals
│   │   │   ├── AudioPlayer.tsx      # Howler-based player
│   │   │   ├── AudioUploader.tsx    # File upload with progress
│   │   │   ├── SwipeableTrackRow.tsx# Mobile track row with gestures
│   │   │   ├── DesktopTrackRow.tsx  # Desktop track row with grid
│   │   │   ├── PlaybackBar.tsx      # Mini player bar
│   │   │   ├── VersionTypeSelector.tsx # Track type dropdown
│   │   │   └── WaveformVisualizer.tsx  # Canvas waveform display
│   │   ├── organisms/               # Complex composed components
│   │   │   ├── TrackDetailPanel.tsx # Right-side detail panel
│   │   │   └── WorkDetailView.tsx   # Work (version group) view
│   │   ├── screens/                 # Full page components
│   │   │   ├── MainDashboard.tsx    # Primary app screen (~2500 lines)
│   │   │   ├── OnboardingScreen.tsx # New user setup
│   │   │   ├── LandingPage.tsx      # Public marketing page
│   │   │   └── PublicPlaylistView.tsx # Shared set list view
│   │   ├── ui/                      # Reusable UI primitives
│   │   │   ├── BaseModal.tsx        # Modal container
│   │   │   ├── ConfirmDialog.tsx    # Yes/No confirmation
│   │   │   └── LoadingState.tsx     # Loading overlay
│   │   ├── layouts/                 # Layout wrappers
│   │   └── guards/                  # Route protection
│   │
│   ├── contexts/
│   │   ├── ThemeContext.tsx         # Dark/light mode (basic)
│   │   ├── BandContext.tsx          # Current band state
│   │   ├── SetListContext.tsx       # Set list operations
│   │   └── AuthContext.tsx          # Supabase auth wrapper
│   │
│   ├── design/
│   │   ├── designTokens.ts          # Typed design tokens
│   │   └── useDesignTokens.ts       # Hook for token access
│   │
│   ├── hooks/
│   │   └── useResponsive.ts         # Viewport breakpoint detection
│   │
│   ├── utils/
│   │   ├── audioPlayerManager.ts    # Global Howler instance manager
│   │   ├── waveformGenerator.ts     # Web Audio API waveform extraction
│   │   └── deepLinkHandler.ts       # Capacitor deep link handling
│   │
│   └── types/                       # TypeScript interfaces
│
├── lib/
│   ├── supabase.ts                  # Supabase client + all DB operations
│   └── database.types.ts            # Auto-generated from Supabase
│
├── supabase/
│   └── migrations/                  # PostgreSQL migrations (chronological)
│
├── public/                          # Static assets
├── ios/                             # Capacitor iOS project
└── docs/                            # Documentation
```

---

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User data (name, avatar, storage_used, tier, is_admin) |
| `bands` | Band/group entities (name, storage_limit, is_personal) |
| `band_members` | User-band relationships (role: admin/member) |
| `tracks` | Audio tracks (title, file_url, duration, band_id, soft-delete) |
| `track_versions` | Version history (file_url, version_number, is_hero) |
| `version_groups` | "Works" — groups multiple track versions |
| `ratings` | Track ratings (rating_type: liked/loved) |
| `comments` | Track comments (content, timestamp_seconds optional) |
| `set_lists` | Playlists (title, share_code, band_id) |
| `set_list_entries` | Playlist items (track_id, position) |
| `keywords` | Tags scoped to band |
| `track_keywords` | Many-to-many track-keyword |

### Key Relationships
```
profiles ──┬── band_members ───── bands
           │                        │
           │                        ├── tracks ───── version_groups (Works)
           │                        │     │
           │                        │     ├── track_versions
           │                        │     ├── ratings
           │                        │     ├── comments
           │                        │     └── track_keywords ── keywords
           │                        │
           │                        └── set_lists ── set_list_entries ── tracks
           │
           └── feedback, beta_invite_codes, etc.
```

### RLS Patterns
- All tables use Row Level Security
- Band members can read/write within their band
- `is_band_member(band_id, user_id)` function for authorization
- Soft-delete pattern: `deleted_at`, `deleted_by` columns + `recycle_bin_items` view

---

## Current Priorities

### Active Sprint
- [x] Works-centric architecture (version_groups as primary container)
- [x] Version type selector (Demo, Rough Mix, Final, etc.)
- [x] Desktop track grid layout with aligned columns
- [ ] Waveform visualization with comment markers
- [ ] Timestamped comments synced to playback

### Known Issues
- [ ] Rating changes need optimistic UI updates
- [ ] Mobile swipe gestures occasionally conflict with scroll
- [ ] Long track titles truncate without tooltip

### Technical Debt
- [ ] MainDashboard.tsx is ~2500 lines - needs splitting
- [ ] Some `any` types in Supabase response handling
- [ ] Inconsistent error handling patterns

---

## Rules

1. **Never** add social/viral features (share counts, public profiles, follower systems)
2. **Never** compromise audio playback quality for other features
3. **Always** consider the non-technical musician user
4. **Always** run `@coretet-preflight` before completing UI work
5. **Always** update this file when establishing new patterns
6. **Prefer** existing patterns over introducing new ones
7. **Ask** when requirements are unclear rather than assuming

---

## Quick Commands

| Command | Action |
|---------|--------|
| `@coretet-context` | Re-read project context, apply all conventions |
| `@coretet-preflight` | Run full QA checklist |
| `@coretet-verify` | Visual self-assessment |
| `@coretet-handoff` | Create session handoff document |
| `@coretet-audit` | Run full codebase audit |
| `@coretet-bootstrap` | Scan codebase and populate this file |

---

## Session Log

> Claude: Add brief notes here during sessions for continuity.

```
2026-01-29: Bootstrap complete. Populated CLAUDE.md with actual codebase values.
            Created component playground, preflight checklist, test specs, audit report.
2026-02-02: Added "musician's journal" philosophy to CLAUDE.md.
            Implemented Card Timeline View for Works (VersionTimeline + VersionTimelineCard).
            Replaced list view with timeline as default in WorkDetailView.
```
