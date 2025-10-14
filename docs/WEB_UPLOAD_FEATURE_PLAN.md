# Web Upload Feature Plan

## Overview

Add web-based bulk audio upload functionality that allows users to upload tracks directly to their bands/playlists from a desktop browser, solving the mobile app's clunky bulk upload UX.

## Current State Analysis

### ✅ Already Have:
1. **Web Authentication** - Email/password login on LandingPage
2. **AudioUploader Component** - Works with both web (drag-drop/file input) and native (file picker)
3. **Supabase Backend** - Storage, database, and RLS policies
4. **Band Context** - Band selection and switching logic
5. **Playlist Context** - Playlist management
6. **User Profiles** - All users have profiles in database

### 🔨 Need to Build:
1. **Web Upload Route** - `/upload` page accessible after login
2. **Band/Playlist Selection UI** - For web users to choose destination
3. **Bulk Upload UI** - Optimized for desktop (drag-drop, multiple file selection)
4. **Progress Tracking** - Better feedback for bulk uploads
5. **Web Navigation** - Simple nav to get to upload page

## Architecture Decision

**Recommendation: Full-Featured Web Version**

**Why?**
- AudioUploader already supports web (uses same code)
- BandContext/PlaylistContext already built
- Authentication already works
- Only need to wrap existing components in a web-friendly UI
- Minimal additional work vs "light" version

**What "light" would cost:**
- Still need auth, band selection, playlist selection
- Still need to integrate AudioUploader
- Would save ~2-3 components but lose polish
- Not worth the trade-off

## Implementation Plan

### Phase 1: Web Upload Page (Core Functionality)

**Goal:** Get basic bulk upload working on web

**Components to Create:**

1. **WebUploadPage.tsx** - Main upload interface
   - Band selector dropdown (uses BandContext)
   - Playlist selector dropdown (uses PlaylistContext)
   - "Create New Playlist" option
   - AudioUploader component (drag-drop zone)
   - Upload progress display
   - Success/error feedback

2. **Simple Web Nav** - Minimal navigation
   - "Upload" and "Logout" buttons
   - Band switcher (if user has multiple bands)

**Route:**
```typescript
<Route path="/upload" element={
  user ? (
    <BandProvider userId={user.id}>
      <PlaylistProvider>
        <WebUploadPage user={user} />
      </PlaylistProvider>
    </BandProvider>
  ) : <LandingPage />
} />
```

**User Flow:**
1. User visits coretet.app → sees LandingPage
2. User logs in with email/password
3. Redirected to `/upload`
4. Sees:
   - Band selector (if multiple bands, else auto-selected)
   - Playlist dropdown (with "Create New..." option)
   - Drag-drop upload zone
5. Drag files → Auto-upload to selected band/playlist
6. See progress → See results

### Phase 2: Enhanced Features (Optional Polish)

**If Phase 1 works well, add:**

1. **Playlist Browser**
   - View tracks in selected playlist
   - Play/preview uploaded tracks
   - Delete tracks

2. **Folder Structure Upload**
   - Preserve folder structure as playlist hierarchy
   - Auto-create playlists from folders

3. **Batch Metadata Editing**
   - Edit track titles in bulk
   - Apply tags to multiple tracks

## Technical Considerations

### Authentication
- **Current:** LandingPage shows email/password form, redirects to `/admin/feedback`
- **Change:** After login, check if native or web
  - Native → MainDashboard (existing)
  - Web → `/upload` (new)

### File Size Limits
- Web has no file size restrictions (unlike mobile)
- Can upload very large files
- Should add client-side validation (warn for >100MB files)

### Browser Compatibility
- Drag-drop: All modern browsers ✅
- File API: All modern browsers ✅
- Blob/File handling: All modern browsers ✅

### Performance
- AudioUploader already handles:
  - Progress tracking
  - Error handling
  - Parallel uploads (for multiple files)
- Should work well for bulk (10-50 files)

## UI Mockup (Phase 1)

```
┌─────────────────────────────────────────────────────┐
│  CoreTet                         Upload    Logout   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Band: [Bedeker ▼]                                 │
│                                                     │
│  Upload to:                                        │
│  ○ Existing Playlist: [Select... ▼]               │
│  ○ Create New Playlist: [________]                │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │         📁 Drag files here                  │  │
│  │                                             │  │
│  │         or click to browse                  │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Uploading: 5/10 files                             │
│  ████████░░░░░░░░░ 50%                             │
│                                                     │
│  ✓ track1.mp3                                      │
│  ✓ track2.mp3                                      │
│  ⏳ track3.mp3 (45%)                               │
│  ⏳ track4.mp3 (12%)                               │
│  ⏳ track5.mp3 (0%)                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Update Landing Page Redirect
```typescript
// After successful login, redirect based on platform
if (Capacitor.isNativePlatform()) {
  navigate('/'); // MainDashboard
} else {
  navigate('/upload'); // Web upload page
}
```

### Step 2: Create WebUploadPage Component
- Band selector (dropdown)
- Playlist selector (radio + dropdown/input)
- AudioUploader integration
- Upload progress display

### Step 3: Add Route
- Add `/upload` route in App.tsx
- Wrap in BandProvider + PlaylistProvider

### Step 4: Test Flow
1. Login on web
2. Select band (if multiple)
3. Select/create playlist
4. Upload multiple files
5. Verify in mobile app

## Database/Security

**No changes needed!**
- RLS policies already handle band access
- AudioUploader already passes `bandId` option
- Playlist creation already works via API

## Estimated Complexity

**Phase 1 (Basic Upload):**
- WebUploadPage component: 2-3 hours
- Landing page redirect logic: 30 min
- Route setup: 15 min
- Testing: 1 hour
- **Total: ~4 hours**

**Phase 2 (Polish):**
- Playlist browser: 2 hours
- Enhanced features: 3-4 hours
- **Total: ~5-6 hours**

## Recommendation

Start with **Phase 1** - it's low effort and solves the immediate pain point (bulk uploads). The AudioUploader component already does the heavy lifting. We're just adding:
1. A destination selector UI
2. A dedicated web page
3. A route and redirect logic

Ship Phase 1, get feedback, then decide if Phase 2 is worth it.

## Questions to Confirm

1. **Should web users see the full MainDashboard or just upload page?**
   - **Simpler:** Upload page only (my recommendation)
   - **Full-featured:** Full MainDashboard on web

2. **Should we support creating playlists on the fly during upload?**
   - **Yes** (my recommendation) - adds flexibility
   - **No** - must select existing playlist

3. **File count limit for bulk upload?**
   - No limit?
   - 50 files max?
   - 100 files max?

Let me know your preferences and I'll build Phase 1!
