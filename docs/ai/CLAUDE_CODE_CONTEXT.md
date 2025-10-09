# Claude Code - CoreTet Band Collaboration App Context

**Last Updated**: 2025-10-08
**Version**: 1.0
**Purpose**: Stable project context for Claude Code sessions (updated every few weeks)

---

## 📖 How to Use This Documentation

### Two-File System

This project uses a **two-file approach** for session context:

**1. This File (`CLAUDE_CODE_CONTEXT.md`)** - **Stable Foundation**
- Core project context that rarely changes
- Tech stack, architecture, development standards
- Common patterns and gotchas
- **Update frequency**: Every few weeks or after major milestones
- **Think of it as**: The "project bible" - stable reference material

**2. EOD Status Files (`docs/eod-status/YYYY-MM-DD-eod.md`)** - **Session Details**
- What happened in each specific session
- Bugs found/fixed, commits made, code changes
- Session-specific learnings and discoveries
- **Update frequency**: Every session (auto-generated or manual)
- **Think of it as**: Daily journal - chronological record

### Session Startup Process

**For every new Claude Code session:**

1. **Read this file** (`CLAUDE_CODE_CONTEXT.md`) → Get project context, standards, workflow
2. **Read latest EOD** (`docs/eod-status/YYYY-MM-DD-eod.md`) → Get recent changes, pending tasks
3. **Ready to work** → Full context loaded, no need to read 10+ files

### When to Update Each File

**Update `CLAUDE_CODE_CONTEXT.md` (this file) when:**
- ✅ Major feature completed (e.g., "Authentication system added")
- ✅ Development workflow/standards changed
- ✅ New critical patterns or gotchas discovered
- ✅ Project priorities shift significantly
- ✅ Tech stack changes
- ❌ NOT after every session - only when foundational things change

**Update EOD files when:**
- ✅ Every session ends
- ✅ Documenting daily progress, bugs, fixes
- ✅ Recording commits and code changes
- ✅ Capturing session-specific learnings

**Result**: EOD files stay lightweight and focused, this file provides stable foundation.

---

## 🎯 Project Overview

### What is CoreTet?
A mobile-first music collaboration app for bands to share, rate, and organize tracks.

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Mobile**: Ionic Framework + Capacitor (iOS-focused)
- **Backend**: Supabase (PostgreSQL + Storage + RLS)
- **Auth**: Clerk (JWT-based)
- **Deployment**: Netlify (web), TestFlight (iOS)

### Current State
- **Phase**: Active development, MVP in testing
- **Latest Build**: iOS TestFlight (2025-10-08)
- **Main Features**: Track upload, playlists, ratings, sharing via deep links
- **Status**: Feature-complete MVP, iterating based on user feedback

---

## 🤝 Development Workflow & Standards

### Session Workflow (CRITICAL)
**Follow this process for ALL code changes:**

1. **Discuss First** - Analyze and discuss approach before any implementation
2. **Plan** - Break down tasks, identify edge cases, consider UX
3. **Implement** - Write clean, tested code following standards below
4. **Self-Verify** - Run build, check for errors, review changes
5. **Present for Review** - Show user what was done, explain changes
6. **User Tests & Approves** - User verifies in simulator/device
7. **Commit Only After Approval** - **NEVER commit without explicit user confirmation**

### Code Quality Standards

#### Debug Logging Strategy
```typescript
// ✅ CORRECT - Production code
console.error('Failed to load playlist:', error); // Keep errors only

// ❌ WRONG - Debug logs (remove before commit)
console.log('🗑️ Deleting tracks:', selectedTrackIds);
console.log('Attempting to delete track...');
```

**Rule**: Remove ALL `console.log` debug statements. Keep ONLY `console.error` for actual errors.

#### Error Handling
```typescript
// ✅ CORRECT - Consistent error handling
try {
  const result = await someOperation();
  if (result.error) {
    console.error('Operation failed:', result.error);
    setError('User-friendly error message');
    return;
  }
} catch (err) {
  console.error('Unexpected error:', err);
  setError('Something went wrong');
}
```

#### Performance Patterns
```typescript
// ✅ CORRECT - Parallel operations
const results = await Promise.all(
  items.map(item => db.items.delete(item.id))
);

// ❌ WRONG - Sequential operations
for (const item of items) {
  await db.items.delete(item.id); // Slow!
}
```

#### State Management
```typescript
// ✅ CORRECT - Reset all related state together
const handleBackToList = () => {
  setViewMode('list');
  setCurrentPlaylist(null);
  setPlaylistTracks([]);
  setIsEditingTracks(false);     // Don't forget edit mode!
  setSelectedTrackIds([]);       // Reset selections
};
```

### Testing Strategy
- **Build verification**: Run `npm run build` after every change
- **Manual testing**: User tests in iOS simulator before commit
- **No broken commits**: If feature doesn't work, don't ship it
- **Iterate**: Fix → Test → Approve → Commit cycle

---

## 📂 Key Project Files & Patterns

### Critical Files
```
src/
├── components/
│   ├── screens/
│   │   └── MainDashboard.tsx          # Main app UI (1400+ lines)
│   └── molecules/
│       ├── PlaybackBar.tsx            # Audio player UI
│       ├── SwipeableTrackRow.tsx      # Mobile track list item
│       └── AudioUploader.tsx          # Track upload component
├── contexts/
│   └── PlaylistContext.tsx            # Playlist state management
└── utils/
    └── deepLinkHandler.ts             # coretet:// URL handling

lib/
└── supabase.ts                        # Database client & queries

ios/App/                               # Capacitor iOS project
```

### Common Patterns

#### Database Operations
```typescript
// Pattern: Always check for errors
const { data, error } = await db.playlists.getById(playlistId);
if (error) {
  console.error('Database error:', error);
  setError('Failed to load playlist');
  return;
}
```

#### State Updates with Refresh
```typescript
// Pattern: Update DB → Reload data
await db.playlistItems.removeByTrack(playlistId, trackId);
await loadPlaylistTracks(playlistId); // Refresh view
```

#### Owner-Only Features
```typescript
// Pattern: Check ownership before showing controls
const isPlaylistOwner = createdPlaylists.some(p => p.id === currentPlaylist.id);

{isPlaylistOwner && (
  <button onClick={handleEdit}>Edit</button>
)}
```

---

## 🚀 Current Features & Priorities

### ✅ Completed (October 2025)
1. **Track Management**
   - Upload audio files (m4a, wav, mp3, etc.)
   - Organize into playlists
   - Rate tracks (listened/liked/loved)
   - Sort & filter by ratings

2. **Playlist Sharing**
   - Deep links: `coretet://playlist/{id}`
   - Share via iOS Share sheet
   - View shared playlists (read-only for non-owners)

3. **UX Improvements**
   - Auto-play next track
   - iOS keyboard viewport fixes
   - Fixed TabBar/PlaybackBar positioning
   - Playlist filter toggle (My Playlists / Following)

4. **Edit Tracks Feature** ⭐ NEW (2025-10-08)
   - Owner-only multi-select track removal
   - Checkbox selection UI
   - Parallel deletion with Promise.all
   - Success confirmation: "N tracks removed"

### 🎯 Active Priorities
1. **Code Quality** - Clean debug logs, optimize performance
2. **UX Refinement** - Based on tester feedback
3. **Documentation** - Keep context files updated

### 📋 Backlog (Low Priority)
- Track comments system
- Aggregated ratings display
- Recycle bin for deleted tracks
- Push notifications

---

## 🐛 Known Issues & Gotchas

### React Event Listener State Capture
**Problem**: Event listeners capture state values at creation time.

```typescript
// ❌ WRONG - currentTrack will be stale
audioRef.current.addEventListener('ended', () => {
  playNextTrack(currentTrack); // Captured at listener creation!
});

// ✅ CORRECT - Use ref for mutable values
const currentTrackRef = useRef<Track | null>(null);
currentTrackRef.current = currentTrack; // Update ref when state changes

audioRef.current.addEventListener('ended', () => {
  playNextTrack(currentTrackRef.current); // Always current!
});
```

### iOS Viewport Management
- `viewport-fit=cover` causes keyboard viewport bugs
- Trade-off: Edge-to-edge content OR reliable keyboard behavior
- Current choice: Reliability > aesthetics (black bars acceptable)

### Supabase RLS & Permissions
- All tables use Row-Level Security (RLS) with Clerk JWT
- Database writes require proper user_id from auth token
- Public playlist viewing requires special RLS policy

---

## 🔧 Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Sync to iOS
npx cap sync

# Open in Xcode
npx cap open ios
```

### Git Workflow
```bash
# Check status
git status

# View recent commits
git log --oneline -5

# Current branch
git branch --show-current
```

### Database
```bash
# Connect to Supabase DB
psql postgresql://postgres.tvvztlizyciaafqkigwe:$SUPABASE_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Common queries
SELECT * FROM profiles WHERE id = 'user-id';
SELECT * FROM playlists WHERE created_by = 'user-id';
```

---

## 📊 Latest Session Summary (2025-10-08)

### What Happened Today
1. **Morning Session**: Implemented 3 Priority 1 features
   - ✅ Removed chevron icon visual bug
   - ✅ Fixed playlist deletion not refreshing
   - ✅ Added Edit Tracks mode with checkbox selection

2. **Iteration**: Redesigned track removal UX
   - Initial approach: Swipe with trash icon (too close to ratings)
   - Final approach: Three-dot menu → Edit Tracks → checkboxes
   - Result: Clear separation between rating and removal actions

3. **Bug Fix**: `loadPlaylistTracks` was undefined
   - Symptom: Tracks deleted but view didn't refresh
   - Root cause: Function called but never defined
   - Fix: Extracted function, reused across all playlist reload points

4. **Cleanup Session**: Code quality improvements
   - Removed ~11 debug console.log statements
   - Optimized deletion from sequential to parallel (Promise.all)
   - Added success confirmation with auto-dismiss
   - Cleaned up temp screenshots
   - Added JSDoc for Edit Tracks feature

### Key Technical Learnings
- **Don't ship broken features**: Test before commit
- **Extract reusable functions**: Avoid duplicate code patterns
- **Performance matters**: Parallel > Sequential for bulk operations
- **UX iteration is normal**: First implementation may not be the best

### Pending for Next Session
- Monitor TestFlight feedback
- Address any tester-reported bugs
- Continue App Store preparation (screenshots, description)

---

## 📁 Reference Documentation

### Essential Docs (in priority order)
1. **This file** - `docs/ai/CLAUDE_CODE_CONTEXT.md` ← You are here
2. **Latest EOD** - `docs/eod-status/2025-10-08-eod.md` - Session details
3. **Orchestra System** - `docs/ai/READY_TO_WORK.md` - Python-based AI agents
4. **Feature Assessment** - `docs/FEATURE_PRIORITY_ASSESSMENT.md` - Backlog

### When to Use Other Docs
- **Security fixes needed**: `docs/ai/orchestra/SECURITY_FIXES_PLAYBOOK.md`
- **Architecture questions**: `docs/ai/orchestra/ARCHITECTURE.md`
- **Comprehensive review**: `docs/COMPREHENSIVE_REVIEW_2025-09-29.md` (outdated)

---

## 🎯 Session Startup Checklist

**At the start of each Claude Code session:**

1. ✅ Read this file (`docs/ai/CLAUDE_CODE_CONTEXT.md`) - Get stable project context
2. ✅ Find and read latest EOD status (`ls -t docs/eod-status/*.md | head -1`) - Get recent changes
3. ✅ Understand current priorities (from EOD + "Active Priorities" section above)
4. ✅ Remember workflow: **Discuss → Plan → Implement → Review → Approve → Commit**
5. ✅ Never commit without explicit user approval

**Why this works:**
- This file gives you the foundation (rarely changes)
- Latest EOD gives you the current state (changes every session)
- Together = complete context without reading 10+ files

**Before making any changes:**
- Discuss the approach first
- Consider UX implications
- Check for edge cases
- Plan state management

**After making changes:**
- Run `npm run build` to verify
- Remove debug console.logs
- Present changes to user
- Wait for testing confirmation
- Only commit after approval

---

## 💡 Pro Tips for Claude Code

### Context Management
- Reference specific files with line numbers: `MainDashboard.tsx:532`
- Use `Grep` to find patterns, `Read` to examine code
- Always verify assumptions by reading files

### Code Quality
- Prefer editing existing files over creating new ones
- Keep functions focused and testable
- Document complex logic with comments
- Use TypeScript types consistently

### User Communication
- Be concise and direct
- Explain trade-offs when they exist
- Ask questions when requirements are unclear
- Don't commit until user explicitly confirms

### When Stuck
- Read the relevant code first
- Check for similar patterns in the codebase
- Verify build succeeds after changes
- Ask user for clarification if uncertain

---

## 🔄 Keeping This File Updated

**This file is relatively stable - don't update every session!**

**Update this file when:**
- ✅ Major features are completed (e.g., new core functionality)
- ✅ Development workflow/standards change (like today's session)
- ✅ New critical patterns or gotchas discovered
- ✅ Project priorities significantly shift
- ✅ Tech stack changes
- ❌ NOT for session-specific changes (use EOD files for that)

**Update process:**
1. User requests update OR you notice foundational changes
2. Read current version of this file
3. Propose specific sections to update
4. User approves
5. Update file with today's date in header
6. Commit with other session changes

**Update frequency**: Every few weeks or after major milestones, not every session.

---

## 📝 EOD Status Files

**For session-specific tracking, use EOD files instead:**

**Location**: `docs/eod-status/YYYY-MM-DD-eod.md`

**Create EOD file at end of each session with:**
- Session summary (date, duration, focus)
- Completed tasks with commit hashes
- In-progress and blocked items
- Bugs found and fixed
- Code changes and technical details
- Tomorrow's priorities
- Session-specific learnings

**Why separate files:**
- This file = stable foundation (project context)
- EOD files = chronological record (what happened when)
- Easier to maintain both
- Historical record preserved
- Less clutter in this file

---

**This file is the stable foundation. EOD files are the daily journal. Together = complete context.**

---

*Last reviewed: 2025-10-08*
*Next review: After next major feature, workflow change, or in a few weeks*
