# CoreTet Evolution: From Tool to Platform

## Executive Summary

CoreTet is transitioning from a functional collaboration tool to an indispensable platform for bands. This document outlines a phased approach to implement UI/UX improvements and growth mechanisms while preserving the app's core value: private, safe collaboration for musicians.

## Core Philosophy

```
We believe:
- Music collaboration is sacred, not social
- Unfinished work deserves respect, not judgment  
- Bands need privacy to be vulnerable
- Feedback should be thoughtful, not instant
- Progress isn't measured in uploads or plays
- The journey matters more than the destination
- Technology should amplify creativity, not replace it
```

## Implementation Phases

### Phase 1: Foundation Fixes (Weeks 1-2)

#### 1.1 Onboarding Flow Enhancement

**Current Issue:** Users only enter name after email confirmation, no context about app value.

**Implementation Prompt for Claude:**
```
Analyze the current onboarding flow in OnboardingScreen.tsx. 
Before making changes:
1. Map all components that depend on the onboarding completion state
2. Identify how profile creation is triggered
3. Check for any analytics or tracking tied to onboarding

Then implement a 3-screen onboarding sequence AFTER name entry:
- Screen 1: "Your private space for band collaboration" with band icon
- Screen 2: "Share demos, get timestamped feedback" with waveform visual
- Screen 3: "Your music stays private until you're ready" with lock icon

Ensure the user can skip and that completing onboarding is tracked in localStorage.
Test that existing users don't see this again.
```

#### 1.2 Context Clarity

**Current Issue:** Users confused about personal vs band context when uploading.

**Implementation Prompt for Claude:**
```
Review MainDashboard.tsx and BandContext.tsx to understand current context switching.
Before changes:
1. Document how currentBand state is managed
2. Find all places that read band context
3. Identify the upload flow's context detection

Implement these improvements:
1. Add persistent band indicator in header (show band initials or "Personal")
2. In AudioUploader component, add text: "Uploading to: [Band Name or Personal]"
3. Use different icons/colors for personal (user avatar) vs band tracks (band initials)
4. Ensure context is visually clear BEFORE upload starts

Do not break existing band switching functionality.
```

#### 1.3 Empty States

**Current Issue:** Blank screens don't guide users to action.

**Implementation Prompt for Claude:**
```
Audit all tabs in MainDashboard for empty state handling.
Current tabs: Tracks, Playlists, Bands, Settings

For each empty state, implement:
- Tracks: "Upload your first demo" with upload button
- Playlists: "Create your first playlist" with create button  
- Bands: "Start a band" OR "You have an invite" (check for pending invites)

Use existing button components and styles. Don't create new design patterns.
Test with both new users and users with data.
```

#### 1.4 Loading States

**Current Issue:** 301 console.logs indicate missing user feedback during async operations.

**Implementation Prompt for Claude:**
```
Search codebase for all console.log statements.
Group them by:
1. Debug logs (can be removed)
2. Error logs (should become user-facing error messages)
3. State change logs (should become loading indicators)

Implement loading states for:
- Track list loading (skeleton screens)
- Audio upload progress (percentage indicator)
- Track details loading
- Band member list loading

Use Ionic's IonLoading or IonProgressBar components.
Preserve error boundaries and error handling.
```

### Phase 2: The 2-Minute Magic (Weeks 3-4)

#### 2.1 Phone Recording Feature

**Implementation Prompt for Claude:**
```
Research Capacitor's audio recording capabilities for iOS.
Check if @capacitor/camera includes audio or if we need a plugin.

Implement in-app recording:
1. Add record button to Tracks tab (when in band context)
2. Use MediaRecorder API or Capacitor plugin
3. Show live waveform visualization during recording
4. Auto-stop at 10 minutes
5. Allow immediate upload to current band
6. Save recording even if app backgrounds

Ensure recordings are compressed appropriately for upload limits.
Test on actual iOS device, not just simulator.
```

#### 2.2 AI Audio Analysis

**Implementation Prompt for Claude:**
```
Research audio analysis APIs that work with React/TypeScript:
- Essentia.js (client-side)
- Sonic API (server-side)
- Web Audio API (basic analysis)

Implement basic analysis showing:
- Key signature
- Tempo (BPM)
- Basic structure detection (verse/chorus markers)

This should appear immediately after upload completes.
Store analysis results in track metadata.
Show results in TrackDetailModal component.

Start with placeholder UI if API integration takes time.
```

#### 2.3 Version Control UI

**Implementation Prompt for Claude:**
```
Analyze current track storage in Supabase schema.
Understand relationship between tracks and their metadata.

Design new version control system:
1. Add 'parent_track_id' field to tracks table (migration needed)
2. Add 'version_number' and 'version_notes' fields
3. Create visual timeline component showing version evolution
4. Preserve all comments/ratings per version

Each version should be independently playable.
Don't break existing tracks - make versioning optional.
```

### Phase 3: Lock-in Value (Month 2)

#### 3.1 Full Version Control System

**Implementation Prompt for Claude:**
```
Extend version control from Phase 2:
1. Add "Create New Version" button in TrackDetailModal
2. Implement version comparison view (A/B playback)
3. Show what changed between versions in UI
4. Allow "branching" - multiple versions from same parent

Ensure all historical data is preserved.
Test with tracks that already have comments/ratings.
```

#### 3.2 Archive Mode

**Implementation Prompt for Claude:**
```
Create "Archive" functionality for completed projects:
1. Add "Mark as Complete" option in track menu
2. Archived tracks become read-only
3. Create separate "Archives" view in band context
4. Generate shareable "portfolio" link for archived projects
5. Include full version history in archive

Archived tracks should not appear in main track list.
Ensure archived tracks can be un-archived by band owner/admin.
```

#### 3.3 AI Pattern Matching

**Implementation Prompt for Claude:**
```
Building on Phase 2 AI analysis:
1. Store analysis results for all tracks
2. Implement similarity detection between tracks
3. Surface suggestions: "This riff matches your track from [date]"
4. Show compatible key/tempo matches across band's catalog

Keep suggestions subtle - notifications, not pop-ups.
Allow users to dismiss/disable suggestions.
```

### Phase 4: Distribution (Month 3)

#### 4.1 DAW Plugin

**Implementation Prompt for Claude:**
```
Research most popular DAW among existing users (check analytics or survey).
Start with one DAW (likely Logic or Ableton).

Create simple plugin that:
1. Exports audio with metadata
2. Authenticates with CoreTet API
3. Uploads directly to user's current band
4. Returns success/failure to DAW

This may require separate repository/build process.
Document installation process clearly.
```

#### 4.2 Pro Tier Implementation

**Implementation Prompt for Claude:**
```
Implement subscription tiers in Supabase:

Free Tier:
- 5 tracks per month
- Basic AI analysis
- 3 band members

Pro Tier ($10/month per band):
- Unlimited tracks
- Full AI analysis
- Unlimited members
- Patron access
- DAW plugins

Use Stripe for payments (already integrated?).
Implement usage tracking and limits.
Show upgrade prompts gently, not aggressively.
```

#### 4.3 Patron System

**Implementation Prompt for Claude:**
```
Create patron functionality:
1. Band can enable "Patrons" in settings
2. Set monthly patron price ($5-50)
3. Patrons see only finished tracks (marked by band)
4. Patrons cannot see comments or work-in-progress
5. CoreTet takes 10% (waived for Pro bands)

This requires new user role type: "patron"
Carefully implement access controls.
Test thoroughly to ensure patrons can't see private content.
```

## Critical Implementation Guidelines

### Never Implement

```
❌ Public feeds or discovery
❌ Play counts or view counts
❌ Follower counts or social metrics
❌ Trending sections
❌ Engagement time tracking
❌ AI-generated music
❌ Automated feedback
❌ Social sharing to public platforms
❌ Gamification or streaks
❌ Infinite scroll
```

### Always Preserve

```
✅ Private band spaces
✅ Existing user data
✅ Current authentication flow (until ready to migrate)
✅ File upload limits
✅ RLS policies
✅ Backward compatibility
```

## Testing Strategy

**Before Each Change:**
```
1. Document current behavior
2. Identify all dependencies
3. Create rollback plan
4. Test on development environment
```

**After Each Change:**
```
1. Test core flows still work:
   - Sign up → Create band → Upload track → Add comment
   - Accept invite → View band tracks → Leave feedback
2. Check for console errors
3. Verify no performance degradation
4. Test on actual iOS device
```

## Success Metrics

### Measure These
- Bands uploading weekly (healthy collaboration)
- Tracks evolving through versions (creative progress)
- Bands lasting 6+ months (relationship health)
- Time from sign-up to first upload (activation)
- Multi-band users (product-market fit)

### Don't Measure These
- Daily active users
- Session duration
- Number of comments per track
- Upload frequency pressure
- Any vanity metrics

## Migration Considerations

### Authentication Evolution
Research SMS/phone authentication as potential future replacement for email.
Don't migrate until thoroughly tested.

### Database Changes
All schema changes need migrations.
Never delete columns, only add or mark deprecated.
Always provide default values for new required fields.

### File Storage
Current structure: `user-{userId}/{trackId}.{ext}`
Maintain this for backward compatibility.
New version control files can use: `user-{userId}/{trackId}/v{version}.{ext}`

## Support Documentation

Create user-facing documentation for:
1. Version control (how it works)
2. Archive mode (what it means)
3. Patron system (for bands and supporters)
4. AI analysis (what the data means)

## Final Implementation Note

Each phase builds on the previous. Don't skip ahead. 
Test thoroughly between phases.
Get user feedback before proceeding to next phase.

Remember: CoreTet's value is being the anti-social network.
Every feature should reinforce private, meaningful collaboration.

When in doubt, choose privacy over virality, depth over breadth, and bands over metrics.