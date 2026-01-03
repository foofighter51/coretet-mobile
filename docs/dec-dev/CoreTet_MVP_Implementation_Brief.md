# CoreTet MVP Implementation Brief

> **⚠️ IMPORTANT: COLLABORATION REQUIRED**
> 
> Before making ANY code changes, database modifications, or architectural decisions:
> 1. Review this entire document
> 2. Analyze the existing codebase for conflicts or dependencies
> 3. Provide a summary of recommended approach and any concerns
> 4. **WAIT for my approval before implementing**
> 
> Do NOT proceed with implementation until we have discussed and agreed on the approach.

---

## Project Context

CoreTet is a band collaboration app for sharing and reviewing demo tracks. This document outlines the MVP feature set for the collaboration functionality.

**Target User:** Co-equal band members collaborating on original music.

**Core Value Proposition:** "Everyone on the same page." Same version. Same notes. Same focus. Without turning it into a job.

---

## MVP Features Overview

| Feature | Purpose | Complexity Estimate |
|---------|---------|---------------------|
| Listened Indicator | Soft accountability | Low |
| Hero System (Versions) | Version clarity | Medium |
| Comments on Track | Contextual feedback | Low-Medium |
| Keywords | Freeform categorization | Low |
| Set Lists | Ordered sequences with version selection | Medium-High |

---

## Feature 1: Listened Indicator

### User Story
As an admin, I want to see which band members have listened to a track so I know if everyone has heard the latest demo before rehearsal.

### Requirements
- Track is marked "Listened" when playhead crosses **80% of track duration**
- Display list of member names who have listened on each track
- Threshold is silent (user does not see progress toward "Listened")

### Technical Notes
- Fire "listened" event when playhead crosses 80% timestamp
- Database: `user_id`, `track_id`, `listened_at`
- Simple implementation: single event fire, no cumulative tracking

### NOT in Scope
- Cumulative coverage tracking across sessions
- Retention/engagement graphs
- "Last listened" timestamps

---

## Feature 2: Hero System (Version Management)

### User Story
As an admin, I want to designate one version of a track as the "Hero" so the band knows which version is current, while still allowing access to previous versions.

### Requirements
- One track can have multiple versions
- Only ONE version is the "Hero" (featured/default)
- Other versions are collapsed behind Hero but remain accessible
- Any band member can play any version
- Admin can promote any version to Hero with one tap
- New version upload prompts "Make this the Hero?"

### Data Model Considerations
```
Track
├── id
├── name
├── hero_version_id (FK to Version)
└── ...

Version
├── id
├── track_id (FK to Track)
├── file_url
├── uploaded_at
├── is_hero (boolean, or derive from Track.hero_version_id)
└── ...
```

### UI Notes
- Hero version displays prominently with badge
- Version drawer/accordion for accessing other versions
- Clear visual hierarchy: Hero is default, others are secondary

### NOT in Scope
- Side-by-side A/B comparison player
- Automated diff detection
- Change notes / version descriptions

---

## Feature 3: Comments on Track

### User Story
As a band member, I want to leave comments on a track so feedback stays with the music instead of getting lost in WhatsApp.

### Requirements
- Comment thread attached to each track
- Visible to all band members
- Chronological display (newest at bottom)
- Attribution: member name + timestamp on each comment
- Both admin and members can comment

### Data Model Considerations
```
Comment
├── id
├── track_id (FK to Track)
├── user_id (FK to User)
├── content (text)
├── created_at
└── ...
```

### NOT in Scope
- Pinned comments
- Timestamped comments on waveform
- Threaded replies
- Voice memo comments
- @mentions with notifications

---

## Feature 4: Keywords

### User Story
As an admin, I want to add keywords to tracks so I can filter and find tracks easily as the library grows.

### Requirements
- Freeform keyword creation (admin types keyword, created on first use)
- Multiple keywords per track
- Filter view: tap keyword to see all matching tracks
- Admin-only keyword assignment
- Visual: keywords displayed as pills/badges on track cards

### Data Model Considerations
```
Keyword
├── id
├── band_id (FK to Band)
├── name (string, unique per band)
└── ...

TrackKeyword (join table)
├── track_id
├── keyword_id
└── ...
```

### Onboarding Suggestions
Provide example keywords during onboarding or first-use:
- Upbeat, Ballad, Instrumental
- Needs vocals, Needs mixing
- Cover, Original
- Jam-friendly, Short, Encore

### NOT in Scope
- Keyword colors/icons
- Smart collections (auto-tagging)
- Keyword suggestions based on audio analysis

---

## Feature 5: Set Lists

### User Story
As an admin, I want to create ordered set lists for performances, selecting specific versions of each track for that set.

### Requirements
- Dedicated "Set Lists" section in navigation
- Admin creates named set lists ("Friday Night Set," "Acoustic Set")
- Add tracks to set list with version selection
- Ordering via drag/drop or numbered reordering
- Version dropdown shows all versions, Hero pre-selected as default
- Display: track name + version label in sequence
- Same track can appear in multiple set lists with different versions

### Data Model Considerations
```
SetList
├── id
├── band_id (FK to Band)
├── name (string)
├── created_at
└── ...

SetListEntry
├── id
├── set_list_id (FK to SetList)
├── version_id (FK to Version) ← Note: links to Version, not Track
├── position (integer for ordering)
└── ...
```

### Key Implementation Detail
Set list entries reference **Versions**, not Tracks. This allows:
- "Acoustic Set" → Midnight Run (Acoustic version)
- "Rock Set" → Midnight Run (Full band version)

### NOT in Scope
- Member set list suggestions/proposals
- Set list sharing outside the band
- Duration calculator
- Print/export to PDF
- Continuous playback mode

---

## Permission Model

| Action | Admin | Members |
|--------|:-----:|:-------:|
| Upload tracks | ✅ | ❌ |
| Set "Hero" version | ✅ | ❌ |
| Create/manage keywords | ✅ | ❌ |
| Create/edit set lists | ✅ | ❌ |
| View set lists | ✅ | ✅ |
| Comment on tracks | ✅ | ✅ |
| Listen/Like/Love | ✅ | ✅ |
| Play any version | ✅ | ✅ |

**Principle:** Admin curates, members collaborate.

---

## Design Principles

1. **Simple > Comprehensive** — Ship reliable basics first
2. **Band, not job** — Soft accountability, not task management
3. **One source of truth** — Hero version, keywords, comments on track
4. **Admin as curator** — Clear ownership without heavy control

---

## Implementation Guidance

### Suggested Order of Implementation
1. **Hero System** — Foundation for version management (other features depend on this)
2. **Comments** — Simple, high value, low risk
3. **Listened Indicator** — Requires audio player integration
4. **Keywords** — Independent feature, can be parallelized
5. **Set Lists** — Most complex, depends on Hero System

### Questions to Address Before Starting
1. What is the current data model for tracks/audio files?
2. Is there existing version management or is this new?
3. What audio player component is being used?
4. How are permissions currently handled (admin vs member)?
5. What's the current state of the Band/User relationship model?

---

## Pre-Implementation Checklist

Before writing any code, please provide:

- [ ] Analysis of current codebase structure relevant to these features
- [ ] Identification of any conflicts with existing functionality
- [ ] Proposed data model changes (migrations needed)
- [ ] Recommended tech approach for each feature
- [ ] Any concerns or suggested modifications to this spec
- [ ] Estimated complexity/effort for each feature

---

## Reminder

> **DO NOT implement until we have reviewed your analysis together.**
> 
> Please respond with your findings and recommendations first. I want to collaborate on the approach before any code is written.

---

*Spec Version: 1.0*
*Last Updated: December 2024*
