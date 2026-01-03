# Phase 1: Codebase Architecture Audit
**Generated**: 2026-01-02
**Project**: CoreTet Band (Music Collaboration Platform)

---

## 1.1 Architecture Overview

### Overall Architecture Pattern: **React Context + Hooks**

The application uses **React Context API** as its primary state management solution, with no Redux, MobX, or Zustand. This is a modern, lightweight approach suitable for the app's scale.

**State Management Structure:**
```
ThemeProvider (root)
  └── BrowserRouter
      └── SetListProvider (per user session)
          └── BandProvider (per user session)
              └── App Components
```

**Context Providers Identified:**
1. **ThemeContext** (`src/contexts/ThemeContext.tsx`) - 1,079 bytes
   - Manages light/dark mode theme state
   - localStorage persistence
   - Recently added (Dec 23, 2025)

2. **SetListContext** (`src/contexts/SetListContext.tsx`) - 8,387 bytes
   - Manages playlists/set lists
   - Handles created vs followed set lists
   - Integrates with Supabase

3. **BandContext** (`src/contexts/BandContext.tsx`) - 3,204 bytes
   - Manages band membership
   - Handles band switching
   - User role management

4. **AuthContext** (`src/contexts/AuthContext.tsx`) - 13,300 bytes
   - Largest context file
   - Handles Supabase authentication
   - Session management

### Navigation Structure: **React Router v7**

**Router Type:** BrowserRouter (web-based routing)

**Route Structure:**
```
/ (root)
├── /auth/confirmed (email confirmation success)
├── /invite/:token (band invite acceptance)
├── /playlist/:shareCode (shared playlist view)
├── /app/* (authenticated app routes)
└── * (catch-all → landing page or auth)
```

**Platform Detection:**
- Uses `Capacitor.isNativePlatform()` to distinguish web vs native
- Native: Shows PhoneAuthScreen
- Web: Shows NewLandingPage

**Deep Linking:**
- Custom scheme: `coretet://`
- Handled via `DeepLinkService` utility

---

## 1.2 Folder Structure Assessment

### Current Structure:
```
src/
├── components/
│   ├── atoms/          (11 files) - Basic UI elements
│   ├── molecules/      (27 files) - Composite components
│   ├── organisms/      (empty) - Should contain complex features
│   ├── screens/        (19 files) - Full screen views
│   └── ui/             (7 files) - Shared UI components
├── contexts/           (4 files) - React Context providers
├── design/             (3 files + tokens/) - Design system
├── hooks/              - Custom React hooks
├── utils/              - Helper functions
├── types/              - TypeScript definitions
├── constants/          - App constants
└── lib/                - External library wrappers
```

### ✅ Strengths:
1. **Atomic Design Pattern** - Clear component hierarchy (atoms → molecules → screens)
2. **Separation of Concerns** - Design tokens separate from components
3. **Context Isolation** - Each context has single responsibility
4. **Type Safety** - Dedicated types directory

### ⚠️ Areas for Improvement:
1. **Organisms Folder Empty** - Should move complex features here (e.g., AudioPlayer, TrackList)
2. **Duplicate Screen Folders** - Both `src/screens/` and `src/components/screens/` exist
3. **Large Files** - MainDashboard.tsx is 84KB (2,111 lines) - needs refactoring
4. **Lib vs Utils** - Unclear distinction between `/lib` and `/utils`

### Scalability Assessment: **MODERATE**
- Current structure supports ~50-100 components comfortably
- Will need refactoring before 200+ components
- Large screen files should be split into feature modules

---

## 1.3 Third-Party Dependencies Analysis

### Core Framework
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `react` | ≥18.0.0 | ✅ Active | Latest stable, excellent support |
| `react-dom` | ≥18.0.0 | ✅ Active | Matches React version |
| `react-router-dom` | 7.9.3 | ✅ Active | Latest v7, modern routing |
| `typescript` | 5.0.2 | ✅ Active | Current stable release |

### Mobile/Hybrid
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@capacitor/core` | 7.4.3 | ✅ Active | Latest Capacitor v7 |
| `@capacitor/ios` | 7.4.3 | ✅ Active | iOS platform support |
| `@capacitor/app` | 7.1.0 | ✅ Active | App lifecycle hooks |
| `@capacitor/filesystem` | 7.1.4 | ✅ Active | File management |
| `@capacitor/share` | 7.0.2 | ✅ Active | Native share dialog |
| `@capacitor/status-bar` | 7.0.3 | ✅ Active | Status bar control |
| `@capawesome/capacitor-file-picker` | 7.2.0 | ✅ Active | File picker plugin |

### Backend/Database
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@supabase/supabase-js` | 2.58.0 | ✅ Active | Latest Supabase client |

### UI/Design
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@radix-ui/react-*` | ~1.1-2.2 | ✅ Active | Modern accessible components |
| `lucide-react` | 0.263.1 | ✅ Active | Icon library (800+ icons) |
| `framer-motion` | 11.0.0 | ✅ Active | Animation library |
| `tailwindcss` | 4.0.0-alpha.5 | ⚠️ ALPHA | Using alpha version - may have bugs |
| `clsx` | 2.0.0 | ✅ Active | Utility for className management |
| `tailwind-merge` | 1.14.0 | ✅ Active | Merge Tailwind classes |

### Audio
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `howler` | 2.2.4 | ⚠️ Stale | Last update 2020, still works |
| `lamejs` | 1.2.1 | ⚠️ Stale | MP3 encoding, maintenance mode |

### AI/ML
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@google/generative-ai` | 0.24.1 | ✅ Active | Google Gemini integration |

### Utilities
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `uuid` | 13.0.0 | ✅ Active | UUID generation |
| `class-variance-authority` | 0.7.0 | ✅ Active | Component variants |

### Build Tools
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `vite` | 4.4.5 | ✅ Active | Modern build tool |
| `@vitejs/plugin-react` | 4.0.3 | ✅ Active | React plugin for Vite |

### Testing
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `jest` | 29.7.0 | ✅ Active | Test framework |
| `@testing-library/react` | 13.4.0 | ✅ Active | React testing utils |
| `puppeteer` | 24.22.3 | ✅ Active | E2E testing |

---

## 1.4 Risk Assessment

### 🔴 HIGH RISK
1. **Tailwind CSS v4 Alpha** - Production app using alpha software
   - Recommendation: Downgrade to v3.x stable or wait for v4 stable

2. **MainDashboard Monolith** - 84KB single file
   - 2,111 lines of code
   - Handles too many responsibilities
   - Difficult to test and maintain

### 🟡 MEDIUM RISK
1. **Audio Libraries Stale** - Howler (2020), LameJS (maintenance mode)
   - Still functional but not actively developed
   - May have security vulnerabilities
   - Consider alternatives: Tone.js, Web Audio API

2. **No React Native** - Project called "@coretet/design-system" but primarily web
   - Package.json claims React Native support
   - Actual app uses Capacitor (hybrid web)
   - Misaligned naming/documentation

### 🟢 LOW RISK
1. **Dependencies Generally Modern** - Most packages actively maintained
2. **Good Type Coverage** - TypeScript throughout
3. **Modern React Patterns** - Hooks, Context, functional components

---

## 1.5 Code Quality Metrics

### Component Complexity
```
Largest Files (lines of code):
1. MainDashboard.tsx        - 2,111 lines  🔴 CRITICAL
2. NewLandingPage.tsx       -   634 lines  🟡 REFACTOR
3. AcceptInvite.tsx         -   659 lines  🟡 REFACTOR
4. FeedbackDashboard.tsx    -   619 lines  🟡 REFACTOR
5. FeedbackBoard.tsx        -   524 lines  🟡 REFACTOR
```

### Context Providers Size
```
1. AuthContext.tsx          -   331 lines  ✅ GOOD
2. SetListContext.tsx       -   208 lines  ✅ GOOD
3. BandContext.tsx          -    80 lines  ✅ GOOD
4. ThemeContext.tsx         -    44 lines  ✅ GOOD
```

### Test Coverage
- Jest configured with 85% coverage threshold
- Coverage reports: branches, functions, lines, statements
- ✅ Good testing infrastructure in place

---

## 1.6 Recommendations

### Immediate (This Week)
1. **Refactor MainDashboard** - Split into feature modules
   - Extract PlaylistView component
   - Extract TrackList component
   - Extract AudioPlayer component
   - Target: <500 lines per file

2. **Downgrade Tailwind** - Move to v3.4.x stable
   - Alpha versions unsuitable for production
   - Risk of breaking changes

### Short Term (This Month)
3. **Consolidate Screen Folders** - Remove duplicate
   - Keep `/src/components/screens/`
   - Move or delete `/src/screens/`

4. **Populate Organisms** - Move complex components
   - AudioPlayerOrganism
   - TrackListWithFilters
   - PlaylistManager

5. **Audio Library Evaluation** - Research alternatives
   - Test Web Audio API capabilities
   - Consider Tone.js for advanced features

### Long Term (This Quarter)
6. **Module Bundling** - Implement code splitting
   - Current bundle: 718KB (206KB gzipped) 🔴
   - Target: <100KB initial bundle
   - Use dynamic imports for routes

7. **Accessibility Audit** - WCAG AA compliance
   - Good foundation with Radix UI
   - Need keyboard navigation review
   - Add ARIA labels systematically

8. **Performance Optimization**
   - Current warnings about 500KB chunks
   - Implement manual code splitting
   - Lazy load heavy screens

---

## 1.7 Architecture Score

| Category | Score | Status |
|----------|-------|--------|
| State Management | 8/10 | ✅ Good Context pattern |
| Folder Structure | 6/10 | ⚠️ Needs cleanup |
| Dependencies | 7/10 | ⚠️ Some stale/alpha packages |
| Code Quality | 5/10 | 🔴 Large files need refactoring |
| Type Safety | 9/10 | ✅ Excellent TypeScript usage |
| Testing Setup | 8/10 | ✅ Good infrastructure |
| Scalability | 6/10 | ⚠️ Will struggle past 100 components |

**Overall Architecture Grade: B-**

Solid foundation with modern patterns, but needs refactoring of large files and dependency cleanup before production launch.

---

**Next Steps:** Proceed to Phase 2 (Component Analysis) focusing on MainDashboard refactoring.
