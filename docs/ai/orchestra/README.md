# 🎵 CoreTet Orchestra - AI Development Team

Your personal AI development team that knows your codebase and can execute tasks.

## 🚀 NEW: Agentic Orchestra

**Agents that can actually code, not just advise!**

The Agentic Orchestra can:
- ✅ Read and write files
- ✅ Edit code
- ✅ Run commands
- ✅ Search codebase
- ✅ Make actual changes with safety rails

### Quick Start

```bash
./run-agentic.sh
```

Then try:
```
preview Enable RLS on profiles table
execute Remove dead Supabase Auth code
```

**📖 Full Guide:** [AGENTIC_GUIDE.md](AGENTIC_GUIDE.md)

## 📊 Advisory Orchestra (Original)

Strategic advice and analysis without making changes.

```bash
./run.sh
```

Good for:
- Strategic planning
- Architecture review
- Learning about your codebase

## 📚 Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands and common tasks
- **[AGENTIC_GUIDE.md](AGENTIC_GUIDE.md)** - Complete guide to agentic execution
- **[CORETET_INDEX.md](CORETET_INDEX.md)** - Agent specialties and context

## 🤖 8 Specialized Agents

Each agent knows your codebase and its specific issues:

1. **SecurityHardeningAgent** - Fix RLS, rotate keys, add JWT validation
2. **CodeCleanupAgent** - Remove 3,000+ lines of dead code
3. **SchemaIntegrityAgent** - Fix database schema issues
4. **TestCoverageAgent** - Add comprehensive testing
5. **ArchitectureRefactorAgent** - Improve code structure
6. **AudioOptimizationAgent** - Optimize upload system
7. **UIRefactoringAgent** - Split large components
8. **DeploymentReadinessAgent** - Production preparation

## 💡 How It Works

### Agentic Mode (Execute Tasks)

1. **You ask:** "Fix the RLS security issues"
2. **Agent analyzes:** Reads schema, identifies tables
3. **Agent plans:** Designs RLS policies
4. **Agent executes:** Creates SQL files, updates code
5. **You review:** Check changes with `git diff`
6. **You decide:** Commit or rollback

### Advisory Mode (Strategic Guidance)

1. **You ask:** "What should I prioritize today?"
2. **Agent analyzes:** Reviews comprehensive review, EOD status
3. **Agent advises:** Provides prioritized recommendations
4. **You code:** Implement the suggestions yourself

## 🔒 Safety Features

- **Preview Mode**: See what would happen before executing
- **Change Tracking**: Every action is logged
- **Git Integration**: Easy rollback with `git reset`
- **Execution Modes**: Choose preview/execute/auto based on confidence

## 🎯 Common Tasks

### Security
```bash
./run-agentic.sh
```
```
execute Enable RLS on all tables with Clerk JWT validation
execute Rotate exposed API keys
execute Fix weak UUID generation
```

### Cleanup
```
execute Remove all dead Supabase Auth code
execute Remove unused imports across the project
execute Delete old authentication screens
```

### Testing
```
preview Set up Vitest testing framework
execute Add tests for audioUploadService
execute Add integration tests for band creation
```

## 🔄 Integration with Claude Code

You have two AI assistants now:

### Agentic Orchestra
- Large refactoring tasks
- Bulk changes
- Well-defined problems
- Repetitive work

### Claude Code (interactive chat)
- Exploratory work
- Complex debugging
- Design decisions
- Code review
- Quick edits

**Best practice:** Use both together!
1. Ask Claude for strategy
2. Let Agentic Orchestra execute
3. Come back to Claude for refinements

## 📦 Installation

Already done! You have:
- ✅ Python virtual environment
- ✅ Anthropic API configured
- ✅ 8 agents loaded
- ✅ Tool system ready
- ✅ Safety rails in place

## 🐛 Troubleshooting

### Can't run the orchestra
```bash
cd /Users/exleymini/Apps/coretet-band
./docs/ai/orchestra/run-agentic.sh
```

### Agent made wrong changes
```bash
git reset --hard HEAD  # Rollback
```

### Task not working
- Try `preview` mode first
- Be more specific in task description
- Check logs for errors

## 📖 Learn More

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Command cheat sheet
- [AGENTIC_GUIDE.md](AGENTIC_GUIDE.md) - Detailed execution guide
- [CORETET_VS_GENERIC.md](CORETET_VS_GENERIC.md) - Why CoreTet-specific?

## 🎉 Ready to Start?

```bash
# Launch agentic orchestra
./run-agentic.sh

# Try a simple task
preview What should I work on first?

# Execute a real task
execute Remove dead Supabase Auth imports from AuthContext
```

**Remember:** Always commit your work before running complex tasks!

```bash
git add .
git commit -m "checkpoint before orchestra"
```

Then you can always rollback if needed:

```bash
git reset --hard HEAD
```

---

**Questions?** Ask Claude Code (interactive chat) for help!
