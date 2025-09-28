# CoreTet Band - AI Workflow Startup Guide

## Quick Session Initialization

**Step 1: Check Latest EOD Status**
```bash
ls -la ./docs/eod-status/ | tail -3
```
Read the most recent EOD file to understand:
- Previous session's completed work
- Current blockers and in-progress items
- High-priority tasks for today

**Step 2: Verify Development Environment**
```bash
# Check if dev server is running
lsof -i :3000 | head -5

# Start dev server if needed
npm run dev
```

**Step 3: Initialize Todo Tracking**
Use TodoWrite tool immediately to load current task list and mark first task as in_progress.

---

## Project Overview

### CoreTet Band - Music Collaboration Platform
- **Purpose**: Mobile-first music collaboration app for bands
- **Tech Stack**: React + TypeScript + Vite
- **Design System**: CoreTet Design System v1.0 with atomic structure
- **Target**: Mobile-first (375px base width, 812px height, max-width 425px)

### Current Architecture
```
src/
├── components/
│   ├── atoms/         # Basic UI elements
│   ├── molecules/     # TrackRow, TabBar, etc.
│   └── organisms/     # Complex components
├── design/
│   └── designTokens.ts # Consistent styling
├── types/             # TypeScript definitions
└── App.tsx           # Main application (formerly CoreTetFigmaApp-v2.tsx)
```

### Key Design Principles
1. **Mobile-First**: 375px base, responsive up to 425px max-width
2. **No Fixed Positioning**: Use flexbox for proper mobile behavior
3. **Atomic Design**: Components follow atoms → molecules → organisms structure
4. **Design Tokens**: All styling through designTokens.ts for consistency
5. **Accessibility**: Proper ARIA labels, semantic HTML

---

## Current Project Status

### ✅ Recently Completed (2025-09-25)
- Removed BeatCollab branding entirely
- Fixed responsive container (removed fixed 375×812px dimensions)
- Organized codebase (archived redundant files)
- Fixed Profile screen blank page issue
- Implemented proper welcome/phone screen layouts
- Resolved JavaScript console errors (Users import, favicon)
- Fixed multiple Vite dev servers conflict

### 🔄 High Priority Tasks
1. **Fix search bar alignment in Tracks screen** - Layout positioning issue
2. **Simplify Profile screen** - Remove large wasteful boxes, add compact options
3. **Update Add screen** - Remove templates, simplify upload flow

### 📋 Medium Priority Tasks
- Remove Band Playlists and Shared headings throughout app
- Ensure no visible scrollbars anywhere
- Make all UI elements more compact and space-efficient

### 🔍 Research Tasks
- Backend API endpoints and data structures
- React Native/Capacitor for mobile deployment

---

## AI Agent System

### Multi-Agent Coordination
The project uses specialized AI agents for code review and quality assurance:

1. **Validator Agent** - Code quality and best practices
2. **Guardian Agent** - Security and safety checks
3. **Memory Agent** - Context and consistency tracking

### When to Invoke Agents
- After significant code changes (use: "Let's have the AI agents review")
- When encountering best practice violations
- Before committing major refactors
- When layout/responsive issues arise

---

## Common Commands & Workflows

### Development Workflow
```bash
# Start development
npm run dev

# Check for running processes (if changes not appearing)
lsof -i :3000
ps aux | grep node

# Kill conflicting processes if needed
kill [PID]
```

### File Organization
- **Archive old/redundant files** to `/archive/` folder
- **Prefer editing existing files** over creating new ones
- **Follow atomic design structure** for new components

### Code Style Guidelines
- **No comments unless explicitly requested**
- **Use design tokens for all styling**
- **Implement proper TypeScript types**
- **Follow existing patterns and conventions**
- **Mobile-first responsive design**

---

## Critical Constraints & Requirements

### Security & Safety
- ✅ Defensive security tasks only
- ❌ No malicious code creation/modification
- ❌ No credential harvesting or bulk crawling
- ✅ Security analysis and documentation allowed

### Code Standards
- **No fixed positioning** - Use flexbox for mobile layouts
- **No hardcoded dimensions** - Use responsive units and design tokens
- **No BeatCollab references** - Use "CoreTet" branding only
- **Atomic design compliance** - Follow established component structure

### User Experience
- **Mobile-first design** - 375px base, responsive to 425px max
- **No horizontal scrolling** - Fix any layout overflow issues
- **Compact UI elements** - Maximize screen real estate efficiency
- **Proper navigation** - Ensure all screens have working navigation

---

## Troubleshooting Guide

### Dev Server Issues
**Problem**: Changes not appearing in browser
**Solution**: Check for multiple Vite servers, kill conflicting processes

### Layout Issues
**Problem**: Text cutoff, button misplacement
**Solution**: Replace fixed positioning with flexbox, use minHeight: 100vh

### Console Errors
**Problem**: Import errors, missing dependencies
**Solution**: Check lucide-react imports, verify component exports

### Navigation Issues
**Problem**: Blank screens, missing navigation
**Solution**: Verify screen state management, check TabBar integration

---

## Session Best Practices

### Start Every Session
1. Read latest EOD status file
2. Check development environment
3. Initialize TodoWrite tool with current tasks
4. Mark first task as in_progress

### During Development
1. **Use TodoWrite frequently** - Track progress in real-time
2. **Test changes immediately** - Verify in browser after each edit
3. **Follow mobile-first principles** - Always consider 375px viewport
4. **Maintain atomic design** - Use existing component patterns

### End Every Session
1. **Mark completed todos** - Update TodoWrite before finishing
2. **Generate EOD status** - Use daily-wrapup.md prompt
3. **Note any blockers** - Document issues for next session
4. **Clean up processes** - Check for background servers

---

## Environment Notes
- **Working Directory**: `/Users/exleymini/Apps/coretet-band`
- **Not a git repository** - No version control currently initialized
- **Platform**: macOS (Darwin 24.6.0)
- **Node Environment**: Vite development server
- **Target Browser**: Mobile-first (Chrome/Safari mobile viewports)

---

*This startup guide should be referenced at the beginning of each session to ensure consistent workflow and project understanding.*