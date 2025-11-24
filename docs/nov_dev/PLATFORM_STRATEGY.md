# CoreTet Platform Strategy
**3-Platform Architecture: Web Admin + Native Mobile + Mobile Web**

**Last Updated:** 2025-11-18
**Status:** Architecture Design

---

## Overview

CoreTet uses a **3-platform strategy** optimized for different user types and use cases:

1. **Desktop Web App** - Account holders (admins, band creators) - Power tools
2. **Native Mobile App** - Account holders (iOS/Android) - Full features on mobile
3. **Mobile Web App** - SMS recipients (no download) - Lightweight playlist access

---

## Platform Breakdown

### 1. Desktop Web App (React/Vue)

**Target Users:** Account owners, band creators, administrators

**Primary Use Cases:**
- Batch uploads (drag entire folders)
- Organize large libraries
- Band management (members, permissions)
- Billing and subscription management
- Advanced features (version comparison, bulk operations)

**Tech Stack:**
- React or Vue.js (separate build from Ionic)
- Desktop-optimized UI
- Keyboard shortcuts
- Multi-select, drag-and-drop
- Table views

**Features:**
- Sign up: Email + Password + Phone
- Sign in: Email + Password
- Batch upload (50 files at once)
- Table view with sorting/filtering
- Multi-select operations
- Side-by-side version comparison
- Band settings and member management
- Payment/subscription management
- Export/download originals

**URL:** `https://app.coretet.com`

---

### 2. Native Mobile App (iOS/Android)

**Target Users:** Account holders (full app access)

**Primary Use Cases:**
- Listen to playlists on the go
- Upload single tracks or voice memos
- Leave timestamped comments
- Quick ratings (Listened/Liked/Loved)
- Receive push notifications
- Offline caching

**Tech Stack:**
- Ionic + Capacitor (current codebase)
- iOS and Android builds
- Native features (push notifications, file picker, Share sheet)

**Features:**
- Sign up: Email + Password + Phone
- Sign in: Email + Password
- Full account access (personal + bands)
- Upload from phone (camera roll, voice recorder)
- Voice memo comments (30 seconds)
- Push notifications
- Offline playback
- Share playlists (generates SMS codes)
- "Shared with Me" tab (playlists from SMS links)

**Distribution:**
- iOS: TestFlight (beta), App Store (production)
- Android: Google Play (beta + production)

---

### 3. Mobile Web App (PWA)

**Target Users:** SMS share recipients (no account, no download)

**Primary Use Cases:**
- Access shared playlists via SMS link
- Listen to tracks without creating account
- Basic engagement (mark as listened)
- Optional: Upgrade to full account

**Tech Stack:**
- Same Ionic codebase (responsive mode)
- Progressive Web App (installable)
- Lightweight, optimized for mobile browsers

**Features (Limited):**
- ✅ Access via SMS code (no login)
- ✅ Listen to shared playlist tracks
- ✅ Track progress (localStorage only)
- ✅ Mark as listened (localStorage only)
- ✅ "Create Account" upgrade banner
- ❌ No uploads
- ❌ No comments
- ❌ No personal library
- ❌ No notifications

**URL:** `https://listen.coretet.com/playlist/{share_token}`

**Flow:**
```
1. Recipient receives SMS:
   "🎵 Alex shared 'Summer Demos' with you
   Code: A7K9M2
   Link: https://listen.coretet.com/xyz123"
   ↓
2. Taps link → Opens in mobile browser (Safari, Chrome)
   ↓
3. Lands on access page:
   ┌────────────────────────────────┐
   │ 🎵 CoreTet                     │
   │                                │
   │ Enter Access Code              │
   │ [A][7][K][9][M][2]            │
   │ [Access Playlist]              │
   └────────────────────────────────┘
   ↓
4. Code validated → Playlist loads
   ↓
5. Lightweight player:
   ┌────────────────────────────────┐
   │ ← Summer Demos                 │
   │ Shared by Alex • 5 tracks      │
   │                                │
   │ 1. Sunset Drive        3:42    │
   │    [▶]                         │
   │                                │
   │ 2. Night Drive         4:15    │
   │    [▶]                         │
   │                                │
   │ 🎧 You've listened to 2/5      │
   │                                │
   │ ╔══════════════════════════╗   │
   │ ║ 💾 Save this playlist    ║   │
   │ ║ Create a free account to ║   │
   │ ║ keep access forever      ║   │
   │ ║ [Create Account] [Later] ║   │
   │ ╚══════════════════════════╝   │
   └────────────────────────────────┘
   ↓
6. No download required
   No account required (optional)
   No app install prompt (unless user wants PWA)
```

---

## Platform Comparison

| Feature | Desktop Web | Native Mobile | Mobile Web |
|---------|-------------|---------------|------------|
| **Target User** | Account owners | Account owners | SMS recipients |
| **Authentication** | Email+Password | Email+Password | SMS code only |
| **Download Required** | No | Yes | No |
| **Batch Upload** | ✅ (50 files) | ❌ | ❌ |
| **Single Upload** | ✅ | ✅ | ❌ |
| **Voice Memos** | ❌ | ✅ | ❌ |
| **Comments** | ✅ | ✅ | ❌ |
| **Ratings** | ✅ | ✅ | ✅ (localStorage) |
| **Push Notifications** | ❌ | ✅ | ❌ |
| **Offline Playback** | ❌ | ✅ | ❌ |
| **Version Comparison** | ✅ (side-by-side) | ✅ (swipe) | ❌ |
| **Band Management** | ✅ | ✅ | ❌ |
| **Subscription Management** | ✅ | ✅ | ❌ |
| **Keyboard Shortcuts** | ✅ | ❌ | ❌ |
| **Multi-select** | ✅ | ❌ | ❌ |
| **Table View** | ✅ | ❌ | ❌ |
| **Create Account** | ✅ | ✅ | ✅ (upgrade CTA) |

---

## Codebase Architecture

### Current State
- ✅ Ionic + Capacitor (mobile app)
- ✅ Responsive design (works on web)
- ✅ PWA capabilities

### Required Changes

#### Option A: Single Codebase (Recommended)
**Use Ionic for all 3 platforms:**

```
coretet-band/
├── src/
│   ├── components/
│   │   ├── screens/
│   │   │   ├── desktop/         # Desktop-only screens
│   │   │   │   ├── BatchUploadView.tsx
│   │   │   │   ├── TableView.tsx
│   │   │   │   └── BandManagementView.tsx
│   │   │   ├── mobile/          # Full mobile app screens
│   │   │   │   ├── MainDashboard.tsx (existing)
│   │   │   │   ├── VoiceMemoRecorder.tsx
│   │   │   │   └── MobilePlayerView.tsx
│   │   │   └── guest/           # Mobile web (guest) screens
│   │   │       ├── GuestAccessPage.tsx
│   │   │       ├── GuestPlaylistView.tsx
│   │   │       └── GuestPlayerView.tsx
│   │   └── molecules/
│   │       ├── desktop/         # Desktop-specific components
│   │       ├── mobile/          # Mobile-specific components
│   │       └── shared/          # Shared components
│   └── routes/
│       ├── AppRouter.tsx        # Full app routes (authenticated)
│       └── GuestRouter.tsx      # Guest routes (SMS access)
├── capacitor.config.ts          # iOS/Android config
└── vite.config.ts               # Web build config
```

**Routing Strategy:**
```typescript
// Detect platform and user state
const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
const isGuest = !currentUser && isAccessCodeRoute;

if (isGuest) {
  // Guest Mobile Web (SMS recipient)
  <GuestRouter />
} else if (platform === 'web') {
  // Desktop Web (account holder)
  <DesktopAppRouter />
} else {
  // Native Mobile (account holder)
  <MobileAppRouter />
}
```

**Benefits:**
- ✅ Single codebase
- ✅ Shared components (player, track card, etc.)
- ✅ Consistent business logic
- ✅ Easier maintenance
- ✅ Already have Ionic setup

**Challenges:**
- ⚠️ Desktop UI needs significant work
- ⚠️ Bundle size (all platforms in one build)

---

#### Option B: Separate Codebases
**Build separate React/Vue app for desktop:**

```
coretet-web/           # Desktop web app (React/Vue)
├── src/
│   ├── components/
│   │   ├── BatchUpload/
│   │   ├── TableView/
│   │   └── BandManagement/
│   └── routes/
└── vite.config.ts

coretet-band/          # Ionic mobile app (existing)
├── src/
│   ├── components/
│   │   ├── mobile/    # Full app features
│   │   └── guest/     # Guest/SMS access
│   └── routes/
│       ├── AppRouter.tsx
│       └── GuestRouter.tsx
└── capacitor.config.ts
```

**Benefits:**
- ✅ Optimized bundle per platform
- ✅ Independent deployment
- ✅ Desktop can use different tech stack
- ✅ Cleaner separation of concerns

**Challenges:**
- ⚠️ Duplicate business logic
- ⚠️ More maintenance overhead
- ⚠️ Shared components need to be extracted to library

---

## Recommended Approach: Option A (Single Codebase)

**Use Ionic for all 3 platforms** with conditional rendering:

### Implementation Plan

**1. Detect Platform/User State**
```typescript
// lib/platform.ts
export function getPlatformContext() {
  const platform = Capacitor.getPlatform();
  const isNative = platform !== 'web';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isDesktop = platform === 'web' && !isMobile;
  const isGuest = !currentUser; // Check auth state

  return {
    isDesktop,    // Desktop web browser (account holder)
    isNative,     // iOS/Android app (account holder)
    isMobileWeb,  // Mobile web browser (could be guest or account holder)
    isGuest       // No account (SMS recipient)
  };
}
```

**2. Route-Based Platform Detection**
```typescript
// App.tsx
function App() {
  const { isGuest, isDesktop, isNative } = getPlatformContext();
  const location = useLocation();

  // Check if accessing guest route
  const isGuestRoute = location.pathname.startsWith('/listen/');

  if (isGuestRoute || isGuest) {
    return <GuestRouter />;        // Mobile web (SMS access)
  }

  if (isDesktop) {
    return <DesktopAppRouter />;   // Desktop web (full features)
  }

  if (isNative) {
    return <MobileAppRouter />;    // Native app (full features)
  }

  // Fallback: redirect to appropriate platform
  return <PlatformRedirect />;
}
```

**3. Guest Router (Mobile Web)**
```typescript
// routes/GuestRouter.tsx
export function GuestRouter() {
  return (
    <Routes>
      <Route path="/listen/:shareToken" element={<GuestAccessPage />} />
      <Route path="/playlist/:playlistId" element={<GuestPlaylistView />} />
      <Route path="/create-account" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
```

**4. Conditional Feature Rendering**
```typescript
// components/PlayerBar.tsx
export function PlayerBar({ track }) {
  const { isGuest, isDesktop } = getPlatformContext();

  return (
    <div className="player-bar">
      {/* Basic playback controls (all platforms) */}
      <PlaybackControls track={track} />

      {/* Comments (account holders only) */}
      {!isGuest && <CommentsButton track={track} />}

      {/* Voice memo (native mobile only) */}
      {!isGuest && isNative && <VoiceMemoButton track={track} />}

      {/* Advanced controls (desktop only) */}
      {!isGuest && isDesktop && <AdvancedControls track={track} />}

      {/* Upgrade CTA (guests only) */}
      {isGuest && <UpgradeBanner />}
    </div>
  );
}
```

---

## URL Structure

```
DESKTOP WEB (Account Holders):
https://app.coretet.com/
https://app.coretet.com/dashboard
https://app.coretet.com/bands/{bandId}
https://app.coretet.com/playlists/{playlistId}
https://app.coretet.com/settings
https://app.coretet.com/billing

MOBILE WEB (SMS Recipients - Guest Access):
https://listen.coretet.com/xyz123              → Access code entry
https://listen.coretet.com/playlist/abc         → Playlist view (after code)
https://listen.coretet.com/create-account       → Upgrade to account

NATIVE MOBILE APP (Deep Links):
coretet://dashboard
coretet://playlist/{playlistId}
coretet://invite/{inviteToken}
```

---

## DNS/Subdomain Strategy

```
app.coretet.com       → Desktop web app (Netlify)
listen.coretet.com    → Mobile web app (Netlify, same build, different routes)
api.coretet.com       → Backend API (if needed, currently using Supabase)
```

**OR simpler:**
```
coretet.com                       → Marketing site
coretet.com/app                   → Desktop web app
coretet.com/listen/{shareToken}   → Mobile web (guest access)
```

---

## Guest User Experience (Mobile Web)

### Minimal UI - No Clutter

**Features Available:**
- ✅ Enter access code
- ✅ View playlist tracks
- ✅ Play/pause/skip
- ✅ Track progress (localStorage)
- ✅ Mark as listened (localStorage)
- ✅ See who shared (artist name)
- ✅ "Create Account" upgrade banner

**Features Disabled:**
- ❌ No uploads
- ❌ No comments
- ❌ No personal library
- ❌ No band features
- ❌ No settings
- ❌ No navigation tabs
- ❌ No search
- ❌ No notifications

**Visual Design:**
- Single-page player view
- Large album art (if available)
- Simple controls
- Prominent "Create Account" CTA
- Minimalist, focused on listening

---

## Implementation Priority

### Phase 1: Mobile Web (Guest Access) - CRITICAL
**Why:** SMS recipients need this to access shared playlists

**Tasks:**
1. Create GuestRouter with `/listen/:shareToken` route
2. Build GuestAccessPage (access code entry)
3. Build GuestPlaylistView (minimal playlist player)
4. Add platform detection logic
5. Test SMS code flow end-to-end

**Estimate:** 1 week

---

### Phase 2: Desktop Web (Power Tools) - HIGH
**Why:** Account holders need this for batch uploads and management

**Tasks:**
1. Create DesktopAppRouter
2. Build BatchUploadView (drag-and-drop folders)
3. Build TableView (sortable, filterable track list)
4. Add keyboard shortcuts
5. Multi-select operations

**Estimate:** 3-4 weeks

---

### Phase 3: Native Mobile (Polish) - MEDIUM
**Why:** Already functional, needs feature additions

**Tasks:**
1. Voice memo recording
2. Push notifications
3. Offline caching
4. "Shared with Me" tab

**Estimate:** 2-3 weeks

---

## Deployment Strategy

### Development
```bash
# Build for web (desktop + mobile web)
npm run build:web

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

### Production

**Web:**
```bash
# Deploy to Netlify (serves both desktop and mobile web)
netlify deploy --prod

# Routing:
# app.coretet.com/* → Desktop UI
# listen.coretet.com/* → Mobile web UI (guest)
```

**Mobile:**
```bash
# iOS
npx cap sync ios
# Then build in Xcode → TestFlight/App Store

# Android
npx cap sync android
# Then build in Android Studio → Google Play
```

---

## Summary

**3-Platform Strategy:**

1. **Desktop Web** - Account holders, power tools, web browser
2. **Native Mobile** - Account holders, full features, iOS/Android app
3. **Mobile Web** - SMS recipients, lightweight access, no download

**Recommended:** Single Ionic codebase with conditional rendering

**Critical Path:** Build mobile web (guest access) first for SMS sharing

**Next Steps:**
1. Implement platform detection
2. Create GuestRouter and guest screens
3. Test SMS → mobile web flow
4. Build desktop web UI (can be parallel with mobile web)
5. Polish native mobile app features

---

**Ready to start Phase 1 (Mobile Web for Guest Access)?**
