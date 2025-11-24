# CoreTet UI/UX Review Brief

## Project Overview

**Product Name:** CoreTet
**Type:** Mobile-first music collaboration app (iOS native via Capacitor, web Progressive Web App)
**Target Audience:** Musicians, bands, and creative collaborators
**Current Stage:** TestFlight beta (Build 21/22)
**Tech Stack:** React, TypeScript, Capacitor, Supabase (PostgreSQL + Auth + Storage)

## Product Description

CoreTet is a private, collaborative music workspace where band members can:
- Upload and share music tracks with timestamped feedback
- Organize tracks into playlists
- Rate tracks (listened/liked/loved)
- Leave comments with precise timestamps
- Manage band membership and permissions
- Work in isolated "bands" (workspaces) with selective access

**Core Philosophy:** Walled garden for trusted collaborators, not a public social network.

## Review Scope

Please conduct a comprehensive UI/UX review focusing on:

### 1. First Impressions & Onboarding
- Is the value proposition immediately clear?
- Does the onboarding flow feel natural and minimal?
- Are new users guided effectively to their first meaningful action?
- How does the experience differ for invited users vs. self-signups?
- Are there any points of confusion or friction in the initial setup?

### 2. Navigation & Information Architecture
- Is the navigation structure intuitive and easy to understand?
- Can users find key features without extensive exploration?
- Are navigation patterns consistent throughout the app?
- Is there proper wayfinding (breadcrumbs, clear hierarchy, back buttons)?
- Do users always know where they are in the app?

### 3. Core User Flows
Evaluate the following critical paths:

#### Track Management Flow
1. Upload a new track
2. View track details
3. Listen to track with waveform visualization
4. Leave timestamped feedback
5. Rate a track
6. Find and filter tracks

#### Collaboration Flow
1. Invite a band member
2. Accept an invite (web → app transition)
3. Switch between bands
4. View other members' feedback
5. Manage band settings

#### Playlist Flow
1. Create a playlist
2. Add tracks to playlist
3. Reorder tracks
4. Share playlist within band
5. Follow/unfollow playlists

### 4. Visual Design & Aesthetics
- Does the design feel modern and polished?
- Is the color palette effective and accessible?
- Are there any visual inconsistencies or rough edges?
- Does the design feel "music-focused" and appropriate for the domain?
- Are icons and imagery clear and purposeful?
- Is the typography hierarchy clear and readable?

### 5. Interaction Design
- Are touch targets appropriately sized for mobile use?
- Do animations and transitions feel smooth and purposeful?
- Are loading states and empty states handled gracefully?
- Is feedback provided for user actions (confirmations, errors, success)?
- Are there any gestures or interactions that feel unnatural?

### 6. Mobile-Specific Considerations
- Does the app feel native despite being web-based (Capacitor)?
- Are iOS keyboard interactions handled properly?
- Do modals and overlays work well on mobile screens?
- Is the interface responsive to different iPhone sizes?
- Are there any web-isms that break the native feel?

### 7. Content & Messaging
- Is microcopy clear, concise, and helpful?
- Are error messages actionable and friendly?
- Is help text provided where needed without being verbose?
- Does the tone match the target audience (musicians)?
- Are technical concepts explained in accessible language?

### 8. Accessibility
- Is color contrast sufficient for readability?
- Are interactive elements clearly distinguishable?
- Is the app usable without color (for color-blind users)?
- Are touch targets large enough (44x44pt minimum)?
- Is keyboard navigation functional (for web)?

### 9. Performance Perception
- Do interactions feel responsive and immediate?
- Are loading states used appropriately to manage expectations?
- Does the app feel "fast" even when processing?
- Are there any perceived delays that could be optimized?

### 10. Edge Cases & Error Handling
- What happens when uploads fail?
- How are network errors communicated?
- What does the app look like with no data (empty states)?
- How are expired invites handled?
- What happens if a user loses band access mid-session?

## Current Known Issues & Context

### Recent Improvements
- ✅ Implemented onboarding intro flow (3 screens introducing key features)
- ✅ Added empty states for playlists and tracks
- ✅ Improved loading states and feedback
- ✅ Fixed invite acceptance flow with RLS policy corrections
- ✅ Implemented Universal Links for seamless invite experience
- ✅ Added member management (invite, remove, change roles)

### Known Limitations
- Invite links currently open in mobile browser (Universal Links in TestFlight build 22+)
- No deep linking to specific tracks/playlists yet
- Limited notification system
- No real-time collaboration features yet
- Web version is functional but mobile-focused

### Technical Constraints
- Built with Capacitor (web tech in native wrapper)
- iOS-first, web Progressive Web App as secondary platform
- Supabase backend with Row Level Security (RLS) for data isolation
- File storage limited to audio formats (MP3, WAV, M4A, etc.)

## Access & Testing

### Live Deployments
- **Web App:** https://coretet.app
- **TestFlight:** (Invite-only beta, provide Apple ID for access)

### Test Credentials
- Create account via web or use TestFlight invite link
- Test invite flow: [Request invite link from team]

### Key User Personas to Consider

#### 1. Band Leader / Project Manager
- Creates bands and playlists
- Invites collaborators
- Manages band settings and permissions
- Needs overview of all activity

#### 2. Contributing Musician
- Uploads new tracks and demos
- Responds to feedback
- Rates and comments on others' work
- Needs focused view of their contributions

#### 3. Reviewer / Producer
- Listens and provides detailed feedback
- Uses timestamped comments extensively
- Needs efficient way to review multiple tracks
- May be in multiple bands simultaneously

#### 4. Casual Collaborator
- Occasional contributor
- Primarily consumes rather than creates
- Needs simple, intuitive interface
- May forget how to use between sessions

## Specific Questions to Address

1. **Value Clarity:** Within 30 seconds of opening the app, does a new user understand what CoreTet does and why they should use it?

2. **Core Loop:** Can you identify the core engagement loop? Is it compelling enough to drive repeated use?

3. **Cognitive Load:** Are there any screens or features that feel overwhelming or too complex?

4. **Delight Moments:** Are there any moments of delight or unexpected polish? Where could they be added?

5. **Friction Points:** Where do you predict users will get stuck, confused, or frustrated?

6. **Mobile Web vs Native:** Can you tell this is a web-based app? Does it feel "cheap" or does it feel premium?

7. **Trust Signals:** Does the app feel secure and professional enough for creative work?

8. **Competition:** How does this compare to alternatives (Google Drive for music, Splice, BandLab, etc.)?

## Review Deliverable Format

Please structure your review as:

### Executive Summary
- Overall impression (1-2 paragraphs)
- Top 3 strengths
- Top 3 areas for improvement
- Recommended priority level for changes (High/Medium/Low)

### Detailed Findings
For each section above, provide:
- **Observation:** What you noticed
- **Impact:** Why it matters (user experience, business goal, etc.)
- **Recommendation:** Specific, actionable suggestion
- **Effort Estimate:** Small/Medium/Large
- **Priority:** High/Medium/Low

### Annotated Screenshots
- Include screenshots with markup highlighting specific issues or opportunities
- Label clearly what you're pointing out

### Quick Wins
- List 5-10 small changes that could have immediate positive impact
- Focus on low-effort, high-impact improvements

### Strategic Recommendations
- Bigger picture suggestions for product direction
- Features or changes that would unlock significant value
- Areas to invest in for long-term success

## Additional Resources

### Codebase Access
- **Repository:** [Provide if reviewing code]
- **Documentation:** Available in `/docs` directory
- **Design System:** Token-based system in `src/design/designTokens.ts`

### Architecture Overview
```
src/
├── components/
│   ├── atoms/       # Basic UI elements (buttons, inputs)
│   ├── molecules/   # Composed components (modals, cards)
│   └── screens/     # Full page components
├── design/          # Design tokens and system
├── hooks/           # React hooks
├── utils/           # Utilities and helpers
└── contexts/        # React contexts (BandContext, UserContext)
```

### Design Patterns Used
- Modal-based navigation for settings and creation flows
- Tab-based primary navigation (Playlists, Library, Profile)
- Dropdown menus for contextual actions
- Waveform-based audio player with timestamp markers

## Questions or Clarifications?

Please reach out if you need:
- TestFlight access
- Specific test scenarios
- Access to backend/database
- Clarification on any feature or flow
- Additional context about design decisions

---

**Review Deadline:** [Specify if needed]
**Contact:** [Your contact info]
**Follow-up:** [How you'll discuss findings - Loom, doc comments, meeting, etc.]
