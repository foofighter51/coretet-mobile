# CoreTet Claude Code Setup Guide

> A step-by-step guide to set up autonomous Claude Code workflows for CoreTet.

---

## 📦 What's In This Package

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project instructions Claude reads automatically every session |
| `.vscode/coretet.code-snippets` | Quick commands for VS Code |
| `BOOTSTRAP_PROMPT.md` | One-time prompt to scan your codebase and generate everything |
| `SETUP_GUIDE.md` | This file — your reference |

---

## 🚀 Initial Setup (One-Time)

### Step 1: Copy Files to Your Project

```bash
# From your CoreTet project root:

# Create the .vscode folder if it doesn't exist
mkdir -p .vscode

# Copy the snippet file
cp [download-location]/.vscode/coretet.code-snippets .vscode/

# Copy CLAUDE.md to project root (Claude Code looks for this automatically)
cp [download-location]/CLAUDE.md ./

# Keep BOOTSTRAP_PROMPT.md handy (doesn't need to be in project)
```

### Step 2: Run the Bootstrap

1. Open your CoreTet project in VS Code
2. Open Claude Code (Cmd/Ctrl + Shift + P → "Claude: Open")
3. Copy the entire contents of `BOOTSTRAP_PROMPT.md`
4. Paste into Claude Code and send

Claude will:
- Scan your codebase
- Populate CLAUDE.md with your actual values
- Create the dev playground
- Create documentation templates
- Run an initial audit
- Give you a status report

**This takes 5-10 minutes but only needs to happen once.**

### Step 3: Verify Setup

After bootstrap, check that these exist:
- [ ] `CLAUDE.md` — Has real values, not [SCAN_CODEBASE] placeholders
- [ ] `.vscode/coretet.code-snippets` — Snippets work in VS Code
- [ ] `app/dev/playground/page.tsx` — Playground route exists
- [ ] `docs/PREFLIGHT_CHECKLIST.md` — QA checklist created
- [ ] `docs/AUDIT_REPORT.md` — Initial audit complete

### Step 4: Test the Snippets

In VS Code, open any file and type:
- `@ctx` — Should expand to quick context reminder
- `@coretet-preflight` — Should expand to full checklist

If snippets don't work, make sure:
1. The `.vscode` folder is in your project root
2. VS Code has reloaded (Cmd/Ctrl + Shift + P → "Reload Window")

---

## 🎯 Daily Workflow

### Starting a Session

```
@coretet-standup
```

Claude will:
- Check for build/test errors
- Review any handoff notes from last session
- Recommend top priorities

### Working on Features

**New Feature:**
```
@coretet-feature Track rating redesign
```

**New Component:**
```
@coretet-component TrackCard
```

**Audio Work (extra care needed):**
```
@coretet-audio Waveform visualization
```

**Bug Fix:**
```
@coretet-bugfix Audio pauses when switching tabs
```

### Quick Context Reminder

When Claude seems to forget CoreTet specifics, just type:
```
@ctx
```

Or for full context reload:
```
@coretet-context
```

### Before Completing Work

Always run before marking something done:
```
@coretet-preflight
```

For visual work, also:
```
@coretet-verify
```

### Ending a Session

```
@coretet-handoff
```

Creates/updates `docs/SESSION_HANDOFF.md` so next session can pick up smoothly.

---

## 📋 Quick Reference Card

| Command | When to Use |
|---------|-------------|
| `@ctx` | Quick reminder mid-task |
| `@coretet-context` | Full context reload |
| `@coretet-standup` | Start of session |
| `@coretet-feature X` | Starting new feature |
| `@coretet-component X` | Creating component |
| `@coretet-audio X` | Audio-related work |
| `@coretet-bugfix X` | Fixing a bug |
| `@coretet-preflight` | Before completing UI work |
| `@coretet-verify` | Visual self-check |
| `@coretet-handoff` | End of session |
| `@coretet-audit` | Weekly codebase review |
| `@coretet-bootstrap` | Re-scan codebase (rare) |

---

## 🔧 Customization

### Adding New Commands

Edit `.vscode/coretet.code-snippets` to add new shortcuts:

```json
"My Custom Command": {
  "prefix": ["@coretet-custom", "ctxcustom"],
  "body": [
    "@coretet-context",
    "",
    "Your instructions here...",
    "${1:placeholder_for_input}"
  ],
  "description": "What this command does"
}
```

### Updating Project Context

Edit `CLAUDE.md` directly when:
- You establish new patterns
- Priorities change
- You add new conventions
- You want to document decisions

**Good things to add:**
- Links to Figma designs
- API documentation URLs
- Team decisions and rationale
- Third-party integration details

### Re-Running Bootstrap

If your project structure changes significantly:
```
@coretet-bootstrap
```

This re-scans and updates CLAUDE.md.

---

## ⚠️ Troubleshooting

### Claude Keeps Forgetting Context

**Symptom:** Claude uses star ratings, suggests social features, etc.

**Fix:** Add `@ctx` at the start of your prompt, or run `@coretet-context`

### Snippets Not Working

**Symptom:** Typing `@ctx` doesn't expand

**Fix:**
1. Check `.vscode/coretet.code-snippets` exists
2. Reload VS Code window
3. Make sure you're pressing Tab or Enter after typing the trigger

### Claude.md Not Being Read

**Symptom:** Claude doesn't seem to know project conventions

**Fix:** 
1. Make sure `CLAUDE.md` is in project root
2. Explicitly say "Read CLAUDE.md first" in your prompt
3. Check that the file isn't empty or corrupted

### Bootstrap Failed Midway

**Symptom:** Some files created, others missing

**Fix:** Run specific steps manually:
```
Scan the codebase and populate the [SCAN_CODEBASE] placeholders in CLAUDE.md with actual values.
```

```
Create a development playground route at app/dev/playground/page.tsx with all UI components.
```

---

## 🎸 CoreTet-Specific Tips

### Audio Work
Always use `@coretet-audio` instead of `@coretet-feature` for audio-related work. It includes extra checks for:
- File format handling
- Mobile autoplay policies
- Cross-navigation persistence
- Smooth seeking/progress

### Rating System
If Claude uses "stars" or "5-point rating", correct immediately:
```
Remember: CoreTet uses Listened → Liked → Loved, not stars. @ctx
```

### UI/UX Work
For any user-facing work, always end with:
```
@coretet-preflight
@coretet-verify
```

This catches 80% of issues before you even test manually.

### Before Testing/Launch
Run a full audit:
```
@coretet-audit
```

Review `docs/AUDIT_REPORT.md` and address Critical/High items.

---

## 📚 Files Claude Will Create/Manage

After setup, Claude manages these docs:

| File | Updated When |
|------|--------------|
| `docs/SESSION_HANDOFF.md` | End of each session (`@coretet-handoff`) |
| `docs/AUDIT_REPORT.md` | On request (`@coretet-audit`) |
| `CLAUDE.md` Session Log | During sessions (appended notes) |

You should review these periodically and clean up stale information.

---

## 🆘 Getting Help

If the system isn't working as expected:

1. **Check CLAUDE.md** — Is it populated correctly?
2. **Run @coretet-bootstrap** — Re-scan the codebase
3. **Simplify** — Use `@ctx` + manual instructions
4. **Ask Claude** — "Why did you [wrong thing]? Remember @ctx"

The system is designed to be resilient — even if parts break, the core commands (`@ctx`, `@coretet-preflight`) will always help.

---

## ✨ Pro Tips

1. **Keep CLAUDE.md updated** — It's a living document, not set-and-forget

2. **Use handoffs religiously** — Future-you will thank present-you

3. **Trust but verify** — `@coretet-preflight` catches most issues

4. **Quick context is quick** — `@ctx` is 3 characters, use it liberally

5. **Weekly audits** — 10 minutes prevents hours of tech debt

6. **Update commands** — If you find yourself typing the same instructions, make a snippet

---

*Happy shipping! 🎸*
