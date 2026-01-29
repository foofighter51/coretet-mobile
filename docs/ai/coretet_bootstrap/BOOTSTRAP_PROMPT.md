# CoreTet Bootstrap Prompt

> **INSTRUCTIONS**: Copy this entire file contents and paste into Claude Code when starting with a new or existing CoreTet codebase. Claude will scan your project and generate all necessary context files.

---

## Run This First

```
I'm setting up Claude Code automation for CoreTet, a private music collaboration platform.

Please perform the following bootstrap sequence:

---

### STEP 1: Scan & Populate CLAUDE.md

Read the existing CLAUDE.md file (or create it from the template if missing).

Then scan the codebase to replace ALL [SCAN_CODEBASE] placeholders:

**Design System Discovery:**
- Check tailwind.config.js/ts for theme colors, fonts, spacing
- Check any CSS variables in globals.css or similar
- Check existing components for consistent patterns
- Note any design tokens or theme files

**Project Structure Discovery:**
- Map the actual folder structure
- Note where components, pages, hooks, utils, types live
- Identify the routing approach (app router? pages?)

**Component Pattern Discovery:**
- How are modals implemented?
- How are forms handled?
- What loading states are used?
- What toast/notification system exists?
- How is state managed?

**Database Discovery:**
- Check for Supabase types (usually in types/ or lib/)
- Check for any migration files
- Document tables, relationships, RLS patterns

**Convention Discovery:**
- File naming patterns
- Component naming patterns
- Import organization
- Any existing ESLint/Prettier rules

Output the fully populated CLAUDE.md file.

---

### STEP 2: Create Component Playground

Create a development-only route for visual QA:

Location: Based on project structure (app/dev/playground/page.tsx or pages/dev/playground.tsx)

Include:
1. Development-only guard (check NODE_ENV)
2. All discovered reusable UI components
3. Multiple states for each (default, hover, active, disabled, loading, error)
4. Responsive preview (toggle mobile/desktop)
5. Dark/light mode toggle if applicable
6. Navigation sidebar

For CoreTet specifically, include:
- Track card states (default, playing, selected, loading)
- Rating buttons (neutral, liked, loved)
- Audio player variations
- Upload progress states
- Comment components
- Collection/tag badges
- Empty states for each major view
- Loading skeletons

---

### STEP 3: Create Preflight Checklist

Create docs/PREFLIGHT_CHECKLIST.md with:

1. Universal checks (every component)
2. Interactive component checks
3. Form-specific checks
4. Audio-specific checks (CoreTet critical)
5. Data/async checks
6. Accessibility checks

Make it copy-paste friendly for PR descriptions.

---

### STEP 4: Create Test Specifications

Create test spec files for critical paths:

Priority order for CoreTet:
1. Audio playback (play, pause, seek, volume, queue)
2. Track management (upload, rate, tag, organize)
3. Authentication flows
4. Data persistence (offline, sync, conflicts)
5. Collaboration features (comments, notifications)

Create __tests__/*.spec.ts files with describe/it blocks (can be empty/todo).
Create docs/TEST_PLAN.md documenting coverage strategy.

---

### STEP 5: Create Session Templates

Create docs/templates/ folder with:

1. SESSION_HANDOFF_TEMPLATE.md - For end-of-session state capture
2. FEATURE_SPEC_TEMPLATE.md - For planning new features
3. BUG_REPORT_TEMPLATE.md - For documenting bugs
4. PR_TEMPLATE.md - For pull request descriptions (include preflight checklist)

---

### STEP 6: Initial Audit

Perform initial codebase audit and create docs/AUDIT_REPORT.md:

- TypeScript issues (any types, missing types)
- Console warnings/errors
- TODO/FIXME inventory
- Missing loading/error/empty states
- Accessibility gaps
- Performance concerns
- Security considerations

Prioritize findings: Critical → High → Medium → Low

---

### STEP 7: Verify Setup

Confirm all files were created:
- [ ] CLAUDE.md (populated with real values)
- [ ] .vscode/coretet.code-snippets
- [ ] app/dev/playground/page.tsx (or equivalent)
- [ ] docs/PREFLIGHT_CHECKLIST.md
- [ ] docs/TEST_PLAN.md
- [ ] docs/AUDIT_REPORT.md
- [ ] docs/templates/*.md
- [ ] __tests__/*.spec.ts (skeleton files)

List any issues encountered and suggest fixes.

---

### STEP 8: First Standup

Now run @coretet-standup to give me a status report and recommended priorities.

```

---

## After Bootstrap

Once complete, you'll have:

1. **CLAUDE.md** — Project instructions Claude reads automatically
2. **Snippets** — Quick commands via `@coretet-*` or `ctx*`
3. **Playground** — Visual QA for all components
4. **Checklists** — Copy-paste QA verification
5. **Test specs** — Test structure ready to fill in
6. **Templates** — Consistent documentation
7. **Audit** — Known issues prioritized

### Daily Workflow

**Start of session:**
```
@coretet-standup
```

**During development:**
```
@coretet-feature [name]    // New feature
@coretet-component [name]  // New component  
@coretet-audio [name]      // Audio feature
@coretet-bugfix [desc]     // Bug fix
@ctx                       // Quick context reminder
```

**Before completing work:**
```
@coretet-preflight
@coretet-verify
```

**End of session:**
```
@coretet-handoff
```

**Weekly:**
```
@coretet-audit
```
