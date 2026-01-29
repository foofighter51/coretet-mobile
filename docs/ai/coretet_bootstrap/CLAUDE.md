# CoreTet Project Instructions

> This file is automatically read by Claude Code at the start of every session.
> It provides persistent context about the project, conventions, and current priorities.

## 🎸 Project Identity

**CoreTet** — "Your Band's Musical Brain"

A private music collaboration platform for bands and songwriters. Think Frame.io for audio tracks.

### Philosophy (ALWAYS REMEMBER)
- **Anti-social network**: Private, meaningful collaboration over public metrics
- **Musicians first**: Many users are non-technical ("So Easy a Drummer Can Do It")
- **Organize the chaos**: Solve scattered voice memos, lost demos, version confusion
- **Audio is sacred**: Playback must be rock-solid, never janky

### Rating System (NOT STARS)
- **Listened** — Auto-applied after user plays majority of track
- **Liked** — "This resonates with me"
- **Loved** — "This is special, prioritize it"

### Current Phase
**Phase 1: Songwriter Mode** (CURRENT FOCUS)
- Upload and organize tracks
- Tags, collections, ratings
- Comments and dialogue
- Set list creation
- Version history

**Phase 2: Production Mode** (FUTURE — mention in pitches only)
- AI analysis (BPM, key, mood, genre)
- Collaborator invites
- Professional review workflows

---

## 🛠 Tech Stack

- **Frontend**: React
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **File Storage**: S3 via Supabase
- **Domain**: coretet.app

---

## 📐 Code Conventions

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

## 🎨 Design System

> **IMPORTANT**: On first run, scan the actual codebase to populate these values.
> Replace the placeholders below with discovered values.

### Colors
```
Primary:     [SCAN_CODEBASE]
Secondary:   [SCAN_CODEBASE]
Accent:      [SCAN_CODEBASE]
Background:  [SCAN_CODEBASE]
Surface:     [SCAN_CODEBASE]
Text:        [SCAN_CODEBASE]
Muted:       [SCAN_CODEBASE]
Error:       [SCAN_CODEBASE]
Success:     [SCAN_CODEBASE]
```

### Typography
```
Font Family: [SCAN_CODEBASE]
Headings:    [SCAN_CODEBASE]
Body:        [SCAN_CODEBASE]
Small:       [SCAN_CODEBASE]
```

### Spacing & Radii
```
Border Radius (cards):   [SCAN_CODEBASE]
Border Radius (buttons): [SCAN_CODEBASE]
Border Radius (inputs):  [SCAN_CODEBASE]
Common padding:          [SCAN_CODEBASE]
Common gap:              [SCAN_CODEBASE]
```

### Components
```
Modals:      [SCAN_CODEBASE - what library/pattern?]
Toasts:      [SCAN_CODEBASE]
Forms:       [SCAN_CODEBASE - react-hook-form? controlled?]
Loading:     [SCAN_CODEBASE - skeleton? spinner?]
```

---

## 📁 Project Structure

> **IMPORTANT**: On first run, scan and populate actual structure.

```
[SCAN_CODEBASE]
```

---

## 🗃 Database Schema

> **IMPORTANT**: Scan Supabase types or migrations to populate.

### Tables
```
[SCAN_CODEBASE]
```

### Key Relationships
```
[SCAN_CODEBASE]
```

---

## 🚨 Current Priorities

> Update this section as priorities change.

### Active Sprint
- [ ] [Add current tasks]

### Known Issues
- [ ] [Add known bugs]

### Technical Debt
- [ ] [Add tech debt items]

---

## 🔒 Rules

1. **Never** add social/viral features (share counts, public profiles, follower systems)
2. **Never** compromise audio playback quality for other features
3. **Always** consider the non-technical musician user
4. **Always** run `@coretet-preflight` before completing UI work
5. **Always** update this file when establishing new patterns
6. **Prefer** existing patterns over introducing new ones
7. **Ask** when requirements are unclear rather than assuming

---

## 🏃 Quick Commands

| Command | Action |
|---------|--------|
| `@coretet-context` | Re-read project context, apply all conventions |
| `@coretet-preflight` | Run full QA checklist |
| `@coretet-verify` | Visual self-assessment |
| `@coretet-handoff` | Create session handoff document |
| `@coretet-audit` | Run full codebase audit |
| `@coretet-bootstrap` | Scan codebase and populate this file |

---

## 📝 Session Log

> Claude: Add brief notes here during sessions for continuity.

```
[Session notes will be added here]
```
