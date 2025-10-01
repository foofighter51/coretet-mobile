# 🎵 CoreTet Orchestra - Quick Reference

## Two Orchestras Available

### 📊 **Advisory Orchestra** (Original)
**File:** `run.sh`
**Purpose:** Strategic advice and analysis
**Can do:** Analyze, recommend, answer questions
**Can't do:** Make code changes

```bash
./docs/ai/orchestra/run.sh
```

### 🚀 **Agentic Orchestra** (NEW - Executes Tasks!)
**File:** `run-agentic.sh`
**Purpose:** Actually execute development tasks
**Can do:** Read/write files, edit code, run commands, make changes
**Safety:** Preview mode, change tracking, rollback with git

```bash
./docs/ai/orchestra/run-agentic.sh
```

---

## Agentic Orchestra - Quick Commands

### Preview (Safest)
See what would happen without making changes:
```
preview <task>
```

### Execute (Recommended)
Make changes with safety previews:
```
execute <task>
```

### Auto (Fast)
Execute immediately without previews:
```
auto <task>
```

---

## Common Tasks

### Security Fixes
```
preview Enable RLS on all tables
execute Fix the weak UUID generation
execute Rotate exposed API keys
```

### Code Cleanup
```
execute Remove all dead Supabase Auth code
execute Remove unused imports from src/
preview Find duplicate code patterns
```

### Database Schema
```
preview Design RLS policies for Clerk JWT
execute Add indexes to frequently queried columns
execute Fix foreign key constraints
```

### Refactoring
```
execute Split MainDashboard into smaller components
execute Extract repeated logic into utilities
preview Design API layer between frontend and Supabase
```

### Audio System
```
execute Add file validation to audio uploads
preview Implement chunked uploads
execute Add progress tracking to AudioUploader
```

### Testing
```
preview Set up Vitest for the project
execute Add tests for audioUploadService
execute Add tests for band creation flow
```

---

## 8 Specialized Agents

| Agent | Specialty | Example Task |
|-------|-----------|--------------|
| **security** | RLS, keys, JWT | `execute Enable RLS on profiles table` |
| **cleanup** | Dead code removal | `execute Remove unused Supabase code` |
| **schema** | Database fixes | `execute Add missing indexes` |
| **architecture** | Code structure | `execute Split large components` |
| **audio** | Upload optimization | `execute Add file validation` |
| **ui** | Component refactoring | `execute Add loading states` |
| **testing** | Test coverage | `execute Add unit tests` |
| **deployment** | Production prep | `preview Create deployment checklist` |

---

## Safety Checklist

Before running agents:
- [ ] Git commit current work: `git add . && git commit -m "checkpoint"`
- [ ] Use `preview` first for new tasks
- [ ] Review changes with `git diff` after execution
- [ ] Test the app: `npm run dev`
- [ ] Commit or rollback: `git commit` or `git reset --hard HEAD`

---

## When to Use Which Tool?

### Use Agentic Orchestra For:
- ✅ Large refactoring ("Remove all dead code")
- ✅ Repetitive tasks ("Add tests for all services")
- ✅ Well-defined problems ("Enable RLS on all tables")
- ✅ Bulk changes ("Fix all type errors")

### Use Claude Code (me) For:
- ✅ Exploratory work ("How does auth work?")
- ✅ Complex debugging ("Why is upload failing?")
- ✅ Design decisions ("Should we use React Query?")
- ✅ Quick edits ("Change this variable name")
- ✅ Code review ("Does this look right?")

### Use Advisory Orchestra For:
- ✅ Strategic planning ("What should I prioritize?")
- ✅ Architecture review ("Is my approach correct?")
- ✅ Learning ("Explain how RLS works")

---

## Example Workflow

1. **Strategy** (Ask Claude):
   > "What are the top security priorities?"

2. **Execute** (Agentic Orchestra):
   ```
   execute Enable RLS on profiles table with Clerk JWT validation
   ```

3. **Review** (Check changes):
   ```bash
   git diff
   ```

4. **Refine** (Ask Claude):
   > "The RLS policy looks good, but can we also add band_id check?"

5. **Test** (Manual):
   ```bash
   npm run dev
   # Test the feature
   ```

6. **Commit**:
   ```bash
   git add .
   git commit -m "Add RLS policies (Security Agent)"
   ```

---

## Troubleshooting

### "Can't find run-agentic.sh"
Make sure you're in project root:
```bash
cd /Users/exleymini/Apps/coretet-band
./docs/ai/orchestra/run-agentic.sh
```

### "Agent made wrong changes"
Rollback with git:
```bash
git reset --hard HEAD
```

### "Task keeps looping"
Task might be too vague. Be more specific:
- ❌ "Fix everything"
- ✅ "Remove dead imports from AuthContext.tsx"

### "No changes made"
Agent might be in preview mode. Use `execute` instead of `preview`.

---

## Pro Tips

1. **Always preview first** for complex tasks
2. **Commit before big changes** so you can rollback
3. **Be specific** in task descriptions
4. **Review diffs** before committing
5. **Test manually** after agent makes changes
6. **Use git** to track what changed

---

## Ready to Start?

```bash
# Launch the agentic orchestra
./docs/ai/orchestra/run-agentic.sh

# Try a simple task first
preview Add a TODO comment to App.tsx

# Then execute it
execute Add a TODO comment to App.tsx

# Check what changed
git diff

# Rollback if needed
git reset --hard HEAD
```

---

## Questions?

Come back to Claude Code (me) and ask! I can:
- Help you understand what the agent did
- Refine changes the agent made
- Debug issues
- Explain the code
- Make quick adjustments

**Remember:** Agentic Orchestra + Claude Code = Powerful combo! 🎵
