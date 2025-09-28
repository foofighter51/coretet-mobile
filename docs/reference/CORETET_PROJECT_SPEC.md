# CoreTet - Songwriter Organization App MVP Specification

## Project Overview

CoreTet is a music organization and collaboration platform designed specifically for songwriters to manage multiple versions of their work and collaborate with band members, producers, and co-writers. Think of it as "every band's own private streaming service" combined with professional version management.

## Core Concept

**NOT a DAW, sampler, or recording tool** - CoreTet is purely for organization, playback, and collaboration of existing audio files. The app recognizes that songwriters naturally create multiple versions of songs (voice memos, demos, rehearsals, finals) and need a clean way to organize and share them.

## Technical Stack

- **Frontend**: React/Next.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Custom phone auth via Twilio
- **File Storage**: Backblaze B2 (via S3-compatible API)
- **Audio Playback**: Howler.js
- **Styling**: Tailwind CSS
- **Mobile**: PWA initially, native iOS/Android later

## MVP Features

### 1. Version Management System

**Core Concept**: Songs are containers, versions are individual audio files. Versions can belong to a song OR exist independently.

**Implementation**:
- Audio files can be uploaded standalone or grouped under a "Song"
- Each version has a type: Voice Memo, Rough Demo, Rehearsal, Working Mix, Final, Live, Other
- Versions maintain independence - can appear in multiple contexts
- Example: "Song A v3" can simultaneously be in "January Rehearsal Playlist" and "Song A versions"

**Database Structure**:
```sql
songs (container)
  - id, title, created_by, created_at

versions (individual files)
  - id, song_id (nullable), file_url, version_type
  - title, uploaded_by, recording_date
```

### 2. Playlist System

**Features**:
- Create/edit/delete playlists
- Drag-and-drop track ordering
- Share via link, phone number, or email
- Set permission levels (listen/rate/comment)

**Key Design Decision**: Playlists are the primary sharing unit, not individual tracks

### 3. Three-Tier Rating System

**Rating Levels**:
1. **Listened** (headphones icon) - "I've heard this"
2. **Liked** (thumbs up) - "This is good"
3. **Loved** (heart) - "This is exceptional"

**Implementation**:
- Users see their own rating prominently
- Aggregate ratings shown secondarily (behind button)
- Display as simple count bars, not usernames

### 4. Simple Commenting System

**Features**:
- Timestamp-based comments (auto-captured at playhead position)
- Linear display (no threading or replies)
- Reverse chronological order
- Comments tied to playlist context

**NOT included**: Discussion threads, replies, reactions

### 5. Mobile-First Player

**Essential Controls**:
- Large album art (60% of screen)
- Play/pause with large touch target
- -10/+10 second skip buttons
- Progress bar with time markers
- Swipe gestures (left/right for tracks)

**Secondary Controls**:
- Three-tier rating buttons
- Comments button (opens modal)
- "See all ratings" button
- Share button

### 6. Phone Number Authentication

**Flow for Collaborators**:
1. Share playlist via SMS
2. Recipient receives 6-digit code
3. Enter code to access playlist
4. 30-day session persistence

**Benefits**:
- No account required for collaborators
- Familiar SMS verification pattern
- Secure but simple

## NOT in MVP (Future Phases)

### Phase 2
- In-app voice recording
- Smart collections/auto-tagging
- Advanced metadata
- Collaborative ratings visualization
- Ensemble/band management

### Phase 3
- AI-powered auto-tagging
- Arrangement tools (micro-timestamping)
- Waveform visualizations
- Advanced search/filters

## User Flows

### Primary User (Songwriter)
1. Upload audio files
2. Optionally group into songs
3. Create playlists
4. Share with collaborators
5. Review feedback

### Collaborator
1. Receive share link/SMS
2. Enter phone number
3. Verify with 6-digit code
4. Listen and rate tracks
5. Add timestamped comments

## Design Principles

1. **Clean Over Complex**: No redundant information, no unnecessary descriptions
2. **Music First**: Large touch targets, visual album art, minimal chrome
3. **Progressive Disclosure**: Advanced features hidden until needed
4. **Familiar Patterns**: Spotify-like player, SMS verification
5. **Flexible Organization**: No rigid hierarchies, files can exist in multiple contexts

## File Naming Convention

While not enforced, we encourage:
```
ProjectName_STAGE_BPM_KeySig_v#_MIXTYPE
Example: MySong_DEMO_120_Am_v3_rough
```

## Security & Permissions

### Three Permission Levels
1. **Listen Only**: Can play tracks, view playlist
2. **Rate & Listen**: Can add 3-tier ratings
3. **Full Collaboration**: Can rate and comment

### Share Types
- **Link**: Anyone with link can access
- **Phone**: Specific phone numbers only
- **Email**: Specific email addresses only

## Performance Requirements

- Audio should start playing within 2 seconds
- Page loads under 3 seconds on 4G
- Support 1000+ tracks per user
- Handle playlists with 500+ tracks
- Work offline for cached content (PWA)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Safari iOS 14+
- Firefox (latest 2 versions)
- Mobile browsers priority over desktop

## Accessibility

- Minimum 44px touch targets on mobile
- High contrast player controls
- Keyboard navigation for web
- Screen reader support for core functions

## Data Models

See `DATABASE_SCHEMA.md` for complete schema

## API Endpoints

See `API_SPECIFICATION.md` for complete API documentation

## Component Structure

See `COMPONENT_ARCHITECTURE.md` for React component hierarchy

## Deployment

- Frontend: Netlify
- Backend: Supabase Cloud
- Storage: Backblaze B2
- SMS: Twilio

## Success Metrics

- Time to upload and share < 2 minutes
- Collaborator access without account < 1 minute  
- 95% of playback starts within 2 seconds
- Zero data loss on version management