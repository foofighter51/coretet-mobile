# Quick Start - Daily AI Workflow

**Goal**: Get productive in 2 minutes

## Morning Setup

```bash
# 1. Verify date
date +"%Y-%m-%d"

# 2. Check git status  
git status

# 3. Find latest EOD (if exists)
ls -t docs/eod-status/*eod.md 2>/dev/null | head -1
```

**Action**: Read the latest EOD file (if found) and extract:
- Incomplete tasks → Today's priorities  
- Known blockers → Address first
- Work in progress → Resume

**No EOD file?** Skip to step 4.

## 4. Set Today's Focus (Pick One)

**New Feature**: "Implement [FEATURE] following existing patterns in [SIMILAR_FILE]"

**Bug Fix**: "Debug [ISSUE] in [FILE/FUNCTION] - minimal fix only"

**Refactor**: "Clean up [COMPONENT] without changing functionality"  

**Review**: "QC recent changes in [FILES] for quality and consistency"

## 5. AI Tool Setup

- **Claude Code**: Architecture, debugging, reviews
- **Copilot**: Implementation, boilerplate, completion
- **Code markers**: `// TODO:`, `// FIXME:`, `// AI-REVIEW:`

## Success Criteria

✅ Know today's #1 priority  
✅ Understand current codebase state  
✅ Have clear next action  

**Time target**: Under 2 minutes

---

*If this takes longer than 2 minutes, you're overthinking it.*