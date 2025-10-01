# 🚀 CoreTet Agentic Orchestra - Complete Guide

## What's Different?

### Old Orchestra (Advisory Only)
- Agents analyze and give advice
- You still write all the code
- Good for strategic planning

### **New Agentic Orchestra (Execution)**
- Agents can READ, WRITE, EDIT files
- Agents can RUN commands
- Agents can SEARCH codebase
- Agents make actual changes (with safety rails)
- You review and approve

## Quick Start

### Run from VSCode Terminal

```bash
./docs/ai/orchestra/run-agentic.sh
```

## Three Execution Modes

### 1. Preview Mode (Safest)
See what the agent **would** do without making changes:

```
🎵 Command: preview Fix the RLS security issues
```

**Result:** Agent describes its plan step-by-step

### 2. Execute Mode (Recommended)
Agent executes with safety previews for each change:

```
🎵 Command: execute Fix the RLS security issues
```

**How it works:**
1. Agent reads files to understand current state
2. Agent proposes changes (you see previews)
3. Agent makes changes one at a time
4. You can review the diff before applying
5. Agent verifies changes worked

### 3. Auto Mode (Advanced)
Agent executes immediately without previews:

```
🎵 Command: auto Remove all dead Supabase Auth code
```

**Warning:** Use only for well-defined tasks. Always have git backup!

## Available Agents

### 🔒 security
**Specialty:** Fix RLS, rotate keys, add JWT validation

**Example tasks:**
```
preview Enable RLS on profiles table with Clerk-compatible policies
execute Rotate the exposed API keys
auto Fix the weak UUID generation
```

### 🧹 cleanup
**Specialty:** Remove dead code, unused imports

**Example tasks:**
```
execute Remove all dead Supabase Auth code from AuthContext
preview Find and remove unused imports in src/
auto Delete the old authentication screens
```

### 🗄️ schema
**Specialty:** Fix database schema, create migrations

**Example tasks:**
```
preview Design RLS policies for all tables
execute Create migration to add missing indexes
auto Fix the foreign key constraint on profiles.user_id
```

### 🏗️ architecture
**Specialty:** Refactor code structure

**Example tasks:**
```
execute Split MainDashboard component into smaller pieces
preview Design an API layer between frontend and Supabase
auto Extract repeated logic into utility functions
```

### 🎵 audio
**Specialty:** Optimize audio upload system

**Example tasks:**
```
execute Add file validation to audio uploads
preview Implement chunked uploads for large files
auto Add progress tracking to AudioUploader
```

### 🎨 ui
**Specialty:** Refactor UI components

**Example tasks:**
```
execute Add loading states to all screens
preview Split large components in src/components/screens
auto Fix inconsistent error handling in UI
```

### 🧪 testing
**Specialty:** Add test coverage

**Example tasks:**
```
preview Set up Vitest for the project
execute Add unit tests for audioUploadService
auto Create integration tests for band creation
```

### 🚀 deployment
**Specialty:** Prepare for production

**Example tasks:**
```
preview Create a production deployment checklist
execute Set up environment configuration
auto Add error monitoring with Sentry
```

## Safety Features

### 1. Preview First
All destructive actions (write, edit, delete) show a preview before executing.

### 2. Change Tracking
Every change is logged. Get a summary anytime:
```python
result = orchestra.execute("some task")
print(result['changes_summary'])
```

### 3. Mode Control
- `preview` - No changes made, just planning
- `execute` - Changes made with previews
- `auto` - Fast execution (use carefully)

### 4. Git Integration
Always commit before major changes:
```bash
git add .
git commit -m "Pre-Orchestra checkpoint"
```

Then you can rollback if needed:
```bash
git reset --hard HEAD
```

## Example Workflow

### Scenario: Fix Security Issues

**Step 1: Preview the plan**
```
🎵 Command: preview Enable RLS on all tables with Clerk-compatible policies
```

Review the agent's plan. Does it make sense?

**Step 2: Execute with safety**
```
🎵 Command: execute Enable RLS on all tables with Clerk-compatible policies
```

Agent will:
1. Read current schema
2. Generate RLS policies
3. Show you each policy before applying
4. Create migration files
5. Test that policies work

**Step 3: Review changes**
Check the files the agent modified:
```bash
git diff
```

**Step 4: Test manually**
```bash
npm run dev
# Test the app
```

**Step 5: Commit or rollback**
```bash
# If good:
git add .
git commit -m "Add RLS policies (via Security Agent)"

# If bad:
git reset --hard HEAD
```

## Tips for Success

### ✅ Do's

- **Be specific:** "Fix RLS on profiles table" is better than "improve security"
- **Preview first:** Always preview complex tasks before executing
- **Commit often:** Create git checkpoints before major changes
- **Review diffs:** Check what changed with `git diff`
- **Test after:** Run the app after agent makes changes

### ❌ Don'ts

- **Don't use auto mode for complex tasks** - Use execute instead
- **Don't run without git** - Always have a way to rollback
- **Don't trust blindly** - Review what the agent did
- **Don't chain too many tasks** - Do one thing at a time
- **Don't skip testing** - Always test after changes

## Integration with Claude (me)

You now have two tools:

### 🎵 Agentic Orchestra (Autonomous Execution)
**Use for:**
- Large refactoring tasks ("Remove all dead code")
- Repetitive work ("Add tests for all services")
- Well-defined problems ("Enable RLS on all tables")

### 💬 Claude Code (Interactive Coding)
**Use for:**
- Exploratory work ("How does this authentication flow work?")
- Complex debugging ("Why is this upload failing?")
- Design decisions ("Should we use React Query?")
- Quick edits ("Change this function name")

### Recommended Workflow

1. **Ask Claude (me) for strategy:**
   "What should I prioritize for security?"

2. **Have Agentic Orchestra execute:**
   `execute Fix the top 3 security issues`

3. **Come back to Claude to review:**
   "The agent made these changes, do they look right?"

4. **Use Claude for refinements:**
   "Can you adjust the RLS policy to also check band_id?"

## Troubleshooting

### "Agent keeps looping"
- Task might be too vague
- Try more specific instructions
- Use preview mode to see what it's trying to do

### "Changes look wrong"
```bash
git reset --hard HEAD  # Rollback
```
Then try:
```
preview <more specific task>
```

### "Agent can't find files"
Make sure you're in the project root:
```bash
cd /Users/exleymini/Apps/coretet-band
./docs/ai/orchestra/run-agentic.sh
```

### "Tool execution failed"
- Check file permissions
- Ensure npm packages are installed
- Try in preview mode first

## Advanced Usage

### Use Specific Agent

```
🎵 Command: execute --agent=cleanup Remove dead Supabase code
```

### Chain Multiple Tasks

Better to do separately:
```
execute Task 1
# Review results
execute Task 2
# Review results
```

### Custom Preview Depth

For deep analysis, ask for details:
```
preview Give detailed step-by-step plan for fixing all security issues
```

## Next Steps

1. **Try a simple task:**
   ```
   preview Add a TODO comment to App.tsx
   execute Add a TODO comment to App.tsx
   ```

2. **Review the changes:**
   ```bash
   git diff src/App.tsx
   ```

3. **Try a real task:**
   ```
   execute Remove dead Supabase Auth imports from AuthContext
   ```

4. **Get ambitious:**
   ```
   execute Enable RLS on profiles table with Clerk JWT validation
   ```

## Questions?

- **Can agents break my code?** They can make changes, but you can always rollback with git
- **Should I use auto mode?** Only for simple, well-defined tasks
- **How do I stop an agent?** Ctrl+C in terminal, then rollback with git
- **Can multiple agents work together?** Not yet, but coming soon!
- **Is this better than Claude Code?** Different use cases - use both!

---

**Ready to try it?**

```bash
./docs/ai/orchestra/run-agentic.sh
```

Then start with:
```
preview What should I fix first?
```
