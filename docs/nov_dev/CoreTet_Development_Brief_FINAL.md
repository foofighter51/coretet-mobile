# CoreTet Development Brief - FINAL
**Version:** 2.0  
**Last Updated:** November 2025  
**Status:** Ready for Implementation

---

## Executive Summary

CoreTet is a private music collaboration platform for bands and musicians. This brief defines the complete development roadmap with:

- **2-tier subscription model** (Free + Band, Producer on waitlist)
- **Platform-specific interfaces** (Web for admin/power tools, Mobile for collaborators)
- **SMS-based playlist sharing** (controlled access, not open links)
- **3-part engagement system** (Listened/Liked/Loved, not star ratings)
- **Strict band isolation** (Producer tier: no cross-contamination)

---

## Product Philosophy

**Core Values:**
- Private collaboration, not social networking
- Artist maintains control over content distribution
- Different tools for different users (web vs mobile)
- No dark patterns, no artificial engagement mechanics
- Band data isolation (no leakage between projects)

**Anti-Patterns We Avoid:**
- Public feeds or discovery features
- Vanity metrics (play counts, follower counts)
- Open sharing links (risk of viral distribution)
- Gamification or streaks
- AI-generated content

---

## Tier Structure

### 🆓 Free Tier - "Solo" ($0/month)

**Target User:** Solo musicians organizing demos, bedroom producers testing the platform

**Features:**
- Personal workspace only (no band creation)
- 1GB storage (~40-50 tracks)
- Unlimited track uploads (within storage limit)
- Folder/playlist organization
- Share playlists via SMS codes (10 SMS credits/month)
- Mobile + web access
- Basic waveform player

**Limitations:**
- Cannot create band workspaces (can join others' bands as member)
- Limited SMS sharing (2 playlists max, 5 recipients each)
- 7-day max expiry on shared playlists
- No voice memo comments
- No version comparison tools
- No timestamped comments

**Storage:** 1GB = 1,073,741,824 bytes

---

### 🎸 Band Tier ($5 first month, $10/month after)

**Target User:** Active musicians in 1 serious band/project

**Features:**
- Everything in Free tier
- **1 Band workspace** with up to 10 members
- 25GB storage (~800 tracks)
- Share playlists via SMS (50 SMS credits/month)
- **Full collaboration tools:**
  - Text comments (threaded discussions)
  - Timestamped comments (click waveform to comment at specific points)
  - Voice memo comments (30-second audio clips attached to timestamps)
  - 3-part engagement (🎧 Listened / 👍 Liked / ❤️ Loved)
  - Version comparison (web: side-by-side, mobile: dropdown switcher)
  - Listen status tracking (who's heard what)
  - Task assignments (optional due dates)
  - Download original files
- **Web-exclusive features:**
  - Batch upload (drag-and-drop folder)
  - Multi-select with bulk operations
  - Advanced filtering/search
  - Keyboard shortcuts
- Mobile + web access with platform-optimized UIs

**Limitations:**
- Can only create 1 band workspace
- Cannot manage multiple projects in separate bands

**Upgrade Trigger:** User clicks "Create Band" → Stripe checkout ($5 intro, then $10/month)

**Storage:** 25GB = 26,843,545,600 bytes

---

### 🎛️ Producer Tier (Coming Q2 2026 - WAITLIST ONLY)

**Target User:** Producers managing multiple artists/bands, session musicians in 3+ projects

**Status:** Not building yet - collecting demand via waitlist

**Planned Features:**
- Everything in Band tier
- **Unlimited band workspaces**
- 100GB storage (~3,000+ tracks)
- 200 SMS credits/month
- **Producer Dashboard:**
  - Overview of all projects (metadata only, no content mixing)
  - Quick-switch between band contexts
  - Activity feed per band
- Cross-project search (within current band context only)
- Project templates
- Bulk operations across current band
- Advanced analytics (per band)
- Priority support

**Expected Pricing:** ~$25/month

**Data Isolation:** Each band is completely separate workspace. Producer must explicitly switch context to view each band. No cross-band queries or data leakage.

**Why Not Building Yet:**
- Validate core Band tier value first
- Complex dashboard requires significant dev time
- Use waitlist to gauge demand and prioritize features
- Build only if: 50+ waitlist signups OR 20+ requests from Band tier users

---

## Platform Strategy: Web vs Mobile

### Core Principle
**Different tools for different jobs:**
- **Web = Creation & Organization** (admin/songwriter activities)
- **Mobile = Consumption & Response** (collaborator activities)

### Web Interface (Desktop/Laptop)

**Framework:** React or Vue (NEW separate build, not Ionic)
- Purpose-built for desktop workflow
- Not a responsive version of mobile app

**Primary Users:**
- Band creators/admins
- Users organizing large libraries
- Power users who want keyboard shortcuts

**Core Features:**
- Batch upload (drag entire folder)
- Table view with sortable columns
- Multi-select (shift/cmd+click)
- Bulk operations (tag 20 tracks at once)
- Keyboard shortcuts (/, Space, J/K, Cmd+A, ?)
- Side-by-side version comparison
- Band member management
- Advanced search/filtering
- Context menus (right-click)

**Layout:**
```
┌────────────────────────────────────────────┐
│ CoreTet   [Workspace ▾]   [User ▾]         │ ← Top nav
├──────────┬─────────────────────────────────┤
│          │                                 │
│ SIDEBAR  │  MAIN CONTENT                   │
│          │                                 │
│ Folders  │  Table view or detail view      │
│ Tags     │  Batch actions bar              │
│ Filters  │  Multi-select enabled           │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

---

### Mobile App (iOS/Android)

**Framework:** Ionic + Capacitor (current stack - keep it)
- Touch-first, thumb-friendly UI
- Bottom navigation for key actions

**Primary Users:**
- Band members/collaborators
- Band creators when on-the-go
- Users reviewing tracks during commute

**Core Features:**
- **Playlist-first interface** (not library-first)
- One-tap playback
- Voice memo recording for comments
- Quick engagement (🎧 👍 ❤️)
- Upload from phone (record voice ideas)
- Push notifications
- Offline playback (cached tracks)

**Layout:**
```
┌──────────────────┐
│ CoreTet     🔔3  │ ← Header
├──────────────────┤
│                  │
│ 🎵 Playlists     │ ← PRIMARY
│                  │
│ This Week's Songs│
│ 🎧 2/5 listened  │
│                  │
│ Rehearsal Set    │
│ 🎧 8/8 listened  │
│                  │
│ [Browse All] ↓   │ ← SECONDARY (bottom)
│                  │
├──────────────────┤
│ [🏠][🎵][🎸][⚙️] │ ← Bottom tabs
└──────────────────┘
```

**Why Playlist-First:**
- Admin curates "This Week's Songs" or "Rehearsal Set"
- Collaborators see focused content, not overwhelming library
- Clear context: "These are the tracks that need attention"
- Progress tracking: 2/5 listened

---

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  
  -- Subscription
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'band', 'producer')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Storage
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824, -- 1GB for free
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bands
CREATE TABLE bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Storage
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 26843545600, -- 25GB default
  
  -- Limits
  max_members INT DEFAULT 10,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Band members
CREATE TABLE band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(band_id, user_id)
);

-- Tracks
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  band_id UUID REFERENCES bands(id) ON DELETE SET NULL,
  
  -- File info
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration INT, -- seconds
  
  -- Version linking
  version_parent_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  version_notes TEXT, -- "Fixed bass mix", "New chorus"
  
  -- Metadata
  waveform_data JSONB, -- cached waveform points for display
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track engagement (replaces star ratings)
CREATE TABLE track_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Listening status
  listened BOOLEAN DEFAULT FALSE,
  listened_at TIMESTAMP,
  listen_duration INT DEFAULT 0, -- seconds actually listened
  
  -- Reaction (nullable - user may listen without reacting)
  reaction TEXT CHECK (reaction IN ('liked', 'loved')),
  reacted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(track_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT, -- Text comment
  timestamp_seconds INT, -- Position in track (NULL if general comment)
  voice_memo_path TEXT, -- Path to voice memo file in storage
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlist tracks
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position INT NOT NULL, -- Order in playlist
  
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- SMS-based playlist sharing
CREATE TABLE shared_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Access control
  share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMP, -- NULL = never expires
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata (aggregate only, no user tracking)
  total_access_grants INT DEFAULT 0,
  total_plays INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual SMS access grants
CREATE TABLE playlist_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_playlist_id UUID REFERENCES shared_playlists(id) ON DELETE CASCADE,
  
  -- Recipient info (hashed for privacy)
  phone_number_hash TEXT NOT NULL,
  access_code TEXT NOT NULL, -- 6-character code (e.g., "A7K9M2")
  
  -- Access tracking
  is_used BOOLEAN DEFAULT FALSE,
  first_accessed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  access_count INT DEFAULT 0,
  
  -- Expiry
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shared_playlist_id, phone_number_hash)
);

-- SMS credits
CREATE TABLE sms_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Credit tracking
  credits_total INT NOT NULL, -- Monthly allocation
  credits_used INT DEFAULT 0,
  credits_remaining INT GENERATED ALWAYS AS (credits_total - credits_used) STORED,
  
  -- Reset tracking
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Producer waitlist
CREATE TABLE producer_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  requested_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Track queries
CREATE INDEX idx_tracks_owner ON tracks(owner_id);
CREATE INDEX idx_tracks_band ON tracks(band_id);
CREATE INDEX idx_tracks_created ON tracks(created_at DESC);

-- Engagement queries
CREATE INDEX idx_engagement_track ON track_engagement(track_id);
CREATE INDEX idx_engagement_user ON track_engagement(user_id);
CREATE INDEX idx_engagement_listened ON track_engagement(listened) WHERE listened = TRUE;

-- Comment queries
CREATE INDEX idx_comments_track ON comments(track_id);
CREATE INDEX idx_comments_timestamp ON comments(timestamp_seconds) WHERE timestamp_seconds IS NOT NULL;

-- Sharing queries
CREATE INDEX idx_shared_playlists_token ON shared_playlists(share_token);
CREATE INDEX idx_access_grants_code ON playlist_access_grants(access_code);
CREATE INDEX idx_access_grants_phone ON playlist_access_grants(phone_number_hash);
```

### Row Level Security (RLS) Policies

```sql
-- Users can view own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Band members can view band data
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Band members view band" ON bands
  FOR SELECT USING (
    id IN (
      SELECT band_id FROM band_members 
      WHERE user_id = auth.uid()
    )
  );

-- Track visibility
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own personal tracks" ON tracks
  FOR SELECT USING (
    band_id IS NULL AND owner_id = auth.uid()
  );

CREATE POLICY "Band members view band tracks" ON tracks
  FOR SELECT USING (
    band_id IN (
      SELECT band_id FROM band_members 
      WHERE user_id = auth.uid()
    )
  );

-- Strict band isolation: Cannot query across bands
-- Each query must explicitly include band_id filter
-- Producer tier users must switch context to view different band
```

---

## Engagement System (Listened/Liked/Loved)

### 3-Part System

**🎧 LISTENED** (Headphones icon)
- Binary: yes/no
- Automatically set when user listens >50% of track
- Purpose: Status indicator ("Has everyone heard this yet?")
- Shown as: "🎧 3/5 listened"

**👍 LIKED** (Thumbs up)
- Optional positive feedback
- Meaning: "This is good, keep working on it"
- Middle tier of engagement

**❤️ LOVED** (Heart icon)
- Optional strong positive feedback
- Meaning: "This is great, ready to go" or "Really dig this direction"
- Highest tier of engagement

### Database Implementation

```sql
-- One record per user per track
track_engagement {
  listened: BOOLEAN,
  listened_at: TIMESTAMP,
  listen_duration: INT (seconds),
  reaction: TEXT ('liked' | 'loved' | NULL)
}
```

### UI Display

**Track Card:**
```
Sunset Drive v3
🎧 3/5 listened
👍 2 liked
❤️ 1 loved
```

**Individual Status:**
```
You: 🎧 Listened ❤️ Loved
Alex: 🎧 Listened 👍 Liked
Sarah: (hasn't listened yet)
```

**Automatic Listen Tracking:**
- Track playback progress
- When user reaches 50% of track duration → `listened = TRUE`
- Update `listened_at` timestamp
- Save `listen_duration` (total seconds listened)

---

## SMS-Based Playlist Sharing

### Why SMS Instead of Open Links

**Problem with open links:**
- Links can be shared without permission
- No control over distribution
- Risk of unreleased music leaking
- Goes against "private collaboration" philosophy

**Solution: SMS verification**
- Artist controls exactly who gets access
- Mobile-first (SMS is mobile-native)
- Temporary access codes
- Revocable anytime
- No account required, but still secure

### How It Works

**Artist Workflow:**
1. Select playlist to share
2. Enter phone numbers of approved listeners
3. Set expiry (7 days, 30 days, 90 days, or never)
4. Send access codes via SMS

**Each recipient receives SMS:**
```
🎵 CoreTet: John shared "Summer EP Demos" with you.

5 tracks

Code: A7K9M2
Link: coretet.app/listen/xyz

Expires in 7 days
```

**Recipient Workflow:**
1. Receives SMS with link and code
2. Opens link on mobile device
3. Enters 6-character access code
4. Gets access to playlist for set duration
5. Can listen and mark "🎧 Listened" (stored in browser only)
6. Access expires or can be revoked by artist

### SMS Service Integration

**Recommended: Twilio**
- Cost: ~$0.0079 per SMS (US)
- Reliable delivery
- Good API documentation
- Free trial credits

**Alternatives:**
- AWS SNS (~$0.00645 per SMS)
- Vonage (~$0.0073 per SMS)

### SMS Credits by Tier

**Free Tier:**
- 10 SMS credits/month (included)
- Share 2 playlists max simultaneously
- 5 recipients per playlist max
- 7-day expiry max

**Band Tier:**
- 50 SMS credits/month (included)
- Share 10 playlists simultaneously
- 10 recipients per playlist
- 90-day expiry or never

**Producer Tier:**
- 200 SMS credits/month (included)
- Unlimited active shares
- Unlimited recipients per playlist
- Custom expiry dates

**Additional Credits:**
- 25 SMS for $2
- 50 SMS for $3
- 100 SMS for $5

### Security Features

**Phone Number Privacy:**
- Store SHA-256 hash only, not actual number
- Can verify code without storing raw phone
- Protects privacy if database breached

**Access Code Security:**
- 6 characters = ~2 billion combinations
- Exclude confusing characters (0/O, 1/I)
- Rate limit: 5 attempts per minute
- Lock code after 10 failed attempts

**Access Control:**
- Codes expire after set time
- Can be revoked by artist anytime
- Track usage (how many times accessed)
- Alert if unusual patterns (code shared publicly)

### Cost Analysis

**Per-user monthly SMS costs:**
- Free: 10 SMS = $0.08/month (platform absorbs)
- Band: 50 SMS = $0.40/month (included in $10)
- Producer: 200 SMS = $1.58/month (included in $25)

**Profit margins with SMS included:**
- Band tier: $10 - $1.65 cost = $8.35 profit (84%)
- Producer tier: $25 - $4.55 cost = $20.45 profit (82%)

Still very healthy margins!

---

## Version Management

### Version Linking

**Concept:**
- Tracks have `version_parent_id` linking to previous version
- Forms version chain: Demo v1 → Demo v2 → Final Mix
- Each version has `version_notes` ("Fixed bass", "New chorus")

**Database:**
```sql
tracks {
  id: UUID,
  version_parent_id: UUID (references tracks.id),
  version_notes: TEXT
}
```

**UI Display:**
```
Sunset Drive
├─ v1: Rough Demo (Nov 10)
├─ v2: Added drums (Nov 15)
└─ v3: Final Mix (Nov 20) ← current
```

### Version Comparison

**Web (Desktop):**
- Side-by-side waveforms
- Synchronized playback
- A/B toggle to switch audio
- Comments shown per version

**Layout:**
```
┌──────────────────────────────────────┐
│ Compare: [v3 Final ▾] vs [v1 Demo ▾] │
├──────────────────────────────────────┤
│                                      │
│ v3: ━━━━━━━━━━━━━━━━━━━━          │
│     💬 "Better bass" -Alex          │
│                                      │
│ v1: ━━━━━━━━━━━━━━━━━━━━          │
│     💬 "Original idea" -Sarah       │
│                                      │
│ [▶ Play Synced] [⇄ Toggle A/B]      │
└──────────────────────────────────────┘
```

**Mobile (Small Screen):**
- Simple dropdown to switch versions
- One waveform at a time
- Version notes shown below
- No side-by-side (screen too small)

**Layout:**
```
┌──────────────────┐
│ Sunset Drive     │
│                  │
│ Version: [v3 ▾]  │
│ • v3 (current)   │
│ • v2 (Nov 15)    │
│ • v1 (Nov 10)    │
│                  │
│ ━━━━━━━━━━━━━━  │
│                  │
│ Notes:           │
│ "Fixed bass mix" │
│                  │
│ [▶] Play         │
└──────────────────┘
```

---

## Storage Management

### Storage Limits by Tier

**Free:** 1GB (1,073,741,824 bytes)
**Band:** 25GB (26,843,545,600 bytes)
**Producer:** 100GB (107,374,182,400 bytes)

### Enforcement Logic

**Before Upload:**
```
1. Get current storage used (user or band)
2. Calculate: currentStorage + fileSize
3. Check if total exceeds limit
4. If yes: Block upload, show upgrade prompt
5. If no: Proceed with upload
```

**After Upload:**
```
1. File uploaded successfully to storage
2. Create track record in database
3. Trigger: Increment storage_used by file_size
4. Update user.storage_used or band.storage_used
```

**After Deletion:**
```
1. Delete track record from database
2. Delete file from storage
3. Trigger: Decrement storage_used by file_size
```

### Storage Display

**Show usage when >50% full:**
```
┌────────────────────────────────┐
│ Storage: 18.5 GB of 25 GB used │
│ [███████████░░░] 74%           │
│                                │
│ About 50 more tracks at this   │
│ quality (30MB average)         │
│                                │
│ [Manage Storage] [Add Storage] │
└────────────────────────────────┘
```

**When limit reached:**
```
┌────────────────────────────────┐
│ Storage Full                   │
│                                │
│ You've used 25 GB of 25 GB     │
│                                │
│ Free up space:                 │
│ • Delete old versions          │
│ • Archive completed projects   │
│                                │
│ Or add more:                   │
│ • +25 GB for $2/month          │
│                                │
│ [Upgrade] [Manage Storage]     │
└────────────────────────────────┘
```

---

## Producer Tier: Band Isolation

### Critical Security Requirement

**Each band must be completely isolated:**
- Band A members CANNOT see Band B exists
- Band A uploads do NOT appear in Band B
- Band A members do NOT see Band B member list
- No queries that mix band data

**Even for Producer tier user who created both bands:**
- Must explicitly switch context to view each band
- No "view all" that mixes band content
- Each band has own storage quota
- Each band has own member permissions

### Access Control Matrix

**Example:**
Producer user "Alex" creates Band A and Band B.

**Sarah (Band A member only) CANNOT:**
- See that Band B exists
- See Band B tracks
- See that Alex is in another band

**Alex (Producer, in both bands) CAN:**
- Switch between Band A and Band B workspace
- Manage both bands separately

**Alex (Producer, in both bands) CANNOT:**
- View both bands simultaneously
- Copy tracks between bands (must download + re-upload)
- Mix/match content across bands
- Search across all bands at once

### Database Enforcement

**RLS policies ensure isolation:**
```sql
CREATE POLICY "Band members see only their band's tracks"
ON tracks FOR SELECT
USING (
  band_id IN (
    SELECT band_id 
    FROM band_members 
    WHERE user_id = auth.uid()
  )
);
```

**Each query must explicitly specify band_id:**
```sql
-- ✅ GOOD: Explicit band filter
SELECT * FROM tracks 
WHERE band_id = $current_band_id
AND band_id IN (
  SELECT band_id FROM band_members WHERE user_id = auth.uid()
);

-- ❌ BAD: No band filter (would leak data)
SELECT * FROM tracks 
WHERE owner_id = auth.uid();
-- This would return tracks from ALL bands user created
```

### Producer Dashboard Design

```
┌────────────────────────────────────────┐
│ Producer Dashboard                     │
├────────────────────────────────────────┤
│                                        │
│ Your Bands:                            │
│                                        │
│ 🎸 Rock Band                           │
│    5 members • 10 tracks • Active      │
│    Last upload: 2 hours ago            │
│    Storage: 12 GB of 25 GB used        │
│    [Open Workspace →]                  │
│                                        │
│ 🎵 Jazz Trio                           │
│    3 members • 8 tracks • Active       │
│    Last upload: 1 day ago              │
│    Storage: 6 GB of 25 GB used         │
│    [Open Workspace →]                  │
│                                        │
│ 🎹 Solo Project (Personal)             │
│    15 tracks • Private                 │
│    Storage: 3 GB of 100 GB used        │
│    [Open Workspace →]                  │
│                                        │
│ [+ Create New Band]                    │
└────────────────────────────────────────┘
```

**When clicking "Open Workspace":**
- Full context switch to that band
- Header shows: "Now viewing: Rock Band"
- Only Rock Band content visible
- Must explicitly switch back to see other bands

---

## Development Phases

### Phase 1: Backend & Database (Weeks 1-2)

**Goal:** Tier structure + engagement system + data isolation

**Tasks:**
- [ ] Set up database with all tables
- [ ] Implement track_engagement (listened/liked/loved)
- [ ] Implement RLS policies for band isolation
- [ ] Create storage enforcement functions
- [ ] Test band data isolation thoroughly

**Claude Code Checks Before Implementing:**
- [ ] What's the current database schema?
- [ ] Are there any existing "ratings" or "stars" references to remove?
- [ ] Do we have test data to verify band isolation?
- [ ] Can we write a test: Band A member tries to query Band B tracks?
- [ ] Does storage trigger work correctly on upload and delete?

---

### Phase 2: Stripe + Tier Enforcement (Week 3)

**Goal:** Payment flow + subscription management

**Tasks:**
- [ ] Set up Stripe account and products
- [ ] Create checkout flow (intro + recurring pricing)
- [ ] Implement webhook handler for subscription events
- [ ] Enforce tier limits (band creation, storage)
- [ ] Handle downgrades (band becomes read-only)

**Stripe Products to Create:**
```
Product: "CoreTet Band Tier"
- Price 1: $5 one-time (code: intro_offer)
- Price 2: $10/month recurring (code: band_monthly)
```

**Claude Code Checks:**
- [ ] Is Stripe SDK installed?
- [ ] Are API keys stored securely (environment variables)?
- [ ] Does webhook verify signature correctly?
- [ ] Does checkout.session.completed update user.tier?
- [ ] Does customer.subscription.deleted downgrade correctly?
- [ ] Have we tested with Stripe test cards?

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

### Phase 3: SMS Sharing System (Week 4)

**Goal:** SMS-based playlist access control

**Tasks:**
- [ ] Set up Twilio account (or chosen SMS provider)
- [ ] Implement phone number hashing
- [ ] Implement access code generation
- [ ] Create SMS sending function
- [ ] Build access code validation
- [ ] Set up SMS credit system
- [ ] Create monthly credit reset function

**Claude Code Checks:**
- [ ] Which SMS provider did we choose?
- [ ] Are SMS API keys stored securely?
- [ ] Does phone hashing work (SHA-256)?
- [ ] Are access codes truly random (crypto.randomUUID)?
- [ ] Does code validation check all conditions (expired, revoked, etc.)?
- [ ] Can we test SMS in development without sending real messages?
- [ ] How do we handle international phone numbers?

---

### Phase 4: Web App Build (Weeks 5-7)

**Goal:** Desktop-optimized interface for power users

**Framework Decision:**
- [ ] Choose React or Vue
- [ ] Set up Vite build
- [ ] Configure Supabase client (shared with mobile)
- [ ] Set up routing

**Core Features to Build:**
- [ ] Desktop navigation (sidebar + main content)
- [ ] Batch upload component (drag-and-drop)
- [ ] Table view with multi-select
- [ ] Keyboard shortcuts
- [ ] Side-by-side version comparison
- [ ] Band member management
- [ ] Bulk operations (tagging, moving)
- [ ] Advanced search/filtering

**Claude Code Checks:**
- [ ] Does drag-and-drop accept folders (multiple files)?
- [ ] Does multi-select work with shift/cmd+click?
- [ ] Are keyboard shortcuts properly bound?
- [ ] Does version comparison sync playback?
- [ ] Can admin invite/remove band members?
- [ ] Do bulk operations batch queries efficiently?

---

### Phase 5: Mobile App Refinement (Weeks 8-9)

**Goal:** Playlist-first interface for collaborators

**Framework:** Ionic + Capacitor (current stack)

**UI Changes:**
- [ ] Redesign home screen (playlists first)
- [ ] Playlist cards with engagement stats
- [ ] Simplified track player
- [ ] Voice memo recording
- [ ] Quick engagement buttons (🎧 👍 ❤️)
- [ ] Push notifications

**Navigation Structure:**
```
Home Tab:
- Playlists (featured/recent) ← PRIMARY
- Browse All Tracks ← SECONDARY (bottom button)

Playlists Tab:
- All playlists view
- Create playlist (if admin)

Band Tab:
- Band overview
- Members
- Settings (if admin)
```

**Claude Code Checks:**
- [ ] Are playlists sorted by last_updated DESC?
- [ ] Does "Browse All" clearly indicate secondary action?
- [ ] Does playlist context persist during playback?
- [ ] Does voice memo record 30-second max?
- [ ] Do engagement reactions update optimistically?
- [ ] Do notifications deep-link correctly?

---

### Phase 6: Collaboration Features (Weeks 10-11)

**Goal:** Comments, tasks, version management

**Features to Build:**
- [ ] Timestamped comments (click waveform)
- [ ] Voice memo comments (mobile)
- [ ] Comment threading (replies)
- [ ] Version linking (track history)
- [ ] Version switcher (mobile dropdown, web side-by-side)
- [ ] Task assignments
- [ ] Listen status tracking

**Claude Code Checks:**
- [ ] Do comments appear at correct waveform position?
- [ ] Can voice memos attach to timestamps?
- [ ] Does threading work (parent/child)?
- [ ] Are versions linked via version_parent_id?
- [ ] Does mobile version switcher update audio source?
- [ ] Can tasks be marked complete?
- [ ] Is "listened" calculated at >50% playback?

---

### Phase 7: Producer Tier Waitlist (Week 12)

**Goal:** Validate demand before building

**Features:**
- [ ] Landing page explaining Producer tier
- [ ] Email capture form
- [ ] "Notify me when available" button
- [ ] Waitlist confirmation email
- [ ] Admin dashboard to view waitlist

**Claude Code Checks:**
- [ ] Does form validate email format?
- [ ] Are emails stored in producer_waitlist table?
- [ ] Does confirmation email send?
- [ ] Can we track waitlist signups over time?

---

### Phase 8: Launch Prep (Weeks 13-14)

**Goal:** Polish, test, deploy

**Tasks:**
- [ ] Email templates (welcome, payment, renewal, downgrade)
- [ ] Analytics setup (track key events)
- [ ] Bug fixes from internal testing
- [ ] Performance optimization
- [ ] Security audit (RLS policies, API endpoints)
- [ ] App store submissions (iOS + Android)
- [ ] Web app deployment
- [ ] Documentation for users

**Claude Code Checks:**
- [ ] Do all emails send correctly?
- [ ] Are analytics events firing?
- [ ] Have we tested with real Stripe payments?
- [ ] Does web app work in Chrome, Firefox, Safari?
- [ ] Do mobile apps work on real devices?
- [ ] Is rate limiting configured?
- [ ] Have we stress-tested with multiple concurrent users?

---

## Testing Strategy

### Unit Tests

**Database:**
```
Test band isolation:
✓ Band A member queries Band A tracks → Returns tracks
✓ Band A member queries Band B tracks → Returns empty
✓ Producer switches to Band B → Returns Band B tracks
✓ Producer queries without context → Returns error/empty

Test engagement:
✓ User listens >50% → listened = TRUE
✓ User listens <50% → listened = FALSE
✓ User clicks "liked" → reaction = 'liked'
✓ User changes to "loved" → reaction = 'loved'
✓ User removes reaction → reaction = NULL

Test tier enforcement:
✓ Free user creates band → Error
✓ Band user creates 1st band → Success
✓ Band user creates 2nd band → Error
✓ Producer creates 5th band → Success

Test storage limits:
✓ Free user at 900MB uploads 200MB → Error
✓ Free user at 900MB uploads 50MB → Success
✓ Delete 100MB file → storage_used decreases
```

### Integration Tests

**SMS Sharing:**
```
✓ Create share with 2 recipients → 2 SMS sent
✓ Recipient enters valid code → Access granted
✓ Recipient enters expired code → Error
✓ Recipient enters revoked code → Error
✓ Recipient accessed 10 times → Tracking correct
✓ Artist revokes access → Recipient blocked
```

**Stripe Integration:**
```
✓ Free user clicks "Create Band" → Redirects to Stripe
✓ Complete payment → Redirected back, tier updated
✓ User.tier = 'band' in database
✓ Can now create 1 band
✓ Month 2 → Charged $10 (recurring)
✓ Cancel subscription → Downgraded to free
```

### User Acceptance Tests

**Free User Journey:**
1. Sign up → Verify email → Personal workspace
2. Upload 3 tracks → Organize in folders
3. Create playlist → Share via SMS (2 recipients)
4. Recipients access with codes → Listen
5. Try to create band → Blocked, shown pricing
6. Happy with free tier → Continues using

**Band User Journey:**
1. Free user clicks "Create Band" → Stripe checkout
2. Pay $5 → Band creation form
3. Name band, invite 2 members
4. Upload 5 tracks to band
5. Member opens mobile app → Sees playlist
6. Member listens, leaves voice memo comment
7. Admin reviews on web, uploads new version
8. Iterate → Complete song

**Producer Waitlist:**
1. Band user tries to create 2nd band → Blocked
2. Shown "Producer tier coming Q2 2026"
3. Clicks "Join Waitlist" → Email captured
4. Receives confirmation email

---

## Deployment

### Infrastructure

**Backend:**
- Supabase (PostgreSQL + Storage + Auth)
- Production project

**SMS Service:**
- Twilio account (live mode)
- API keys in environment variables

**Payment Processing:**
- Stripe account (live mode)
- Webhook endpoint configured

**Email:**
- SendGrid or similar
- Transactional email templates

**Hosting:**
- Web app: Vercel or Netlify
- Mobile apps: App Store + Google Play

### Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-side only)

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx (server-side only)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Twilio (SMS)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx (server-side only)
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# App
VITE_APP_URL=https://coretet.app
```

### Monitoring

**Required:**
- Error tracking (Sentry or similar)
- Analytics (track sign-ups, conversions, engagement)
- Stripe dashboard (payment monitoring)
- Database performance monitoring
- SMS delivery rates

**Key Metrics to Track:**
- Total signups
- Free → Band conversion rate (target: 20%)
- Monthly Recurring Revenue (MRR)
- Storage usage by tier
- SMS credits used/remaining
- Producer waitlist signups
- Churn rate

---

## Success Criteria

### Month 1 (Launch)
- 500 total signups
- 50+ paid Band tier users
- <5% critical bugs
- >95% uptime

### Month 3
- 2,000 total signups
- 300+ paid Band tier users
- $3,000+ MRR
- 20%+ free → paid conversion
- 50+ Producer waitlist signups

### Month 6 (Go/No-Go for Producer Tier)
- 5,000+ total signups
- 1,000+ paid Band tier users
- $10,000+ MRR
- 100+ Producer waitlist signups
- 50+ requests for multi-band feature

**Decision:** If metrics hit, build Producer tier. If not, iterate on Band tier or pivot features.

---

## Summary for Claude Code

### Core Decisions

1. **Tier Structure:** Free (solo) + Band ($5/$10) + Producer (waitlist)
2. **Platform Strategy:** Web for admin/power tools, Mobile for collaborators
3. **Engagement:** 🎧 Listened / 👍 Liked / ❤️ Loved (not stars)
4. **Sharing:** SMS-based access codes (not open links)
5. **Isolation:** Strict band separation (no data leakage)
6. **Tech Stack:** Separate web build (React/Vue), Keep Ionic for mobile

### What Makes CoreTet Different

**Not SoundCloud:** No public profiles, no discovery, no followers
**Not BandLab:** No social network, no public sharing
**Not Dropbox:** Purpose-built for music, collaboration tools included

**CoreTet = Private Workspace + Controlled Sharing + Band Collaboration**

### Implementation Priority

1. Backend + Database (band isolation is critical)
2. Stripe integration (need revenue)
3. SMS sharing (key differentiator)
4. Web app (power user tools)
5. Mobile refinement (collaborator experience)
6. Collaboration features (comments, versions)
7. Producer waitlist (validate demand)
8. Launch!

---

## Questions for Claude Code Before Starting

**Current Codebase:**
- [ ] What's the existing database schema?
- [ ] What framework is the mobile app using?
- [ ] Is there a web version already, or starting from scratch?
- [ ] Are there existing "rating" or "sharing" features to migrate?
- [ ] What authentication system is in place?

**Implementation Approach:**
- [ ] Should we build web and mobile simultaneously or sequentially?
- [ ] Do we need a staging environment for testing?
- [ ] How should we handle database migrations?
- [ ] What's the deployment process for mobile app updates?

**Testing:**
- [ ] Can we create test bands and users for development?
- [ ] How do we test SMS without sending real messages?
- [ ] How do we test Stripe without real charges?
- [ ] What's the process for beta testing with real users?

---

This brief is now complete and ready for implementation with Claude Code. All previous feedback incorporated, SMS sharing system integrated, platform strategy defined, and development phases laid out.

Ready to build CoreTet! 🎸
