# Problem Recovery

Fast resolution when AI tools create issues.

---

## Quick Recovery Actions

### AI Generated Bad Code

**Problem**: AI created broken/problematic code

**Fast Fix**:
```bash
# Revert specific files
git checkout -- [broken-files]

# Or revert last commit
git reset --hard HEAD~1
```

**Better Approach**: Re-prompt with more specific constraints
- "Fix only the bug, don't refactor"
- "Use existing pattern from [file:line]"  
- "Minimal change, preserve all functionality"

---

### Build/Test Failures

**Problem**: AI changes broke build or tests

**Immediate Actions**:
1. Check error messages for obvious issues
2. Try `npm install` if dependencies changed
3. Clear caches: `npm run clean` or `rm -rf node_modules .next`
4. If still broken: `git checkout -- .`

**Prevention**: Always run validation.md checks after AI changes

---

### Performance Regression

**Problem**: AI code is significantly slower

**Quick Diagnosis**:
```bash
# Check for obvious issues
- Infinite loops or recursion
- Synchronous operations that should be async
- Unnecessary database queries
- Large object creation in loops
```

**Fast Fix**: Revert and re-implement with performance constraints specified

---

### AI Tools Conflicting

**Problem**: Claude Code says X, Copilot suggests Y

**Resolution Process**:
1. **Architecture/Design**: Follow Claude Code
2. **Syntax/Boilerplate**: Follow Copilot  
3. **Business Logic**: Use human judgment
4. **Security/Performance**: Follow Claude Code

**Document Decision**: Add comment explaining why approach was chosen

---

### Over-Engineering Alert

**Problem**: AI created unnecessarily complex solution

**Warning Signs**:
- New abstractions for simple tasks
- More files than necessary
- Complex patterns for basic functionality
- Hard to understand what code does

**Quick Fix**:
```markdown
"STOP - This is over-engineered. Provide the simplest possible solution that:
- Uses existing code patterns
- Adds maximum 20 lines
- Requires no new dependencies  
- Can be understood by junior developer"
```

---

### Lost Context/Progress

**Problem**: AI forgot what we were working on

**Context Recovery**:
1. Check recent git commits: `git log --oneline -10`
2. Look for work-in-progress: `git status`
3. Check recent EOD files: `ls -t docs/eod-status/*.md | head -3`
4. Scan code for `// TODO:` and `// FIXME:` markers

**Quick Re-sync**: Summarize current state in 2-3 sentences, then continue

---

### Emergency Stop Procedures

### 🚨 Production Issues

**If AI changes caused production problems:**

1. **Immediate**: Revert to last known good deploy
2. **Assess**: What specifically broke?
3. **Fix**: Minimal patch, test thoroughly  
4. **Deploy**: Only the fix, not other pending changes
5. **Review**: Update AI guidelines to prevent similar issues

### 🛑 Repository Corruption

**If git history or codebase is damaged:**

```bash
# Backup current state
cp -r . ../project-backup-$(date +%Y%m%d)

# Reset to last known good state
git log --oneline -20  # find good commit
git reset --hard [good-commit-hash]

# Restore working files if needed
cp ../project-backup-*/[specific-files] ./
```

---

## Prevention Strategies

### Better Prompting
- Start prompts with success criteria
- Include constraints upfront  
- Reference specific existing patterns
- Limit scope explicitly

### Checkpoint Commits
```bash
# Before major AI assistance
git add -A && git commit -m "Checkpoint before AI changes"

# After validating AI output  
git add -A && git commit -m "Validated AI implementation of [feature]"
```

### Recovery-Friendly Workflow
1. Work on feature branches
2. Make frequent small commits
3. Test before pushing
4. Keep main branch stable

---

**Golden Rule**: When in doubt, revert and try again with better constraints.