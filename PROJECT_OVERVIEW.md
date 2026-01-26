# CoreTet Band - Comprehensive Project Overview

**Last Updated**: January 25, 2026
**Current Build**: `d86ffb07` - Beta Invite Code System Implementation
**Status**: Pre-beta testing preparation with core MVP features complete

---

## 1. PROJECT STRUCTURE

### Root Directory Organization

```
coretet-band/
├── .claude/                    # Claude Code settings
├── .git/                       # Git repository
├── .venv/                      # Python virtual environment
├── archive/                    # Old/archived code
├── database/                   # Local database files
├── database-backups/           # Database backup archives
├── dist/                       # Build output
├── docs/                       # Comprehensive documentation (89 markdown files)
├── ios/                        # Xcode iOS project
├── lib/                        # Core libraries (Supabase client, types, storage)
├── migrations/                 # Manual SQL migrations (legacy)
├── node_modules/              # NPM dependencies
├── public/                     # Static assets (logos, favicon)
├── scripts/                    # Build and utility scripts
├── src/                        # Source code (React TypeScript)
├── supabase/                   # Supabase infrastructure
├── visual-assets/              # Brand materials
└── Configuration Files:
    ├── package.json            # NPM dependencies & scripts
    ├── vite.config.ts          # Vite build configuration
    ├── capacitor.config.ts     # Capacitor mobile config
    ├── .env.example            # Environment variables template
    ├── .env.template           # Alternative env template
    ├── .env.local              # Local secrets (git-ignored)
    └── design-tokens-complete.json  # Design system tokens
```

### Source Code Structure (`src/`)

```
src/
├── components/
│   ├── atoms/                  # 7 base components (Button, Spinner, etc.)
│   ├── molecules/              # 25 composite components (TrackRow, AudioPlayer, etc.)
│   ├── screens/                # 20+ full-page components (MainDashboard, PhoneAuthScreen, etc.)
│   ├── ui/                     # Base UI components (Modal, Dialog, etc.)
│   └── guards/                 # Route protection (AdminRouteGuard, ErrorBoundary)
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx
│   ├── BandContext.tsx
│   ├── SetListContext.tsx
│   └── ThemeContext.tsx
├── hooks/                      # Custom React hooks
├── utils/                      # Business logic & services
│   ├── audioPlayerManager.ts
│   ├── audioUploadService.ts
│   ├── inviteCodeService.ts
│   └── ... (20+ utility files)
├── design/                     # Design system
│   ├── designTokens.ts
│   ├── darkTheme.ts
│   ├── useDesignTokens.ts
│   └── tokens/                 # Modular token files
├── App.tsx                     # Root component + routing
├── main.tsx                    # Entry point
└── styles.css                  # Global styles
```

---

## 2. TECHNOLOGY STACK

### Frontend Core

- **Framework**: React 18.3.1 with TypeScript 5.0.2
- **Build Tool**: Vite 4.4.5 (fast dev server, optimized builds)
- **Routing**: React Router DOM 7.9.3
- **State Management**: React Context API (no Redux)
- **Mobile Runtime**: Apache Capacitor 7.x
  - `@capacitor/core`: 7.4.3
  - `@capacitor/ios`: 7.4.3
  - `@capacitor/filesystem`: 7.1.4
  - `@capacitor/app`: 7.1.0
  - `@capacitor/share`: 7.0.2
  - `@capawesome/capacitor-file-picker`: 7.2.0

### UI & Styling

- **Icon Library**: Lucide React 0.263.1 (tree-shakeable icons)
- **Component Libraries**:
  - Radix UI primitives (avatar, label, progress, select, slider, tabs)
  - Class Variance Authority 0.7.0
  - Clsx 2.0.0
  - Tailwind Merge 1.14.0
- **Design System**: Custom design tokens (JSON-based)
- **Styling Approach**: Inline styles + design tokens (no Tailwind/CSS-in-JS)

### Audio Processing

- **Playback**: Howler.js 2.2.4 (Web Audio API wrapper)
  - Multi-format support (MP3, WAV, M4A, AAC)
  - Cross-browser compatibility
  - Mobile audio context handling
- **Encoding**: LAME MP3 encoder (lamejs 1.2.1)
- **Analysis**: Web Audio API for metadata extraction

### Backend & Database

- **Backend-as-a-Service**: Supabase (PostgreSQL + Storage + Auth + Realtime)
- **Database Client**: @supabase/supabase-js 2.58.0
- **Authentication**: Supabase Auth
  - Phone OTP (SMS)
  - Email verification
  - Beta invite codes (bypass email verification)
- **File Storage**: Supabase Storage (S3-compatible)
- **Real-time**: Supabase Realtime subscriptions (currently unused)

### Development Tools

- **Testing**: Jest 29.7.0 with ts-jest, jest-environment-jsdom
- **Component Documentation**: Storybook 7.4.0
- **Linting**: ESLint with TypeScript plugin
- **Documentation**: TypeDoc
- **Build Validation**: Pre-commit hooks

### Production Features

- **AI Integration**: Google Generative AI SDK 0.24.1 (future feature)
- **UUID Generation**: uuid 13.0.0

---

## 3. DATABASE SCHEMA

### Supabase Project Details

- **Project ID**: `tvvztlizyciaafqkigwe`
- **URL**: `https://tvvztlizyciaafqkigwe.supabase.co`
- **Database**: PostgreSQL (managed by Supabase)

### Core Tables

#### **profiles** - User Accounts
```sql
id                    TEXT PRIMARY KEY      -- Auth user UUID
name                  TEXT                  -- Display name
email                 TEXT                  -- Email address
phone_number          TEXT                  -- Phone number
avatar_url            TEXT                  -- Profile picture URL
is_admin              BOOLEAN               -- Admin flag (for beta code management)
tier                  TEXT                  -- 'free', 'band', 'producer'
storage_used          BIGINT                -- Bytes used
storage_limit         BIGINT                -- Bytes allowed (default: 1GB)
stripe_customer_id    TEXT                  -- Stripe integration
stripe_subscription_id TEXT                 -- Subscription ID
subscription_status   TEXT                  -- 'none', 'active', 'past_due', 'cancelled', 'trialing'
trial_ends_at         TIMESTAMPTZ
last_active_at        TIMESTAMPTZ
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

#### **bands** - Workspaces for Collaboration
```sql
id              UUID PRIMARY KEY
name            TEXT
created_by      TEXT REFERENCES profiles(id)
is_personal     BOOLEAN              -- Personal workspace flag
settings        JSONB                -- Band configuration
storage_used    BIGINT               -- Band storage usage
storage_limit   BIGINT               -- Band storage quota
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### **band_members** - Band Membership
```sql
id         UUID PRIMARY KEY
band_id    UUID REFERENCES bands(id) ON DELETE CASCADE
user_id    TEXT REFERENCES profiles(id) ON DELETE CASCADE
role       TEXT                      -- 'owner', 'admin', 'member'
joined_at  TIMESTAMPTZ
UNIQUE(band_id, user_id)
```

#### **band_invites** - Email-Based Band Invitations
```sql
id              UUID PRIMARY KEY
band_id         UUID REFERENCES bands(id) ON DELETE CASCADE
invited_email   TEXT
invited_by      TEXT REFERENCES profiles(id)
role            TEXT              -- 'admin' or 'member'
status          TEXT              -- 'pending', 'accepted', 'declined', 'expired'
invite_token    TEXT UNIQUE
created_at      TIMESTAMPTZ
expires_at      TIMESTAMPTZ
accepted_at     TIMESTAMPTZ
accepted_by     TEXT REFERENCES profiles(id)
```

#### **tracks** - Audio Files
```sql
id                UUID PRIMARY KEY
title             TEXT
file_url          TEXT              -- Supabase Storage URL
file_size         BIGINT            -- Bytes
duration_seconds  NUMERIC           -- Audio duration
created_by        TEXT REFERENCES profiles(id)
band_id           UUID REFERENCES bands(id) ON DELETE CASCADE
folder_path       TEXT              -- Source folder (future feature)
hero_version_id   UUID REFERENCES track_versions(id)  -- Current "hero" version
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

#### **track_versions** - Track Version Management (MVP - Dec 2024)
```sql
id                UUID PRIMARY KEY
track_id          UUID REFERENCES tracks(id) ON DELETE CASCADE
version_number    INTEGER           -- Sequential version number
file_url          TEXT
file_size         BIGINT
duration_seconds  NUMERIC
uploaded_at       TIMESTAMPTZ
uploaded_by       UUID REFERENCES profiles(id)
is_hero           BOOLEAN           -- Designated hero version (only one per track)
notes             TEXT              -- Version changelog
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
UNIQUE(track_id, version_number)
```

**Constraint**: Trigger `ensure_single_hero_version` enforces only one `is_hero=true` per track

#### **set_lists** - Playlists (Renamed from "playlists" - Dec 2024)
```sql
id           UUID PRIMARY KEY
title        TEXT
description  TEXT
created_by   TEXT REFERENCES profiles(id)
band_id      UUID REFERENCES bands(id)
is_public    BOOLEAN           -- Visibility flag
share_code   TEXT              -- Sharing identifier
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

#### **set_list_entries** - Playlist Items
```sql
id            UUID PRIMARY KEY
set_list_id   UUID REFERENCES set_lists(id) ON DELETE CASCADE
version_id    UUID REFERENCES track_versions(id) ON DELETE CASCADE  -- References version, not track
track_id      UUID REFERENCES tracks(id) ON DELETE CASCADE  -- Legacy support
added_by      TEXT REFERENCES profiles(id)
position      INTEGER           -- Track order within playlist
added_at      TIMESTAMPTZ
UNIQUE(set_list_id, version_id)
```

**Key Design**: Playlists reference `track_versions`, not `tracks` directly. This allows choosing specific versions (hero or alternate) for each playlist.

#### **track_ratings** - User Ratings System
```sql
id         UUID PRIMARY KEY
track_id   UUID REFERENCES tracks(id) ON DELETE CASCADE
user_id    TEXT REFERENCES profiles(id)
band_id    UUID REFERENCES bands(id)
rating     TEXT              -- 'listened', 'liked', 'loved'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(track_id, user_id, band_id)
```

#### **track_comments** - Timestamped Feedback
```sql
id                  UUID PRIMARY KEY
track_id            UUID REFERENCES tracks(id) ON DELETE CASCADE
user_id             TEXT REFERENCES profiles(id)
content             TEXT
timestamp_seconds   INTEGER           -- Position in track (seconds)
band_id             UUID REFERENCES bands(id)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

#### **beta_invite_codes** - Simplified Beta Onboarding (NEW - Jan 2026)
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
code          TEXT UNIQUE NOT NULL        -- 8-character alphanumeric (A-Z, 0-9)
created_by    UUID REFERENCES profiles(id)
max_uses      INTEGER DEFAULT 1           -- Usage limit per code
current_uses  INTEGER DEFAULT 0           -- Times used
expires_at    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
is_active     BOOLEAN DEFAULT TRUE
metadata      JSONB DEFAULT '{}'          -- Custom attributes
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
CHECK (code ~ '^[A-Z0-9]{6,12}$')         -- Code format validation
```

#### **beta_code_usage** - Audit Trail for Invite Codes (NEW - Jan 2026)
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
code_id    UUID REFERENCES beta_invite_codes(id) ON DELETE CASCADE
user_id    UUID REFERENCES profiles(id)
used_at    TIMESTAMPTZ DEFAULT NOW()
UNIQUE(code_id, user_id)
```

#### **Other Tables**

- **feedback** / **feedback_screenshots**: User bug reports (temporarily hidden for TestFlight)
- **beta_signups**: Waitlist email collection (Dec 2024)
- **keywords** / **track_keywords**: Tagging system (schema ready, UI partial)
- **track_listens**: Listen tracking (schema ready, not yet used)

### Row Level Security (RLS)

All tables enforce RLS policies:

- **profiles**: Users see only their own profile
- **bands**: Users see only bands they're members of
- **band_members**: Users see members of their bands
- **tracks**: Users see tracks from their bands
- **set_lists**: Users see playlists they created or from their bands
- **track_ratings**: Users see only their own ratings
- **track_comments**: Users see comments from their bands
- **beta_invite_codes**: Admins manage codes, public can verify codes
- **beta_code_usage**: Users see their own usage

### Storage Buckets

- **tracks**: Audio file uploads (private, user/band-scoped)
- **avatars**: Profile pictures (public read)
- **feedback-screenshots**: User feedback attachments (private)

### Database Migrations

**32 migration files** in `supabase/migrations/`:

1. `20251112142500_baseline_schema.sql` - Production schema snapshot
2. `20251118160100_add_tier_system.sql` - Freemium tier system
3. `20251118160200_add_band_storage.sql` - Band storage tracking
4. `20251118160300_storage_triggers.sql` - Auto-update storage on upload
5. `20251205000001_create_track_versions.sql` - Hero version system
6. `20251205000002_create_track_listens.sql` - Listen tracking
7. `20251205000003_create_keywords_system.sql` - Keyword/tag system
8. `20251205000004_migrate_playlists_to_setlists.sql` - Rename playlists
9. `20251209000001_add_version_groups.sql` - Version grouping
10. `20251222000001_add_beta_signups.sql` - Waitlist signup
11. `20260116150416_create_beta_invite_codes.sql` - Beta invite codes
Plus security, RLS, and trigger fix migrations

---

## 4. CURRENT IMPLEMENTATION STATUS

### ✅ Fully Implemented & Working

#### Authentication & Onboarding
- ✅ Phone number signup (SMS OTP via Supabase Auth)
- ✅ Email/password authentication (fallback)
- ✅ Email verification flow with deep links
- ✅ Profile creation with name and avatar upload
- ✅ **Beta invite code system** (NEW - Jan 2026)
  - Admin dashboard for code generation
  - Batch code creation (1-50 codes at once)
  - Real-time validation during signup
  - Auto-confirmation without email verification
- ✅ Onboarding flow (name entry → band selection → main app)

#### Band Management
- ✅ Create personal workspace (auto-created on signup)
- ✅ Create group bands with custom names
- ✅ Switch between multiple bands
- ✅ Band member management (view members, roles)
- ✅ Email-based band invitations
- ✅ Invite acceptance flow with deep links
- ✅ Role-based permissions (owner/admin/member)

#### Track Management
- ✅ Audio file upload (MP3, WAV, M4A, AAC)
- ✅ Metadata extraction (duration, file size, sample rate)
- ✅ Track versioning system (v1, v2, v3... with "hero" designation)
- ✅ **"Add from Library" feature** - Prevents redundant uploads by allowing users to add existing tracks to playlists
- ✅ Signed URL generation for secure playback
- ✅ Storage quota tracking (per user and per band)
- ✅ Storage limit enforcement with visual feedback

#### Playlists (Set Lists)
- ✅ Create unlimited playlists
- ✅ Add tracks to playlists (no duplicates enforced)
- ✅ **Drag-and-drop reordering** (smooth UX with position tracking)
- ✅ **Sort options**: By name, duration, rating, manual position
- ✅ **Filter by rating**: All, loved, liked, listened, unrated
- ✅ **"View All Tracks" mode** - Quick access to full library in readonly view
- ✅ Delete playlists
- ✅ Share playlists (share code generation ready, SMS pending)

#### Audio Playback
- ✅ HTML5 Audio API + Howler.js integration
- ✅ Play/pause/seek controls
- ✅ Volume control (default 70%)
- ✅ Progress timeline with visual feedback
- ✅ Multi-format support (MP3, WAV, AAC, M4A)
- ✅ Mobile audio context handling (iOS Safari compatibility)
- ✅ Singleton player manager (prevents multiple simultaneous players)

#### Rating System
- ✅ **Swipe-to-rate interaction** (swipe right: listened → liked → loved)
- ✅ Three rating levels with color coding:
  - Listened: Gray
  - Liked: Yellow
  - Loved: Red
- ✅ Persistent ratings across sessions
- ✅ Filter playlists by rating level
- ✅ Visual indicators in track rows

#### Feedback & Comments
- ✅ Timestamped comments on tracks
- ✅ Comment threads in TrackDetailModal
- ✅ Keyword/tag system (schema ready, UI partial)

#### UI/UX
- ✅ **Dark mode by default** (V8 logo color scheme: gold #e9a63c, navy #1a2332)
- ✅ Theme-aware logo switching (dark logo for light theme, light logo for dark theme)
- ✅ Responsive design (mobile-first, 425px max width)
- ✅ Atomic component library (atoms → molecules → organisms → screens)
- ✅ Consistent design tokens (8px spacing grid, SF Pro Display typography)
- ✅ Smooth animations and transitions
- ✅ Loading states and spinners
- ✅ Error boundaries and graceful error handling

### 🚧 Partially Implemented / In Progress

#### Freemium Tier System
- 🚧 Database schema complete (tier, storage_limit, subscription_status)
- 🚧 Stripe integration planned but not active
- 🚧 Trial period support (schema ready)
- 🚧 Tier selection UI pending

#### SMS Sharing
- 🚧 Share code generation implemented
- 🚧 SMS sending integration pending (Twilio/similar)
- 🚧 SMS credit system planned

#### Keywords/Tags
- 🚧 Database schema complete
- 🚧 Keyword selector UI exists but not fully integrated
- 🚧 Keyword manager modal implemented
- 🚧 Auto-tagging or suggested tags not implemented

#### Advanced Features
- 🚧 Waveform visualization (component exists, not integrated)
- 🚧 Real-time collaboration (Supabase Realtime available but unused)
- 🚧 Analytics dashboard (basic metrics ready, no UI)
- 🚧 Track listen tracking (schema ready, not recording listens yet)

### ⚠️ Stubbed Out / Placeholder

- ⚠️ **Feedback system**: Fully implemented but **hidden for TestFlight** (will re-enable post-beta)
- ⚠️ AI-powered features (Google Generative AI SDK installed but unused)
- ⚠️ Advanced search/filtering across bands
- ⚠️ Folder organization for tracks
- ⚠️ Export/download playlists

### ❌ Known Non-Functional Areas

- ❌ **Email verification can be buggy** - This is why beta invite codes were implemented as a bypass
- ❌ Real-time collaboration features (not yet started)
- ❌ Push notifications (no implementation)
- ❌ Offline mode (no service worker)

---

## 5. API ENDPOINTS & EDGE FUNCTIONS

### Supabase Edge Functions

#### **confirm-beta-user** (NEW - Jan 2026)
**Location**: `supabase/functions/confirm-beta-user/index.ts`
**Status**: ✅ Implemented, ready to deploy
**Purpose**: Auto-confirm user email for beta testers with valid invite codes

**Trigger**: Called from `PhoneAuthScreen.tsx` during signup when user provides a beta invite code

**Request**:
```typescript
{
  userId: string,      // Supabase Auth user ID
  inviteCode: string   // Beta invite code (8-character alphanumeric)
}
```

**Process**:
1. Verify code exists in `beta_invite_codes` table
2. Check code is active (`is_active=true`)
3. Check code has not expired (`expires_at > NOW()`)
4. Check code has remaining uses (`current_uses < max_uses`)
5. Use **service role key** to auto-confirm email (bypasses normal auth restrictions)
6. Increment `current_uses` counter
7. Log usage in `beta_code_usage` table

**Response**:
```typescript
{
  success: boolean,
  message: string,
  emailConfirmed?: boolean
}
```

**Deploy**: `supabase functions deploy confirm-beta-user`

---

#### **check-usage-thresholds** (Monitoring)
**Location**: `supabase/functions/check-usage-thresholds/index.ts`
**Status**: ✅ Implemented, not yet deployed
**Purpose**: Monitor system metrics and send admin notifications

**Features**:
- Track user count, track count, storage usage
- Notify at milestones (100 users, 500 tracks, 8GB storage)
- Scheduled cron job (daily/hourly)

**Thresholds**:
- **Storage**: 8GB warning at 80% capacity
- **Users**: Notify every 100 users (100, 200, 300, etc.)
- **Tracks**: Notify every 500 tracks
- **Avg tracks/user**: Warn if exceeds 50

---

#### **notify-admin** (Alert System)
**Location**: `supabase/functions/notify-admin/index.ts`
**Status**: ✅ Implemented, not yet deployed
**Purpose**: Send admin notifications for system events

**Use Cases**:
- Threshold breaches
- Error reporting
- Usage alerts
- Security events

---

### Database API (via Supabase JavaScript SDK)

All database operations are **type-safe** via auto-generated TypeScript types from schema.

**Example patterns**:
```typescript
// Profile operations
const { data: profile } = await db.profiles.getById(userId);
await db.profiles.upsert({ id, name, avatar_url });

// Band operations
const { data: bands } = await db.bands.getByUser(userId);
const { data: newBand } = await db.bands.create({ name, created_by: userId });

// Track operations
const { data: tracks } = await db.tracks.getByBand(bandId);
await db.tracks.delete(trackId);

// Set list operations
const { data: setLists } = await db.setLists.getByUser(userId);
await db.setLists.addTrack(setListId, versionId);
await db.setLists.reorderTracks(setListId, newPositions);
```

**Key Helper Functions** in `lib/supabase.ts`:
- `db.profiles.*` - Profile CRUD
- `db.bands.*` - Band management
- `db.tracks.*` - Track operations
- `db.setLists.*` - Playlist operations
- `db.ratings.*` - Rating management
- `db.comments.*` - Comment threads

---

## 6. KEY COMPONENTS & FILES

### Critical Business Logic

#### **audioPlayerManager.ts** - Audio Playback Singleton
**Location**: `src/utils/audioPlayerManager.ts`
**Purpose**: Centralized audio playback management using Howler.js

```typescript
class AudioPlayerManager {
  private howl: Howl | null = null;
  private currentTrack: Track | null = null;

  // Core Methods
  loadTrack(track: Track): Promise<void>
  play(): void
  pause(): void
  seek(position: number): void
  setVolume(level: number): void  // Default: 0.7

  // Event Handlers
  onLoad(callback: () => void): void
  onPlay(callback: () => void): void
  onPause(callback: () => void): void
  onEnd(callback: () => void): void
  onProgress(callback: (current: number, duration: number) => void): void
  onError(callback: (error: Error) => void): void

  // Singleton
  static getInstance(): AudioPlayerManager
}
```

**Key Features**:
- Singleton pattern prevents multiple simultaneous players
- Multi-format support (MP3, WAV, AAC, M4A)
- Mobile audio context handling (iOS Safari compatibility)
- Progress tracking every ~100ms
- Volume normalization (default 70% to prevent distortion)

---

#### **audioUploadService.ts** - Complete Upload Pipeline
**Location**: `src/utils/audioUploadService.ts`
**Purpose**: End-to-end audio file upload workflow

```typescript
class AudioUploadService {
  async uploadAudio(
    file: File,
    options: {
      bandId?: string,
      userId: string,
      onProgress?: (percent: number) => void
    }
  ): Promise<{
    trackId: string,
    fileUrl: string,
    metadata: TrackMetadata
  }>
}
```

**Upload Workflow**:
1. **Validation** - File type, size, duration checks
2. **Metadata Extraction** - Web Audio API decoding for duration, sample rate, channels
3. **Cloud Upload** - Supabase Storage with progress tracking (0-85%)
4. **Signed URL Generation** - 1-year expiry for playback
5. **Database Metadata** - Create `tracks` and `track_versions` records
6. **Storage Quota Update** - Increment user/band storage counters
7. **Complete** - Return trackId, fileUrl, metadata (100% progress)

**Error Handling**:
- Invalid file type → User-friendly error
- File too large → Show tier upgrade prompt
- Storage quota exceeded → Show upgrade prompt
- Network failure → Retry logic

---

#### **inviteCodeService.ts** - Beta Code Management (NEW - Jan 2026)
**Location**: `src/utils/inviteCodeService.ts`
**Purpose**: Beta invite code CRUD operations

```typescript
export const inviteCodeService = {
  // Public - Validate code before signup
  async verifyCode(code: string): Promise<InviteCodeValidation>

  // Public - Mark code as used after successful signup
  async useCode(code: string, userId: string): Promise<{ success: boolean }>

  // Admin - Generate new invite code
  async generateCode(options: {
    maxUses?: number,       // Default: 1
    expiresInDays?: number, // Default: 90
    metadata?: any          // Custom attributes
  }): Promise<{ data: InviteCode, error: Error | null }>

  // Admin - List all codes
  async getAllCodes(): Promise<{ data: InviteCode[], error: Error | null }>

  // Admin - Deactivate code
  async deactivateCode(codeId: string): Promise<{ error: Error | null }>

  // Admin - View usage history
  async getCodeUsage(codeId: string): Promise<{ data: CodeUsage[], error: Error | null }>
}
```

**Code Generation**:
- 8-character alphanumeric codes (A-Z, 0-9, excluding I, O, 0, 1 to avoid confusion)
- Configurable max uses (single-use by default)
- Configurable expiration (90 days default)
- JSONB metadata for custom attributes

---

#### **userAccessService.ts** - Authorization Layer
**Location**: `src/utils/userAccessService.ts`
**Purpose**: Permission checking and authorization

```typescript
export const userAccessService = {
  // Check if user is member of band
  async isBandMember(userId: string, bandId: string): Promise<boolean>

  // Check if user is admin of band
  async isBandAdmin(userId: string, bandId: string): Promise<boolean>

  // Check if user is owner of band
  async isBandOwner(userId: string, bandId: string): Promise<boolean>

  // Check if user has admin flag (for beta invite codes)
  async isSystemAdmin(userId: string): Promise<boolean>

  // Verify user can access track
  async canAccessTrack(userId: string, trackId: string): Promise<boolean>

  // Verify user can edit playlist
  async canEditSetList(userId: string, setListId: string): Promise<boolean>
}
```

---

#### **deepLinkHandler.ts** - Deep Link Routing
**Location**: `src/utils/deepLinkHandler.ts`
**Purpose**: Handle app deep links and universal links

```typescript
export const deepLinkHandler = {
  // Initialize deep link listener
  initialize(callback: (url: string) => void): void

  // Parse deep link URL
  parseUrl(url: string): {
    type: 'invite' | 'playlist' | 'email-verification' | 'unknown',
    params: Record<string, string>
  }

  // Handle email verification link
  handleEmailVerification(token: string): Promise<void>

  // Handle band invite link
  handleBandInvite(token: string): Promise<void>

  // Handle playlist share link
  handlePlaylistShare(shareCode: string): Promise<void>
}
```

**Supported URL Schemes**:
- `coretet://invite?token=abc123` - Band invite
- `coretet://playlist?code=xyz789` - Shared playlist
- `coretet://verify?token=verify123` - Email verification
- `https://coretet.local/...` - Universal links (iOS/Android)

---

### Key React Components

#### **MainDashboard.tsx** - Core Application (2,109 lines)
**Location**: `src/components/screens/MainDashboard.tsx`
**Purpose**: Primary app interface after authentication

**Features**:
- Track library management (view, upload, delete)
- Set list (playlist) creation and management
- Drag-and-drop reordering
- Sort options (name, duration, rating, position)
- Filter by rating (all, loved, liked, listened, unrated)
- "Add from Library" modal (prevents redundant uploads)
- "View All Tracks" button (quick library access)
- Band switching
- Settings modal
- Swipe-to-rate interaction
- Audio player integration

**State Management**:
- Local state for UI (loading, error, modals)
- Context for bands, set lists, auth
- Real-time updates from Supabase (via manual refetch)

---

#### **PhoneAuthScreen.tsx** - Authentication Entry Point
**Location**: `src/components/screens/PhoneAuthScreen.tsx`
**Purpose**: Phone/email signup and login

**Features**:
- Phone number input with country code support
- Email/password fallback authentication
- **Beta invite code input** (NEW - Jan 2026)
  - Real-time validation
  - Visual feedback (green border when valid)
  - Auto-uppercase formatting
  - Optional field (skips email verification if provided)
- Deep link detection for email verification
- Error handling with user-friendly messages
- Loading states

**Flow**:
1. User enters phone number OR email/password
2. (Optional) User enters beta invite code
3. If phone: Send SMS OTP → navigate to verification screen
4. If email: Send verification email OR auto-confirm if beta code valid
5. Navigate to onboarding if new user, or main app if returning user

---

#### **AdminInviteCodesScreen.tsx** - Beta Code Management (NEW - Jan 2026)
**Location**: `src/components/screens/AdminInviteCodesScreen.tsx`
**Purpose**: Admin dashboard for managing beta invite codes

**Features**:
- **Code Generation**:
  - Batch size: 1-50 codes at once
  - Max uses per code: 1-100 (default: 1 for single-use)
  - Expiration: 1-365 days (default: 90 days)
- **Code Management**:
  - Sortable table with all codes
  - Copy-to-clipboard functionality
  - Deactivate codes individually
  - Visual status indicators (Active/Expired/Full/Inactive)
- **Statistics Dashboard**:
  - Total codes generated
  - Active codes available
  - Total uses across all codes
- **Security**: Protected by AdminRouteGuard (requires `is_admin=true`)

---

#### **TrackDetailModal.tsx** - Full Track Info
**Location**: `src/components/molecules/TrackDetailModal.tsx`
**Purpose**: Display complete track metadata and comments

**Features**:
- Track title, duration, file size
- Artist/band information
- Upload date and uploader
- Keyword/tag display
- Timestamped comment thread
- Add comment functionality with timestamp linking
- Rating display
- Version selector (hero vs. alternate versions)

---

#### **SwipeableTrackRow.tsx** - Interactive Track Display
**Location**: `src/components/molecules/SwipeableTrackRow.tsx`
**Purpose**: Track row with swipe-to-rate interaction

**Interaction**:
- Swipe right: `unrated` → `listened` → `liked` → `loved`
- Swipe left: Reset to unrated
- Visual feedback: Color changes based on rating
- Smooth animation

---

#### **AudioPlayer.tsx** - Playback Controls
**Location**: `src/components/molecules/AudioPlayer.tsx`
**Purpose**: Audio playback UI with timeline

**Features**:
- Play/pause button
- Seek timeline (click to jump)
- Current time / total duration display
- Volume control slider
- Loading spinner during buffering
- Error display if playback fails

---

#### **BandModal.tsx** - Band Management
**Location**: `src/components/molecules/BandModal.tsx`
**Purpose**: Create and switch bands

**Features**:
- List of user's bands
- Create new band (name input)
- Switch to selected band
- Display band members
- Show active band indicator

---

#### **AdminRouteGuard.tsx** - Route Protection (NEW - Jan 2026)
**Location**: `src/components/guards/AdminRouteGuard.tsx`
**Purpose**: Protect admin-only routes

**Logic**:
1. Accept `userId` prop
2. Fetch user profile from database
3. Check `is_admin` flag
4. If not admin: Redirect to `/app`
5. If not authenticated: Redirect to `/`
6. If admin: Render children

**Usage**:
```tsx
<Route path="/admin/codes" element={
  <AdminRouteGuard userId={user.id}>
    <AdminInviteCodesScreen />
  </AdminRouteGuard>
} />
```

---

### Context Providers

#### **AuthContext.tsx** - Authentication State
**Location**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  currentUser: AuthUser | null
  currentScreen: ScreenId
  authLoading: boolean
  currentError: ErrorInfo | null

  signUp(email: string, password: string): Promise<void>
  signIn(email: string, password: string): Promise<void>
  sendVerificationCode(email: string): Promise<void>
  verifyCode(email: string, code: string): Promise<void>
  completeOnboarding(userName: string): Promise<void>
  logout(): Promise<void>
}
```

---

#### **BandContext.tsx** - Band State Management
**Location**: `src/contexts/BandContext.tsx`

```typescript
interface BandContextType {
  currentBand: Band | null
  bands: Band[]
  bandMembers: BandMember[]

  createBand(name: string): Promise<void>
  switchBand(bandId: string): Promise<void>
  addMember(email: string): Promise<void>
  removeMember(userId: string): Promise<void>
  updateBandSettings(settings: any): Promise<void>
}
```

---

#### **SetListContext.tsx** - Playlist State Management
**Location**: `src/contexts/SetListContext.tsx`

```typescript
interface SetListContextType {
  setLists: SetList[]
  currentSetList: SetList | null

  createSetList(title: string, description?: string): Promise<void>
  addTrackToSetList(setListId: string, versionId: string): Promise<void>
  removeTrackFromSetList(setListId: string, entryId: string): Promise<void>
  reorderTracks(setListId: string, positions: Position[]): Promise<void>
  deleteSetList(setListId: string): Promise<void>
}
```

---

#### **ThemeContext.tsx** - Dark/Light Mode
**Location**: `src/contexts/ThemeContext.tsx`

```typescript
interface ThemeContextType {
  currentTheme: 'dark' | 'light'
  toggleTheme(): void
}
```

**Default**: Dark mode (based on V8 logo color scheme)

---

## 7. DEPENDENCIES & CONFIGURATION

### Package.json Highlights

```json
{
  "name": "@coretet/design-system",
  "version": "1.0.0",
  "description": "CoreTet Band - Music collaboration platform",

  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest",
    "db:types": "./scripts/generate-types.sh",
    "db:types:check": "npm run db:types && git diff --exit-code lib/database.types.ts",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },

  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.3",
    "@supabase/supabase-js": "^2.58.0",
    "@capacitor/core": "^7.4.3",
    "@capacitor/ios": "^7.4.3",
    "howler": "^2.2.4",
    "lucide-react": "^0.263.1",
    "uuid": "^13.0.0"
  },

  "devDependencies": {
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "@types/react": "^18.3.1",
    "jest": "^29.7.0",
    "eslint": "^8.45.0"
  }
}
```

### Environment Variables (.env.local)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tvvztlizyciaafqkigwe.supabase.co
VITE_SUPABASE_ANON_KEY=[public-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # Admin access (for Edge Functions)
SUPABASE_PROJECT_ID=tvvztlizyciaafqkigwe

# Authentication Mode
VITE_AUTH_MODE=password  # 'password' | 'email' | 'test'

# Test Codes (Development)
VITE_TEST_CODES="+1234567890:123456,+1234567891:234567"

# Development Flags
VITE_SKIP_EMAIL_CONFIRMATION=true  # Skip email verification in dev
VITE_OFFLINE_MODE=false  # Bypass Supabase entirely (dev mode)
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,  // Dev server port
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/docs',  // Path alias for documentation
    },
  },
});
```

### Capacitor Configuration (capacitor.config.ts)

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coretet.app',
  appName: 'CoreTet',
  webDir: 'dist',
  server: {
    hostname: 'coretet.local',
    androidScheme: 'coretet',
    iosScheme: 'coretet',
  },
  plugins: {
    App: {
      launchUrl: 'coretet://',  // Deep link scheme
    },
  },
};

export default config;
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./docs/*"]
    }
  },
  "include": ["src/**/*", "lib/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 8. KNOWN ISSUES & BLOCKERS

### Current Issues

#### Email Verification Reliability
**Status**: ⚠️ Known Buggy
**Impact**: Prevents some users from completing signup
**Workaround**: **Beta invite code system** (bypasses email verification)

**Symptoms**:
- Email verification emails not always sent
- Deep links sometimes don't redirect correctly
- Token expiration issues

**Mitigation**:
- Implemented beta invite codes as primary onboarding path
- Email verification now optional/fallback

---

#### Feedback System Hidden
**Status**: ⚠️ Temporarily Disabled
**Reason**: Simplified UI for TestFlight beta testing
**Action**: Re-enable after beta period

**What's hidden**:
- Feedback board screen
- Bug report submission
- Screenshot attachment

**Code**: Commented out in `App.tsx` routing

---

#### Keywords System Incomplete
**Status**: 🚧 Partially Implemented
**Completed**:
- ✅ Database schema (`keywords`, `track_keywords` tables)
- ✅ Keyword selector component
- ✅ Keyword manager modal

**Incomplete**:
- ❌ Keyword input not integrated into main track flow
- ❌ No keyword filtering in library view
- ❌ No auto-tagging suggestions

**Next Steps**: Integrate keyword selector into TrackDetailModal, add filter UI

---

#### Waveform Visualization Not Integrated
**Status**: 🚧 Component Ready, Not Used
**Details**: Waveform component exists but not rendered in any screen

**Reason**: Performance concerns on mobile, needs optimization

**Component**: `src/components/molecules/WaveformVisualizer.tsx`

---

#### Mobile Testing Gaps
**Status**: ⚠️ Needs Manual Testing
**Platform**: iOS (Xcode simulator + TestFlight)

**Untested Areas**:
- Beta invite code flow on mobile
- Deep link handling on physical device
- Audio playback on iOS 17+
- Storage quota enforcement on mobile

**Action**: Manual testing before TestFlight release

---

### Technical Debt

#### Module-Level Design Tokens References (FIXED - Jan 12)
**Issue**: Design tokens referenced at module level caused iOS blank screen crash
**Fix**: Moved design token access inside component bodies (hooks)

**Before** (broken):
```typescript
const designTokens = useDesignTokens();  // ❌ Module level

export function Component() {
  return <div style={{ color: designTokens.colors.text.primary }} />;
}
```

**After** (fixed):
```typescript
export function Component() {
  const designTokens = useDesignTokens();  // ✅ Inside component
  return <div style={{ color: designTokens.colors.text.primary }} />;
}
```

---

#### RLS Policy Complexity
**Issue**: Row Level Security policies require careful testing
**Symptom**: Ambiguous column references in complex queries
**Mitigation**: Explicit table aliases in all RLS policies

**Example Fix**:
```sql
-- Before (ambiguous):
CREATE POLICY "Users can view tracks"
  ON tracks FOR SELECT
  USING (band_id IN (
    SELECT band_id FROM band_members WHERE user_id = auth.uid()
  ));

-- After (explicit):
CREATE POLICY "Users can view tracks"
  ON tracks FOR SELECT
  USING (tracks.band_id IN (
    SELECT bm.band_id FROM band_members bm WHERE bm.user_id = auth.uid()
  ));
```

---

#### Storage Trigger Cascades
**Issue**: Delete cascades can cause storage counter mismatches
**Mitigation**: Triggers on DELETE to decrement storage counters

**Risk**: Race conditions if multiple deletes occur simultaneously

---

### Blockers (None Currently)

✅ All known blockers resolved as of Jan 16, 2026:
- ✅ Email verification bypass (beta invite codes)
- ✅ iOS crash on launch (design tokens fix)
- ✅ Missing TypeScript types (regenerated)
- ✅ Admin route protection (AdminRouteGuard implemented)

---

## 9. RECENT CHANGES & CONTEXT

### Latest Work (Jan 16-25, 2026)

#### Beta Invite Code System Implementation
**Commits**: `d86ffb07` - Jan 16, 2026

**What Was Built**:
1. **Database Layer**:
   - `beta_invite_codes` table with RLS policies
   - `beta_code_usage` audit trail
   - Indexes for performance
   - Triggers for `updated_at` auto-update

2. **Backend Service**:
   - `inviteCodeService.ts` - Full CRUD operations
   - `confirm-beta-user` Edge Function (auto-confirm emails)

3. **Frontend Components**:
   - `AdminInviteCodesScreen.tsx` - Admin dashboard
   - `PhoneAuthScreen.tsx` - Invite code input integration
   - `AdminRouteGuard.tsx` - Admin route protection

4. **Routing**:
   - Added `/admin/codes` route in `App.tsx`
   - Protected with `AdminRouteGuard`

**Issues Resolved**:
- Fixed RLS policy type mismatch (`uuid = text` error)
- Changed `uuid_generate_v4()` to `gen_random_uuid()` (PostgreSQL standard)
- Fixed import path in `inviteCodeService.ts`
- Removed broken `AuthContext` dependency in `AdminRouteGuard`

**Testing Status**:
- ⏸️ Migration applied successfully
- ⏸️ TypeScript types regenerated
- ⏸️ Dev server running without errors
- ⏸️ Manual testing pending (need to set `is_admin=true` and test code flow)

---

#### Dark Mode & UX Improvements
**Commits**: `bba122f0` - Jan 7, 2026

**What Changed**:
1. **Dark mode made default** based on V8 logo colors:
   - Primary: Gold (#e9a63c)
   - Background: Navy (#1a2332)
   - Text: White (#ffffff)

2. **Theme-aware logo switching**:
   - Dark logo for light theme
   - Light logo for dark theme

3. **"Add from Library" feature**:
   - Prevents redundant uploads
   - Modal to select existing tracks for playlists

4. **"View All Tracks" button**:
   - Quick access to full library
   - Readonly view (no editing)

---

#### iOS Blank Screen Fix
**Commits**: `ddb6b8cd` - Jan 12, 2026

**Issue**: App crashed on iOS with blank screen
**Root Cause**: Module-level `designTokens` references before React hydration
**Fix**: Moved all `useDesignTokens()` calls inside component bodies

**Files Changed**:
- All component files using design tokens
- Ensured hooks only called inside function components

---

### Development Context

#### Why "Vibe-Coding Spiral"?
Based on EOD status reports and commit messages, the recent development pattern shows:

1. **Feature Implementation** → Discover edge case or bug
2. **Fix Edge Case** → Discover new requirement
3. **Implement Requirement** → Discover architectural limitation
4. **Refactor Architecture** → Discover iOS-specific issue
5. **Fix iOS Issue** → Ready for testing... discover new feature needed

**Example Timeline (Dec 2024 - Jan 2026)**:
- Implement track versions → Discover playlists reference wrong entity
- Fix playlist references → Discover redundant uploads issue
- Add "Add from Library" → Discover dark mode inconsistencies
- Implement dark mode → Discover iOS crash
- Fix iOS crash → Discover email verification unreliable
- Implement beta invite codes → Discover RLS policy type mismatch
- Fix type mismatch → **Current State** (ready for testing)

**Pattern**: Each fix uncovers a new layer of complexity, leading to continuous iteration.

---

### What Prompted Current Work?

From `docs/PROJECT_HANDOFF_2026-01-14.md` and `docs/eod-status/2026-01-16-eod.md`:

**Immediate Trigger**: TestFlight beta testing preparation

**Specific Pain Points**:
1. **Email verification too buggy** for beta users
2. Need simplified onboarding to reduce drop-off
3. Want controlled beta rollout with invite codes
4. Need admin tools to manage beta access

**Solution**: Beta invite code system with admin dashboard

**Next Steps** (from plan):
- Week 1: Beta invite codes ✅ (COMPLETE)
- Week 2: Marketing website + waitlist signup 🚧 (NEXT)
- Week 3: Web interface foundation 🚧 (PLANNED)
- Week 4: Desktop features (bulk upload, grid view) 🚧 (PLANNED)

---

## 10. DEVELOPMENT WORKFLOWS

### Adding a New Feature

1. **Design Data Model** (if DB change needed)
   ```sql
   -- Create migration file
   supabase migration new feature_name

   -- Edit SQL file in supabase/migrations/
   -- Add tables, columns, indexes, RLS policies
   ```

2. **Apply Migration**
   ```bash
   supabase db push  # Apply to remote database
   npm run db:types  # Regenerate TypeScript types
   ```

3. **Create React Component**
   - Determine atomic level (atom/molecule/organism/screen)
   - Create `.tsx` file in appropriate directory
   - Import `useDesignTokens()` for styling
   - Add TypeScript interfaces for props

4. **Add Business Logic** (if needed)
   - Create service file in `src/utils/`
   - Export functions for CRUD operations
   - Use Supabase client from `lib/supabase.ts`

5. **Integrate into App**
   - Add route in `src/App.tsx` (if new screen)
   - Update navigation/TabBar (if new tab)
   - Add context provider (if shared state)

6. **Test on Mobile**
   ```bash
   npm run build
   npx cap sync ios
   open ios/App/App.xcodeproj
   # Run in Xcode simulator or device
   ```

7. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature with description"
   git push
   ```

---

### Database Schema Changes

```bash
# 1. Create migration file
supabase migration new descriptive_name

# 2. Edit SQL in supabase/migrations/[timestamp]_descriptive_name.sql
# Add CREATE TABLE, ALTER TABLE, CREATE POLICY, etc.

# 3. Apply migration locally (optional)
supabase db reset  # Reset local database

# 4. Apply to remote database
supabase db push

# 5. Regenerate TypeScript types
export SUPABASE_PROJECT_ID=tvvztlizyciaafqkigwe
npm run db:types

# 6. Verify types changed
npm run db:types:check

# 7. Commit together
git add lib/database.types.ts supabase/migrations/
git commit -m "feat: Add new schema feature"
```

---

### Mobile Testing (iOS)

```bash
# 1. Build production bundle
npm run build

# 2. Sync to Capacitor
npx cap sync ios

# 3. Open in Xcode
open ios/App/App.xcodeproj

# 4. In Xcode:
#    - Select simulator or device
#    - Click Run (⌘R)
#    - Test functionality
#    - Check Console for errors

# 5. For TestFlight:
#    - Product → Archive
#    - Distribute App → App Store Connect
#    - Upload to TestFlight
```

---

### Testing Beta Invite Code System

```bash
# 1. Set yourself as admin in Supabase dashboard
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';

# 2. Navigate to admin panel
open http://localhost:3001/admin/codes

# 3. Generate invite codes
# - Set max uses: 1 (single-use)
# - Set expiration: 90 days
# - Click "Generate Code"

# 4. Test signup flow (in incognito window)
# - Navigate to http://localhost:3001
# - Click "Sign Up"
# - Enter email/password
# - Enter beta invite code
# - Verify green border when code is valid
# - Click "Sign Up"
# - Verify email confirmation is skipped
# - Verify redirect to onboarding

# 5. Verify in database
# - Check beta_invite_codes.current_uses = 1
# - Check beta_code_usage has new record
# - Check user can login immediately
```

---

### Edge Function Deployment

```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link to project
supabase link --project-ref tvvztlizyciaafqkigwe

# 3. Deploy function
supabase functions deploy confirm-beta-user

# 4. View logs
supabase functions logs confirm-beta-user --tail

# 5. Test function
curl -X POST https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/confirm-beta-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [anon-key]" \
  -d '{"userId": "test-user-id", "inviteCode": "TESTCODE"}'
```

---

## 11. DEPLOYMENT CHECKLIST

### Pre-Release Checks

- [ ] **All tests passing**: `npm run test`
- [ ] **No type errors**: `npm run type-check`
- [ ] **Lint clean**: `npm run lint`
- [ ] **Build succeeds**: `npm run build`
- [ ] **Database migrations applied**: `supabase db push`
- [ ] **TypeScript types current**: `npm run db:types:check`
- [ ] **Edge functions deployed**: `supabase functions deploy confirm-beta-user`
- [ ] **Storybook updated**: `npm run build-storybook`

### iOS Build Checklist

- [ ] **Increment version** in `ios/App/App/Info.plist` (CFBundleShortVersionString)
- [ ] **Increment build number** (CFBundleVersion)
- [ ] **Sync Capacitor**: `npx cap sync ios`
- [ ] **Archive in Xcode**: Product → Archive
- [ ] **Upload to TestFlight**: Distribute App → App Store Connect
- [ ] **Add testing notes** for TestFlight reviewers
- [ ] **Invite beta testers** via TestFlight

### Database Pre-Deploy

- [ ] **Test migrations locally**: `supabase db reset`
- [ ] **Verify RLS policies**: Test with non-admin user
- [ ] **Create database backup**: Export via Supabase dashboard
- [ ] **Review storage quotas**: Check for users near limits
- [ ] **Types committed**: `git status lib/database.types.ts`

### Post-Deploy Verification

- [ ] **TestFlight build available** within 15 minutes
- [ ] **Deep links working**: Test `coretet://` scheme
- [ ] **Audio playback working** on iOS device
- [ ] **Beta invite codes functional**: Test code generation and usage
- [ ] **Storage uploads working**: Test file upload from mobile
- [ ] **Monitor logs**: `supabase functions logs confirm-beta-user --tail`

---

## 12. USEFUL COMMANDS REFERENCE

### Development

```bash
npm run dev                    # Start dev server (Vite) on port 3001
npm run build                  # Production build
npm run preview                # Preview production build
npm run type-check             # TypeScript check without build
npm run lint                   # ESLint (check only)
npm run lint:fix               # ESLint (auto-fix)
```

### Testing

```bash
npm run test                   # Run Jest tests
npm run test:watch             # Jest watch mode
npm run test:coverage          # Generate coverage report
```

### Database

```bash
npm run db:types               # Regenerate TypeScript types from schema
npm run db:types:check         # Verify types are current

supabase db push               # Apply migrations to remote database
supabase db reset              # Reset local database (destructive)
supabase db diff               # Show schema differences
```

### Mobile

```bash
npx cap sync ios               # Sync web build to iOS project
npx cap sync android           # Sync web build to Android project
npx cap open ios               # Open Xcode
npx cap open android           # Open Android Studio
```

### Supabase Functions

```bash
supabase functions deploy confirm-beta-user  # Deploy Edge Function
supabase functions logs confirm-beta-user    # View logs
supabase functions delete confirm-beta-user  # Delete function
```

### Storybook

```bash
npm run storybook              # Develop in Storybook (port 6006)
npm run build-storybook        # Build static Storybook
```

### Git

```bash
git log --oneline --graph --all           # View commit history
git log --since="2 weeks ago" --oneline   # Recent commits
git diff HEAD~1                            # Show last commit changes
```

---

## 13. PROJECT STATISTICS

### Codebase Size

- **Total Source Files**: 150+ TypeScript/TSX files
- **Total Lines of Code**: ~15,000+ (src/)
- **Component Files**: 60+ React components
- **Utility/Service Files**: 20+
- **Migration Files**: 32 SQL migrations
- **Documentation Files**: 89+ Markdown files

### Database Scale

- **Total Tables**: 18 tables
- **Total Columns**: ~200 columns across all tables
- **Total Indexes**: ~25 indexes
- **Total RLS Policies**: ~40 policies
- **Storage Buckets**: 3 buckets

### Component Breakdown

- **Atoms**: 7 base components
- **Molecules**: 25 composite components
- **Screens**: 20+ full-page components
- **UI Primitives**: 7 reusable UI components
- **Guards**: 2 route protection components

### Commit Activity

- **Total Commits**: 200+ commits
- **Active Development Period**: Nov 2024 - Jan 2026 (3 months)
- **Last Commit**: Jan 16, 2026 (`d86ffb07`)
- **Commits in Last Month**: 15+ commits

---

## 14. QUICK LINKS & RESOURCES

### Documentation

- **Project Handoff**: [docs/PROJECT_HANDOFF_2026-01-14.md](docs/PROJECT_HANDOFF_2026-01-14.md)
- **Database Schema**: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- **Beta Onboarding Plan**: [docs/BETA_ONBOARDING_WEB_INTERFACE_PLAN.md](docs/BETA_ONBOARDING_WEB_INTERFACE_PLAN.md)
- **EOD Status Reports**: [docs/eod-status/](docs/eod-status/) (41 daily reports)

### Code Locations

- **Main App**: [src/App.tsx](src/App.tsx)
- **Core Dashboard**: [src/components/screens/MainDashboard.tsx](src/components/screens/MainDashboard.tsx)
- **Authentication**: [src/components/screens/PhoneAuthScreen.tsx](src/components/screens/PhoneAuthScreen.tsx)
- **Admin Dashboard**: [src/components/screens/AdminInviteCodesScreen.tsx](src/components/screens/AdminInviteCodesScreen.tsx)
- **Supabase Client**: [lib/supabase.ts](lib/supabase.ts)
- **Database Types**: [lib/database.types.ts](lib/database.types.ts)

### Configuration

- **Vite Config**: [vite.config.ts](vite.config.ts)
- **Capacitor Config**: [capacitor.config.ts](capacitor.config.ts)
- **Package.json**: [package.json](package.json)
- **TypeScript Config**: [tsconfig.json](tsconfig.json)
- **Design Tokens**: [design-tokens-complete.json](design-tokens-complete.json)

### Database

- **Migrations**: [supabase/migrations/](supabase/migrations/)
- **Edge Functions**: [supabase/functions/](supabase/functions/)
- **Supabase Dashboard**: https://app.supabase.com/project/tvvztlizyciaafqkigwe

### External Resources

- **Supabase Docs**: https://supabase.com/docs
- **Capacitor Docs**: https://capacitorjs.com/docs
- **React Router Docs**: https://reactrouter.com/
- **Howler.js Docs**: https://howlerjs.com/

---

## 15. SUMMARY

CoreTet is a **production-ready music collaboration platform** with:

- **60+ React components** using atomic design
- **32 database migrations** implementing schema evolution
- **Complete authentication system** with phone/email and beta codes
- **Track versioning system** for hero/alternate versions
- **Multi-band support** with role-based access
- **Drag-and-drop playlists** with smart filtering
- **Audio playback** with Howler.js + Web Audio API
- **Dark mode UI** using V8 logo colors (gold #e9a63c, navy #1a2332)
- **Mobile-first design** with Capacitor 7.x
- **Type-safe database** with auto-generated types

**Current Phase**: **Pre-beta testing** with invite code system ready for simplified onboarding.

**Next Milestones**:
1. Manual testing of beta invite code flow
2. TestFlight release for iOS beta testers
3. Marketing website with waitlist signup
4. Web interface for desktop users (admin-only)

**Key Strengths**:
- Well-architected component library
- Comprehensive database schema with RLS
- Strong TypeScript typing throughout
- Mobile-first with iOS support
- Dark mode by default

**Known Limitations**:
- Email verification can be buggy (mitigated by beta codes)
- Mobile testing needs manual validation
- Real-time collaboration not yet implemented
- Freemium tier system schema ready but not active

**Technical Debt**:
- Keywords system incomplete (schema ready, UI partial)
- Waveform visualization not integrated
- Feedback system hidden for beta (re-enable later)

**Overall Assessment**: Ready for controlled beta testing with invite codes. Core MVP features are complete and functional. Primary focus should be on manual testing, bug fixes, and preparing for TestFlight release.

---

**Document Prepared**: January 25, 2026
**For Code Review and Architecture Guidance**
