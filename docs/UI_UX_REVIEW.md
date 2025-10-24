# CoreTet Band - Comprehensive UI/UX Documentation

**Version**: Build 18 (TestFlight)
**Platform**: iOS (React + TypeScript + Ionic + Capacitor)
**Backend**: Supabase (PostgreSQL + Auth + Storage)
**Generated**: October 23, 2025
**Purpose**: Comprehensive UI/UX analysis for AI-driven review

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Complete User Flows](#complete-user-flows)
3. [Screen-by-Screen Breakdown](#screen-by-screen-breakdown)
4. [Navigation Structure](#navigation-structure)
5. [Key UI Components & Interactions](#key-ui-components--interactions)
6. [State Management](#state-management)
7. [Known Issues & Recent Fixes](#known-issues--recent-fixes)
8. [Security & Data Access](#security--data-access)

---

## App Overview

### Purpose
CoreTet Band is an iOS music collaboration platform designed for bands and musicians to share work-in-progress tracks, provide feedback through comments and ratings, and collaborate on music projects together.

### Core Value Proposition
- **Private collaboration space** for bands to share unfinished songs
- **Structured feedback system** with ratings (listened/liked/loved) and timestamped comments
- **Playlist-based organization** for grouping tracks by project, album, or session
- **Band and personal spaces** with context switching for multi-band musicians

### Key Features
- **Authentication**: Email/password via Supabase (no phone auth despite filename legacy)
- **Band Management**: Create/join bands, invite members, manage settings
- **Track Management**: Upload audio files (up to 100MB), play, comment, rate
- **Playlists**: Create playlists, add tracks, share via deep links, follow others' playlists
- **Comments**: Add timestamped comments, view unread indicators
- **Ratings**: Three-tier system (listened/liked/loved)
- **Deep Linking**: Share playlists via `coretet://playlist/{shareCode}` URLs

### Target Users
- Musicians working on original music
- Band members collaborating remotely
- Solo artists seeking feedback from trusted circles
- Producers/engineers sharing mixes for review

---

## Complete User Flows

### 1. Sign Up → Onboarding → Main Dashboard

```
Landing Page (PhoneAuthScreen)
  ↓ Toggle to "Sign Up"
  ↓ Enter email + password + confirm password
  ↓ Click "Create Account"
  ↓ Email confirmation sent
  ↓ User clicks confirmation link in email
  ↓ Deep link opens app (coretet://)
  ↓
Onboarding Screen
  ↓ User prompted: "What should we call you?"
  ↓ Enter name
  ↓ Click "Continue"
  ↓ Profile created in database
  ↓ Page reloads
  ↓
Main Dashboard (Tracks tab)
  ↓ Default empty state or existing tracks
  ↓ User sees 4-tab interface (Tracks/Playlists/Bands/Settings)
```

**Key Points**:
- Email confirmation required before access
- Onboarding only appears if profile has no name or name is "User"
- Profile auto-created on authentication with phone/email as fallback name
- Rate limiting: Max 1 signup attempt per 60 seconds (Supabase default)

### 2. Creating a Band → Inviting Members

```
Main Dashboard → Bands Tab
  ↓ Click "+ New Band" button
  ↓
Band Creation Screen
  ↓ Enter band name (required)
  ↓ Enter description (optional)
  ↓ Enter member phone numbers (optional, up to 4)
  ↓ Click "CREATE BAND"
  ↓ Band created with user as owner
  ↓ Invites sent to phone numbers if provided
  ↓
Main Dashboard (Band Context)
  ↓ Band automatically becomes current context
  ↓ User sees band tracks/playlists
```

**Band Roles**:
- **Owner**: Full control, can delete band
- **Admin**: Manage members, settings
- **Member**: View/upload tracks, comment

**Invite System**:
- Token-based invites generated
- Deep link: `coretet://invite/{token}`
- Expires after 7 days
- Accepts authenticated or unauthenticated users

### 3. Uploading a Track → Getting Feedback

```
Main Dashboard → Tracks Tab
  ↓ Click upload button (+ or Upload icon)
  ↓
Audio Uploader Modal
  ↓ Select audio file from device
  ↓ File validation (max 100MB, audio formats only)
  ↓ Enter track title (optional, defaults to filename)
  ↓ Upload progress shown
  ↓ File stored in Supabase Storage: user-{userId}/{trackId}.{ext}
  ↓ Track metadata saved to database
  ↓ Modal closes automatically
  ↓
Main Dashboard (Track appears in list)
  ↓ Band members see track immediately (if in band context)
  ↓ Others can add to playlists to share
  ↓
Track Interaction
  ↓ Tap track row to play
  ↓ Tap info icon to open Track Detail Modal
  ↓
Track Detail Modal
  ↓ View ratings (listened/liked/loved)
  ↓ Read comments (sorted by timestamp)
  ↓ Add new comment (optional timestamp capture)
  ↓ Unread indicator appears for other users
```

**Rating Flow**:
```
Track Detail Modal
  ↓ User taps rating button (headphones/thumbs-up/heart)
  ↓ Rating saved to database
  ↓ Icon fills with color
  ↓ Rating persists across sessions
```

**Comment Flow with Timestamps**:
```
Playing track (e.g., at 1:23)
  ↓ User taps info icon
  ↓ Track Detail Modal opens
  ↓ Current playback time captured (e.g., 1:23)
  ↓ User types comment
  ↓ Comment saved with timestamp_seconds: 83
  ↓ Other users see comment with "1:23" timestamp pill
  ↓ Tapping timestamp seeks to that position
```

### 4. Creating a Playlist → Sharing → Following

```
Main Dashboard → Playlists Tab
  ↓ Click "+ New Playlist" button
  ↓
Create Playlist Modal
  ↓ Enter playlist title
  ↓ Enter description (optional)
  ↓ Select band context (optional)
  ↓ Click "Create"
  ↓ Playlist created with unique share_code
  ↓
Playlist View
  ↓ Add tracks via "Add Track" button
  ↓ Select from available tracks
  ↓ Tracks appear in playlist
  ↓ Share via deep link: coretet://playlist/{shareCode}
  ↓
Recipient Flow
  ↓ Opens link (requires authentication)
  ↓ Redirected to PublicPlaylistView
  ↓ Sees playlist with all tracks
  ↓ Can play tracks
  ↓ Can click "Follow" button
  ↓ Playlist appears in their Playlists tab
```

**Playlist Features**:
- All playlists currently public (is_public: true)
- Share codes are short alphanumeric (e.g., "ABC123")
- Followers see playlist in their main list
- Drag-to-reorder not yet implemented

### 5. Accepting Band Invite

```
Receive Invite Link
  ↓ Click: coretet://invite/{token}
  ↓
AcceptInvite Screen
  ↓ If not authenticated → Show auth form
  ↓   - Signup: name + email + password → auto-accept
  ↓   - Login: email + password → auto-accept
  ↓ If authenticated → Show "Join Band" button
  ↓
Accept Invite
  ↓ Token validated (not expired, band exists)
  ↓ User added to band_members table with role: member
  ↓ BandContext refreshes automatically
  ↓ Success message shown
  ↓ Mobile: Download prompt (TestFlight link)
  ↓ Desktop: Redirect to Main Dashboard
```

### 6. Switching Band Context

```
Main Dashboard → Bands Tab
  ↓ View list of all joined bands
  ↓ Current band highlighted
  ↓ Tap different band
  ↓ BandContext.switchBand() called
  ↓ localStorage updated: currentBand_{userId}
  ↓ All track/playlist views filtered to new band
  ↓ Tracks tab refreshes
  ↓ Playlists tab refreshes
```

**Personal vs Band Context**:
- Personal tracks: Uploaded without band_id
- Band tracks: Uploaded with current band_id
- Tab filter shows: "All" | "Band" | "Personal" | "Playlists"
- RLS policies enforce visibility rules

---

## Screen-by-Screen Breakdown

### Authentication Screens

#### PhoneAuthScreen.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/PhoneAuthScreen.tsx`

**Purpose**: Email/password authentication (legacy name from phone auth prototype)

**UI Elements**:
- Logo and tagline: "CoreTet" + "Music Collaboration Platform"
- Toggle between "Sign in" and "Create Account" modes
- Email input field
- Password input field (min 6 characters)
- Confirm password field (signup only)
- Submit button ("Sign In" / "Create Account")
- Toggle link ("Don't have an account? Sign up")
- Error message display (red background)
- Success message display (green background)

**Functionality**:
- **Sign Up**:
  - Validates email format, password length, password match
  - Calls `supabase.auth.signUp()` with email confirmation
  - Sends confirmation email with deep link redirect
  - Shows success message: "Check your email to confirm"
  - Handles rate limiting errors gracefully
- **Sign In**:
  - Validates email/password
  - Calls `supabase.auth.signInWithPassword()`
  - Auto-navigates on success (auth state change)
  - Shows user-friendly error messages

**Error Handling**:
- "Email already registered" → Switches to sign-in mode
- "Email rate limit exceeded" → User-friendly message
- "Invalid login credentials" → Generic security message
- "Email not confirmed" → Prompts to check inbox

**Known Issues**:
- Fixed: Email confirmation deep link now properly opens app
- Fixed: Profile auto-creation on signup

---

#### OnboardingScreen.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/OnboardingScreen.tsx`

**Purpose**: Collect user's display name after authentication

**Trigger Condition**:
```javascript
const needsOnboarding = !profile?.name || profile.name === 'User';
```

**UI Elements**:
- Heading: "Welcome to CoreTet"
- Prompt: "What should we call you?"
- Text input for name
- "Continue" button (disabled until name entered)
- Error display (if profile update fails)

**Functionality**:
- Validates name is not empty
- Updates `profiles` table with user's name
- Verifies update succeeded
- Reloads page to refresh auth state
- If update fails, shows error (rare)

**Data Flow**:
```javascript
User enters name → db.profiles.update(userId, { name }) → Verify → window.location.reload()
```

---

### Main Dashboard

#### MainDashboard.tsx (Partial)
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/MainDashboard.tsx`

**Purpose**: Primary interface with 4-tab layout and core music collaboration features

**Layout Structure**:
```
┌────────────────────────┐
│ Header (Band Selector) │  ← Current band name + dropdown
├────────────────────────┤
│                        │
│   Tab Content Area     │  ← Dynamic content based on active tab
│   (Scrollable)         │
│                        │
├────────────────────────┤
│ PlaybackBar (if track) │  ← Fixed bottom bar when track playing
├────────────────────────┤
│ ⚫ ⚫ ⚫ ⚫              │  ← 4-tab navigation bar
│ Tracks Playlists       │
│ Bands Settings         │
└────────────────────────┘
```

**Tabs**:
1. **Tracks Tab** (default)
   - Search bar
   - Filter buttons: All / Band / Personal / Playlists
   - Sort options: Recent / Alphabetical / Duration
   - Upload button (floating action button)
   - Track list (swipeable rows)
   - Empty states with tutorial prompts

2. **Playlists Tab**
   - "Created" section (user's playlists)
   - "Following" section (followed playlists)
   - "+ New Playlist" button
   - Playlist cards with share buttons

3. **Bands Tab**
   - List of joined bands
   - Current band highlighted
   - "+ New Band" button
   - Band info (member count, role)

4. **Settings Tab**
   - User profile
   - Band settings (if owner/admin)
   - Tutorial toggle
   - Logout button

**Key Features**:

**Track Row Interactions**:
- Tap: Play/pause track
- Info icon: Open Track Detail Modal
- Swipe right: Quick actions (add to playlist, rate)
- Long press: Context menu (edit/delete/share)

**Track Detail Modal**:
- Track title + duration
- Ratings section (listened/liked/loved counts)
- Comments section (scrollable, timestamps)
- Comment input with captured timestamp
- Unread indicator (blue dot on MessageCircle icon)

**Audio Upload**:
- Click upload button → AudioUploader modal
- File picker (iOS native)
- File validation: audio formats, max 100MB
- Progress bar during upload
- Auto-adds to current band/personal context

**Playback Controls**:
- Global audio element managed by audioRef
- PlaybackBar component (fixed bottom)
- Draggable scrubber with timestamp tooltip
- Play/pause button
- Time display (current/total)
- Waveform visualization (visual only)

**Search & Filter**:
- Real-time search by track title
- Filter by: All/Band/Personal/Playlists
- Sort by: Upload date/Alphabetical/Duration
- Filters persist during session

**Tutorial System**:
- First-time user prompts
- Dismissible tooltips
- localStorage-based tracking
- Can be reset in Settings

---

### Playlist Views

#### PublicPlaylistView.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/PublicPlaylistView.tsx`

**Purpose**: Shared playlist view accessible via deep link

**Access**: Requires authentication (redirects to login if not authenticated)

**URL Pattern**: `/playlist/{shareCode}`

**UI Elements**:
- Back button ("Back to App")
- Playlist title + description
- Follow button (heart icon, toggles)
- Track list with play buttons
- PlaybackBar (fixed bottom when playing)

**Functionality**:
- Fetches playlist by share_code from database
- Loads all playlist tracks
- Checks if current user is following
- Allows play/pause for each track
- Follow/unfollow updates database and context

**States**:
- Loading: Spinner with "Loading playlist..."
- Error: "Playlist not found" with "Go to App" button
- Success: Full playlist view with playable tracks

**Follow Feature**:
- Only shown if user is authenticated
- Hidden if user is playlist owner
- Updates `playlist_followers` table
- Followed playlists appear in main Playlists tab

---

### Band Screens

#### BandActionScreen.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/BandActionScreen.tsx`

**Purpose**: Initial choice screen (join vs create band)

**UI Elements**:
- Heading: "What would you like to do?"
- "JOIN A BAND" button (primary blue)
- "START A NEW BAND" button (outline blue)
- "Skip for now" link (gray text)

**Navigation**:
- Join → BandJoiningScreen (not analyzed in detail)
- Create → BandCreationScreen
- Skip → MainDashboard (with no band context)

---

#### BandCreationScreen.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/BandCreationScreen.tsx`

**Purpose**: Create new band and optionally invite members

**UI Elements**:
- Back button
- Heading: "Start a New Band"
- Band name input (required)
- Description textarea (optional)
- 4 phone number inputs (optional)
- "CREATE BAND" button

**Functionality**:
- Validates band name is not empty
- Filters out empty phone number fields
- Calls `createBand()` with name, description, authorizedPhones
- Creates band with user as owner
- Sends invite tokens to provided phone numbers
- Auto-switches to new band context on success

**Data Created**:
1. New band record in `bands` table
2. Band member record (creator as owner)
3. Invite records for each phone number

---

#### AcceptInvite.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/AcceptInvite.tsx`

**Purpose**: Handle band invite acceptance (authenticated or unauthenticated)

**URL Pattern**: `/invite/{token}`

**Flow States**:

**1. Loading State**:
- Spinner with "Loading invite..."
- Validates token from URL

**2. Unauthenticated State**:
- Shows auth form (signup or login toggle)
- Band name displayed: "Join {bandName}"
- Invited by: "{inviterName}"
- Signup: Name + Email + Password → Auto-accept
- Login: Email + Password → Auto-accept

**3. Authenticated State**:
- Band info card
- "Join Band" button
- "Cancel" button

**4. Success State**:
- Green checkmark
- "Welcome to {bandName}!"
- Mobile: Download app prompt (TestFlight link)
- Desktop: Redirects to Main Dashboard

**5. Error State**:
- Red alert icon
- "Invalid Invite" or "Invite Expired"
- "Go to Home" button

**Data Operations**:
- Validates token not expired
- Adds user to `band_members` table
- Refreshes BandContext automatically
- Invalid token shows error without database modification

---

### Landing Page (Web)

#### LandingPage.tsx
**File**: `/Users/exleymini/Apps/coretet-band/src/components/screens/LandingPage.tsx`

**Purpose**: Public marketing page (web only, not shown in iOS app)

**Shown When**: Web browser, not authenticated, not on native platform

**Content**: (Not analyzed in detail - marketing content)

---

## Navigation Structure

### Route Configuration

**File**: `/Users/exleymini/Apps/coretet-band/src/App.tsx`

```
Routes:
┌─────────────────────────────────────────────────────────┐
│ /invite/:token                                          │  ← Band invite acceptance
│   → AcceptInvite (auth-aware)                          │
├─────────────────────────────────────────────────────────┤
│ /playlist/:shareCode                                    │  ← Shared playlist view
│   → PublicPlaylistView (requires auth)                 │
├─────────────────────────────────────────────────────────┤
│ /app/*                                                  │  ← Future nested routes
│   → AppContent (requires auth)                         │
├─────────────────────────────────────────────────────────┤
│ /                                                       │  ← Root/home
│   Native: PhoneAuthScreen → AppContent                 │
│   Web: LandingPage → AppContent (if auth'd)           │
├─────────────────────────────────────────────────────────┤
│ *                                                       │  ← Catch-all
│   Native: PhoneAuthScreen                              │
│   Web: LandingPage                                     │
└─────────────────────────────────────────────────────────┘
```

### Deep Link Handling

**Supported Schemes**:
- `coretet://` (native app)
- `https://coretet.com/` (web with redirect)

**Deep Link Patterns**:
```
coretet://invite/{token}       → AcceptInvite screen
coretet://playlist/{shareCode} → PublicPlaylistView screen
coretet://                     → Main Dashboard (home)
```

**Implementation**:
- DeepLinkService initialized on native platforms
- Handles app launch URLs
- Handles incoming URLs while app running
- Parses URL and navigates with React Router

---

## Key UI Components & Interactions

### Molecules (Reusable Components)

#### PlaybackBar
**Purpose**: Fixed bottom audio player controls

**Props**:
- `track`: Current track object
- `audioRef`: Reference to audio element
- `isPlaying`: Boolean playing state
- `onPlayPause`: Play/pause callback

**Features**:
- Waveform visualization (decorative)
- Draggable scrubber with touch target (44px)
- Time display (current / total)
- Play/pause button
- Track title display

**Interactions**:
- Drag scrubber → Seeks audio position
- Tap progress bar → Seeks to tapped position
- Tap play/pause → Controls playback
- Shows timestamp tooltip while dragging

---

#### TrackRowWithPlayer
**Purpose**: Track list item with inline play controls

**Features**:
- Track title + artist
- Duration display
- Play/pause button
- Info button → Opens Track Detail Modal
- Rating indicators (if rated)
- Comment indicator (unread badge)
- Swipeable actions

**States**:
- Default (not playing)
- Playing (blue background, animated icon)
- Selected (highlighted)

---

#### SwipeableTrackRow
**Purpose**: Enhanced track row with swipe gestures

**Swipe Right Actions**:
- Add to playlist
- Quick rate (listened/liked/loved)

**Swipe Left Actions**:
- Edit (owner only)
- Delete (owner only)

---

#### AudioUploader
**Purpose**: Modal for uploading audio files

**UI**:
- File picker button
- Selected file display
- Track title input
- Upload progress bar
- Cancel button

**Validation**:
- File type: audio/* only
- Max size: 100MB
- Filename sanitization

**Upload Flow**:
1. User selects file
2. File validated
3. Upload to Supabase Storage
4. Create track record in database
5. Close modal on success

---

#### TabBar
**Purpose**: Bottom navigation with 4 tabs

**Tabs**:
- Tracks (Music icon)
- Playlists (List icon)
- Bands (Users icon)
- Settings (Settings icon)

**State**: Active tab highlighted with blue color

---

#### BandModal
**Purpose**: Band selection and creation interface

**Features**:
- List of user's bands
- Current band indicator
- Switch band button
- Create new band button
- Band settings (owner/admin only)

---

#### Tutorial
**Purpose**: First-time user guidance

**Tooltips**:
- Upload instructions
- Playback controls
- Rating system
- Comment features

**Storage**: localStorage to track dismissed tooltips

---

### Atoms (Basic UI Elements)

#### Spinner
**Purpose**: Loading indicator

**Props**:
- `size`: Diameter in pixels
- `label`: Optional text below spinner

---

#### ErrorDisplay
**Purpose**: Error message banner

**Props**:
- `error`: Error message string
- `onDismiss`: Callback to clear error

---

### Interactions & Gestures

**Touch Interactions**:
- Tap: Primary action (play, select)
- Long press: Context menu (future)
- Swipe right: Quick actions
- Swipe left: Destructive actions
- Drag: Scrubber, reorder (future)

**Scroll Behavior**:
- Vertical scroll: Track/playlist lists
- Overscroll bounce: iOS native feel
- Scroll-to-top: Tap status bar (native)
- Fixed elements: PlaybackBar, TabBar

**Modal Interactions**:
- Backdrop tap: Closes modal
- Escape key: Closes modal (web)
- Prevent scroll behind modal

---

## State Management

### Context Providers

#### BandContext
**File**: `/Users/exleymini/Apps/coretet-band/src/contexts/BandContext.tsx`

**Purpose**: Manage band selection and membership

**State**:
- `currentBand`: Currently selected band object
- `userBands`: Array of all bands user belongs to
- `userRole`: User's role in current band (owner/admin/member)
- `isLoading`: Loading state

**Methods**:
- `switchBand(bandId)`: Change current band context
- `refreshBands()`: Reload bands from database

**Persistence**:
- `localStorage`: `currentBand_{userId}` stores selected band ID

**Auto-refresh Triggers**:
- User ID changes
- Component mount

---

#### PlaylistContext
**File**: `/Users/exleymini/Apps/coretet-band/src/contexts/PlaylistContext.tsx`

**Purpose**: Manage playlists (created and followed)

**State**:
- `playlists`: All playlists (created + followed + band)
- `createdPlaylists`: Playlists created by user
- `followedPlaylists`: Playlists user follows
- `currentPlaylist`: Currently viewing/editing playlist
- `isLoading`: Loading state
- `error`: Error message

**Methods**:
- `createPlaylist(title, description, bandId)`: Create new playlist
- `deletePlaylist(playlistId)`: Delete playlist
- `addTrackToPlaylist(playlistId, trackId)`: Add track
- `refreshPlaylists()`: Reload all playlists
- `setCurrentPlaylist(playlist)`: Set active playlist

**Auto-refresh Triggers**:
- User ID changes
- Current band changes
- Component mount

**Playlist Aggregation**:
- Combines created, followed, and band playlists
- Deduplicates by playlist ID
- Preserves separate lists for UI categorization

---

### Local State Patterns

**Component-level State**:
```typescript
// Common pattern across screens
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<Type[]>([]);
```

**Form State**:
```typescript
// Example from BandCreationScreen
const [bandName, setBandName] = useState('');
const [description, setDescription] = useState('');
const [memberPhones, setMemberPhones] = useState<string[]>(['', '', '', '']);
```

**Modal State**:
```typescript
const [showModal, setShowModal] = useState(false);
const [modalContent, setModalContent] = useState<ReactNode | null>(null);
```

---

### Audio State Management

**Global Audio Element**:
```typescript
const audioRef = useRef<HTMLAudioElement | null>(null);
```

**Playback State**:
- `currentTrack`: Track object being played
- `isPlaying`: Boolean playing state
- `currentTime`: Playback position (seconds)
- `duration`: Track duration (seconds)

**Audio Lifecycle**:
1. User taps play → Create audio element if needed
2. Set audio.src to track file_url
3. Call audio.play()
4. Update playback state
5. User scrubs → Update audio.currentTime
6. Track ends → Reset playback state

---

## Known Issues & Recent Fixes

### Recently Fixed Issues (Build 18)

#### 1. Email Confirmation Rate Limiting
**Problem**: Users hitting "Email rate limit exceeded" when signing up multiple times

**Root Cause**: Supabase default rate limit (1 email per 60 seconds)

**Fix**:
- Added user-friendly error message
- Switched user to sign-in mode if "already registered"
- Clear instructions to check spam folder

**Status**: Fixed in PhoneAuthScreen.tsx

---

#### 2. Profile Creation Failure
**Problem**: Onboarding screen appearing for already-authenticated users

**Root Cause**: Profile not auto-created on signup

**Fix**:
- App.tsx now creates profile automatically after authentication
- Fallback name uses `firstName` metadata or phone number
- Verification step ensures profile exists before proceeding

**Status**: Fixed in App.tsx (lines 42-69)

---

#### 3. UUID Migration
**Problem**: Profile IDs were string type, needed UUID for Supabase Auth

**Fix**:
- Migration: `20251022_uuid_migration_final.sql`
- All profile IDs converted to UUID
- Foreign key constraints updated

**Status**: Completed, tested in production

---

#### 4. Vertical Scroll Drift
**Problem**: Opening track detail modal caused page to jump vertically

**Root Cause**: Modal changing body overflow-y

**Fix**: Preserve scroll position when opening/closing modals

**Status**: Fixed (mentioned in TESTING_CHECKLIST.md)

---

#### 5. Unread Comments Not Showing
**Problem**: Users couldn't see which tracks had new comments

**Fix**:
- Added `comment_views` table tracking last viewed time
- Blue MessageCircle icon with red dot badge for unread
- Gray outline icon for read comments
- No icon if no comments exist

**Status**: Fixed in Build 11+ (tracked in TESTING_CHECKLIST.md)

---

#### 6. Tab Switching Blocked by Modal
**Problem**: Couldn't switch tabs while viewing track detail or playlist

**Fix**: Adjusted z-index and modal structure to keep TabBar accessible

**Status**: Fixed

---

#### 7. Band Members Showing "Unknown"
**Problem**: Band settings displaying "Unknown" for member names

**Root Cause**: Profile fetching race condition

**Fix**: Proper async profile loading with error handling

**Status**: Fixed

---

#### 8. Clerk Cleanup (Security)
**Problem**: Misleading function name `clerk_user_id()` when using Supabase Auth

**Fix**:
- Created `current_user_id()` function
- Kept `clerk_user_id()` as alias for backwards compatibility
- Removed unused Clerk TypeScript files
- Cleaned API keys from `.env.local`

**Status**: Phase 1 complete, Phase 2 pending (remove alias after 7 days)

---

### Known Open Issues

#### iOS 18.6 Simulator Bug
**Problem**: Cannot type in login input fields on iOS 18.6 Simulator

**Root Cause**: Apple WKWebView bug, not our code

**Workaround**: Test on iOS 17 simulator or physical device

**Impact**: Simulator testing only, production unaffected

**Documentation**: `/Users/exleymini/Apps/coretet-band/docs/eod-status/2025-10-17-eod.md`

---

#### Phase 1 RLS Monitoring
**Status**: Day 6 of 7 monitoring period (as of Oct 23, 2025)

**Purpose**: Verify Row Level Security policies don't break existing functionality

**Policies Enabled**:
- Users can only see own personal tracks
- Band members can see all band tracks
- Followers can see tracks in followed playlists

**Success Criteria**:
- No data access violations reported
- All CRUD operations working
- No performance degradation
- Baseline metrics stable (235 tracks total)

**Next Step**: Phase 2 (tighten personal track isolation) after monitoring complete

**Documentation**: `/Users/exleymini/Apps/coretet-band/docs/security/phase1-baseline-data.md`

---

## Security & Data Access

### Authentication
- **Provider**: Supabase Auth (email/password)
- **Session**: JWT tokens with auto-refresh
- **Email Verification**: Required before access
- **Password**: Minimum 6 characters

### Authorization (Row Level Security)

**Phase 1 Policies (Currently Active)**:

**Tracks**:
```sql
-- Users can view their own tracks
tracks_select_own

-- Band members can view all band tracks
tracks_select_band_members

-- Users can view tracks in playlists they follow
tracks_select_followed_playlists

-- Permissive policy for personal tracks (Phase 2 will tighten)
tracks_select_personal_permissive
```

**Bands**:
- Members can view band details
- Only owners can delete bands
- Admins can manage settings

**Playlists**:
- Creators have full control
- Followers can view but not edit
- Public playlists visible to all authenticated users

### File Storage Security
- **Bucket**: `track-files` (private)
- **Path Structure**: `user-{userId}/{trackId}.{ext}`
- **Access**: Signed URLs with expiration
- **Validation**: File type, size (100MB max)
- **Sanitization**: Filename cleaned of special characters

### API Security
- **Service Role Key**: Never exposed to client
- **Anon Key**: Used for authenticated requests only
- **CORS**: Configured for app domain only

### Data Privacy
- User profiles: Email + name + optional bio
- Track metadata: Public within band/playlist context
- Comments/ratings: Attributed to user profiles
- No PII exposed in URLs or logs (mostly)

**Remaining Privacy Concerns**:
- 301 console.log statements may leak PII
- Error messages sometimes expose database structure
- Recommendation: Remove debug logs before production launch

---

## Appendix: File References

### Key Source Files
- **App Router**: `/Users/exleymini/Apps/coretet-band/src/App.tsx`
- **Main Dashboard**: `/Users/exleymini/Apps/coretet-band/src/components/screens/MainDashboard.tsx`
- **Auth Screen**: `/Users/exleymini/Apps/coretet-band/src/components/screens/PhoneAuthScreen.tsx`
- **Onboarding**: `/Users/exleymini/Apps/coretet-band/src/components/screens/OnboardingScreen.tsx`
- **Band Creation**: `/Users/exleymini/Apps/coretet-band/src/components/screens/BandCreationScreen.tsx`
- **Accept Invite**: `/Users/exleymini/Apps/coretet-band/src/components/screens/AcceptInvite.tsx`
- **Playlist View**: `/Users/exleymini/Apps/coretet-band/src/components/screens/PublicPlaylistView.tsx`
- **Band Context**: `/Users/exleymini/Apps/coretet-band/src/contexts/BandContext.tsx`
- **Playlist Context**: `/Users/exleymini/Apps/coretet-band/src/contexts/PlaylistContext.tsx`

### Documentation Files
- **Testing Checklist**: `/Users/exleymini/Apps/coretet-band/docs/TESTING_CHECKLIST.md`
- **Recent Status**: `/Users/exleymini/Apps/coretet-band/docs/eod-status/2025-10-21-eod.md`
- **Security Roadmap**: `/Users/exleymini/Apps/coretet-band/docs/security/security-implementation-roadmap.md`

---

**End of UI/UX Documentation**
**Generated**: October 23, 2025
**For**: AI-driven UX review and analysis
