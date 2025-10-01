# CoreTet AI Development System - Complete Overview

**Last Updated:** 2025-09-29
**Status:** Orchestra-integrated workflow ready

---

## 🎯 System Components

### 1. **CoreTet Orchestra** (PRIMARY SYSTEM) ⭐
**Location:** `docs/ai/orchestra/coretet_orchestrator.py`

**What it does:** 8 specialized AI agents that know YOUR codebase
- SecurityHardeningAgent - Fix RLS, rotate keys
- CodeCleanupAgent - Remove dead code
- SchemaIntegrityAgent - Fix database issues
- TestCoverageAgent - Add test coverage
- ArchitectureRefactorAgent - Refactor code
- AudioOptimizationAgent - Optimize uploads
- UIRefactoringAgent - Split components
- DeploymentReadinessAgent - Production prep

**When to use:** All development work, problem-solving, refactoring

**Quick start:**
```bash
cd docs/ai/orchestra
python coretet_orchestrator.py
```

---

### 2. **AI Prompts Library**
**Location:** `docs/ai/ai-prompts/`

**What it does:** Structured prompts for daily workflow
- `daily-startup.md` - Morning routine
- `daily-wrapup.md` - EOD status generation
- `task-prompts.md` - Task execution patterns
- `intervention-prompts.md` - Problem resolution
- `emergency-procedures.md` - Crisis handling

**When to use:** Daily workflow structure, EOD reports

**Integration:** Use prompts to ask Orchestra questions

---

### 3. **AI Workflow v2**
**Location:** `docs/ai/ai-workflow-v2/`

**What it does:** Efficient single-purpose workflows
- `quick-start.md` - Fast daily startup
- `focused-prompts.md` - Single-task prompts
- `validation.md` - Quality checks
- `recovery.md` - Problem fixes

**When to use:** Quick tasks, validation, troubleshooting

**Integration:** Orchestra executes these workflows

---

## 🔄 How They Work Together

### Morning Workflow
```
1. Run: ai-workflow-v2/quick-start.md
   ↓
2. Ask Orchestra: "What should I prioritize today?"
   ↓
3. Orchestra analyzes comprehensive review + current state
   ↓
4. Follow Orchestra's recommendations
```

### Task Execution
```
1. Use: ai-prompts/task-prompts.md for structure
   ↓
2. Ask Orchestra: "How do I [specific task]?"
   ↓
3. Orchestra delegates to appropriate agent(s)
   ↓
4. Validate with: ai-workflow-v2/validation.md
```

### End of Day
```
1. Use: ai-prompts/daily-wrapup.md template
   ↓
2. Ask Orchestra: "Review today's work and create EOD"
   ↓
3. Orchestra generates comprehensive summary
   ↓
4. Save to: docs/eod-status/YYYY-MM-DD-eod.md
```

---

## 📊 Decision Matrix: Which System to Use?

| Task | Use | Example |
|------|-----|---------|
| **Fix security issue** | Orchestra | `orch.process_request("Enable RLS")` |
| **Remove dead code** | Orchestra | `orch.process_request("Delete Supabase Auth code")` |
| **Daily startup** | AI Prompts | Follow `daily-startup.md` |
| **EOD report** | AI Prompts + Orchestra | Template + `orch.process_request("Review today")` |
| **Quick validation** | AI Workflow v2 | `validation.md` checklist |
| **Emergency fix** | AI Prompts | `emergency-procedures.md` |
| **Refactor component** | Orchestra | `orch.process_request("Split MainDashboard")` |
| **Add tests** | Orchestra | `orch.process_request("Set up Vitest")` |

---

## 🎯 Recommended Daily Flow

### Morning (5 minutes)
```bash
# 1. Quick context load
→ ai-workflow-v2/quick-start.md

# 2. Check priorities
cd docs/ai/orchestra
python coretet_orchestrator.py
>>> orch.process_request("What should I prioritize today based on comprehensive review?")

# 3. Review latest EOD
cat docs/eod-status/$(ls -t docs/eod-status/*-eod.md | head -1)
```

### During Work
```bash
# Ask Orchestra for guidance
>>> orch.process_request("How do I [task]?")

# Validate after changes
→ ai-workflow-v2/validation.md

# If problems
→ ai-workflow-v2/recovery.md
```

### Evening (10 minutes)
```bash
# Generate EOD
→ ai-prompts/daily-wrapup.md template

# Or use Orchestra
>>> orch.process_request("Create EOD report for today")

# Save output to docs/eod-status/YYYY-MM-DD-eod.md
```

---

## 🚀 Quick Start Guide

### First Time Setup
```bash
# 1. Set API key
export ANTHROPIC_API_KEY='your-key'

# 2. Review Orchestra setup
cd docs/ai/orchestra
cat CORETET_INDEX.md

# 3. Test Orchestra
python coretet_orchestrator.py
```

### Daily Usage
```bash
# Morning
python coretet_orchestrator.py
>>> orch.process_request("What's my priority today?")

# During work
>>> orch.process_request("[your question]")

# Evening
>>> orch.process_request("Generate EOD report")
```

---

## 📁 File Organization

```
docs/ai/
├── AI_SYSTEM_OVERVIEW.md          # ← YOU ARE HERE
├── ORCHESTRA_UPDATE_SUMMARY.md     # Orchestra creation summary
│
├── orchestra/                       # PRIMARY SYSTEM
│   ├── CORETET_INDEX.md            # Start here
│   ├── coretet_orchestrator.py     # The tool
│   ├── CORETET_REALITY_CHECK.md    # Context
│   └── CORETET_VS_GENERIC.md       # Comparison
│
├── ai-prompts/                      # Daily workflow
│   ├── README.md                   # Quick reference
│   ├── daily-startup.md            # Morning routine
│   ├── daily-wrapup.md            # EOD generation
│   ├── task-prompts.md            # Task patterns
│   └── intervention-prompts.md     # Problem solving
│
└── ai-workflow-v2/                  # Efficient workflows
    ├── README.md                   # Overview
    ├── quick-start.md              # Fast startup
    ├── focused-prompts.md          # Single tasks
    ├── validation.md               # Quality checks
    └── recovery.md                 # Fix problems
```

---

## 🎓 Learning Path

### Week 1: Get Comfortable
1. Read `orchestra/CORETET_INDEX.md`
2. Run Orchestra with simple questions
3. Use `ai-prompts/daily-startup.md` each morning
4. Generate EOD with `ai-prompts/daily-wrapup.md`

### Week 2: Deeper Integration
1. Ask Orchestra for task guidance
2. Use `ai-workflow-v2/focused-prompts.md` patterns
3. Validate with `ai-workflow-v2/validation.md`
4. Practice recovery with `ai-workflow-v2/recovery.md`

### Week 3: Full Workflow
1. Morning: Quick start → Orchestra priority check
2. Work: Orchestra guidance → Focused execution
3. Validation: Quality checks after changes
4. Evening: Orchestra-generated EOD report

---

## 💡 Pro Tips

### Orchestra Best Practices
```python
# ✅ Good: Specific to CoreTet
orch.process_request("How do I enable RLS with Clerk JWTs?")

# ❌ Bad: Generic question
orch.process_request("How do I secure my app?")

# ✅ Good: References actual code
orch.process_request("Fix the race condition in audioUploadService.ts:117")

# ❌ Bad: Vague
orch.process_request("Make uploads better")
```

### Prompt Library Best Practices
- Use templates as-is (they're optimized)
- Fill in date verification steps (critical for EOD)
- Don't skip validation steps
- Archive old prompts that don't apply

### Workflow v2 Best Practices
- One task at a time (focused-prompts)
- Always validate after changes
- Use recovery procedures when stuck
- Keep workflows under 5 steps

---

## 🔧 Customization

### Adding Orchestra Agents
```python
# In coretet_orchestrator.py
class CustomAgent(BaseAgent):
    def get_system_prompt(self):
        return """Your specialized knowledge for CoreTet..."""

# Add to orchestrator
orch.agents["custom"] = CustomAgent(orch.client)
```

### Creating Custom Prompts
```markdown
# New prompt in ai-prompts/
## [Prompt Name]

**Purpose:** [What this achieves]
**When:** [When to use this]

### Steps:
1. [Action 1]
2. [Action 2]

### Success Criteria:
- [ ] [Check 1]
- [ ] [Check 2]
```

---

## 🆘 Troubleshooting

### Orchestra Issues
**Problem:** Wrong agent suggestions
**Fix:** Be more specific in questions

**Problem:** Generic advice
**Fix:** Ensure using `coretet_orchestrator.py` not `music_app_orchestrator.py`

**Problem:** Outdated context
**Fix:** `orch.reset_all()` then ask again

### Prompt Issues
**Problem:** EOD file wrong date
**Fix:** Run `date +"%Y-%m-%d"` first, verify

**Problem:** Startup too slow
**Fix:** Use `ai-workflow-v2/quick-start.md` instead

### Workflow Issues
**Problem:** Task getting complex
**Fix:** `intervention-prompts.md` → Complexity Reset

**Problem:** AI conflict
**Fix:** `intervention-prompts.md` → AI Conflict Resolution

---

## 📊 System Maturity

### Current State
- ✅ Orchestra: Production ready
- ✅ AI Prompts: Stable, proven
- ✅ Workflow v2: Optimized
- ✅ Integration: Documented

### Future Enhancements
- [ ] Orchestra GitHub integration
- [ ] Automated EOD generation
- [ ] CI/CD integration
- [ ] Real-time codebase monitoring

---

## 🎯 Success Metrics

### With This System You Can:
- ✅ Get specific answers about YOUR codebase (not generic)
- ✅ Execute complex refactoring with guidance
- ✅ Fix security issues with step-by-step help
- ✅ Generate comprehensive EOD reports
- ✅ Maintain consistent daily workflow
- ✅ Recover from problems quickly
- ✅ Validate changes efficiently

---

## 📞 Quick Reference

### Most Used Commands
```bash
# Orchestra
cd docs/ai/orchestra && python coretet_orchestrator.py

# Today's priority
orch.process_request("What should I work on today?")

# Fix specific issue
orch.process_request("How do I fix [specific issue]?")

# Generate EOD
orch.process_request("Create end of day report")

# Check validation
→ ai-workflow-v2/validation.md
```

### Emergency Procedures
1. **Stuck on task:** `ai-prompts/intervention-prompts.md` → Complexity Reset
2. **AI conflict:** `ai-prompts/intervention-prompts.md` → AI Conflict
3. **Critical bug:** `ai-prompts/emergency-procedures.md`
4. **Orchestra confusion:** `orch.reset_all()` + rephrase question

---

## 🚀 Get Started Now

```bash
# 1. Open Orchestra guide
cat docs/ai/orchestra/CORETET_INDEX.md

# 2. Run Orchestra
cd docs/ai/orchestra
python coretet_orchestrator.py

# 3. Ask your first question
>>> orch.process_request("What's the most critical issue I should fix first?")
```

**You now have a complete AI development system customized for CoreTet!** 🎵