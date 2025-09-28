# Quick Reference

Essential commands and patterns for efficient AI workflow.

---

## Daily Commands

```bash
# Quick start
date +"%Y-%m-%d" && git status

# Find latest EOD
ls -t docs/eod-status/*eod.md 2>/dev/null | head -1

# Check code health
npm test && npm run lint && npm run build

# Create checkpoint
git add -A && git commit -m "Checkpoint: [what you're about to work on]"
```

---

## Quality Gates

**After every AI change:**
```bash
npm test [changed-area]  # Functionality
npm run lint            # Code standards  
npm run build           # Integration
npm run dev             # Manual check
```

**Pass all 4 or revert the change.**

---

## Effective AI Prompts

### Do ✅
- "Fix bug X in file.js:123 using minimal change"
- "Add feature Y following pattern in similar-file.js"  
- "Refactor function Z without changing behavior"
- "Review changes in [files] for quality issues"

### Don't ❌
- "Make the code better" (too vague)
- "Implement advanced feature with all edge cases" (too complex)
- "Rewrite everything to use latest patterns" (too broad)
- Multi-paragraph prompts with 20+ requirements

---

## Code Markers

Use these to track AI involvement:

```javascript
// TODO: Add error handling here
// FIXME: Memory leak in this function  
// AI-REVIEW: Generated code needs human verification
// CLAUDE-APPROVED: Architecture reviewed and approved
```

---

## Git Workflow

```bash
# Safe AI experimentation
git checkout -b ai-experiment
[make AI changes]
[validate with quality gates]
git checkout main && git merge ai-experiment

# Emergency rollback
git reset --hard HEAD~1  # Last commit
git checkout -- file.js  # Specific file
```

---

## Tool Responsibilities

| Task Type | Primary Tool | Secondary |
|-----------|-------------|-----------|
| Architecture | Claude Code | - |
| Debugging | Claude Code | - |
| Code Review | Claude Code | - |
| Implementation | Copilot | Claude Code |
| Boilerplate | Copilot | - |
| Refactoring | Claude Code | Copilot |

---

## Recovery Commands

```bash
# Quick fixes
npm install              # Dependency issues
rm -rf node_modules .next && npm install  # Cache issues
git clean -fd            # Remove untracked files

# Rollback options
git checkout -- .       # All files
git reset --hard HEAD~1 # Last commit
git revert [commit]      # Safe public rollback
```

---

## Time Boxes

- **Daily setup**: 2 minutes max
- **Single prompt**: 15-30 minutes max  
- **Quality check**: 5 minutes max
- **Recovery**: 10 minutes max

**If any step takes longer, you're overcomplicating it.**

---

## Success Metrics

**Good Day**:
- ✅ 3+ meaningful commits
- ✅ All tests passing
- ✅ No build errors
- ✅ Code quality maintained

**Great Day**:  
- ✅ Above + feature completed
- ✅ Technical debt reduced
- ✅ Team velocity improved

**Warning Signs**:
- ❌ Multiple reverts needed
- ❌ Build broken for >30 minutes  
- ❌ AI changes need extensive manual fixes
- ❌ More debugging than building

---

## Emergency Contacts

**When AI workflow fails completely:**

1. **Revert everything**: `git reset --hard [last-good-commit]`
2. **Take manual control**: Disable AI tools temporarily
3. **Fix immediate issues**: Focus on getting build working
4. **Reassess approach**: Review what went wrong
5. **Restart systematically**: Use simpler prompts

**Remember**: AI is a tool, not a replacement for engineering judgment.