# CoreTet AI Orchestra - Start Here

**Welcome to your CoreTet-specific AI development team!**

---

## 🚨 Important: Two Orchestras Available

### 1. **Generic Music App Orchestra** (from Claude)
📁 Files: `music_app_orchestrator.py`, `MUSIC_APP_GUIDE.md`, etc.
- Built for hypothetical music collaboration app
- Assumes greenfield project
- Mobile-first (React Native/Flutter)
- Good for learning, NOT for CoreTet work

### 2. **CoreTet Reality-Based Orchestra** ⭐ **USE THIS**
📁 Files: `coretet_orchestrator.py`, `CORETET_REALITY_CHECK.md`, etc.
- Built specifically for YOUR codebase
- Knows actual tech stack (React/Vite/Clerk/Supabase)
- Focuses on refactoring & security
- Addresses real issues from comprehensive review

---

## 🎯 Quick Start (5 minutes)

### Step 1: Understand Your Situation
Read: **[CORETET_REALITY_CHECK.md](CORETET_REALITY_CHECK.md)** (5 min)
- What's wrong with generic orchestra
- What's actually in your codebase
- Current issues and priorities

### Step 2: See the Difference
Read: **[CORETET_VS_GENERIC.md](CORETET_VS_GENERIC.md)** (3 min)
- Side-by-side comparison
- Why CoreTet orchestra is better
- Example questions and answers

### Step 3: Use CoreTet Orchestra
Run: `python coretet_orchestrator.py`
- Ask about YOUR actual issues
- Get fixes for YOUR codebase
- Reference YOUR comprehensive review

---

## 📚 Documentation Map

### CoreTet-Specific (⭐ Use These)
1. **CORETET_INDEX.md** ← You are here
2. **CORETET_REALITY_CHECK.md** ← Critical context
3. **CORETET_VS_GENERIC.md** ← Comparison guide
4. **coretet_orchestrator.py** ← The actual tool

### Generic (Reference Only)
5. INDEX.md ← Generic index
6. MUSIC_APP_GUIDE.md ← Generic guide
7. music_app_orchestrator.py ← Generic tool
8. music_app_examples.py ← Generic examples

### Project Context
9. **../../COMPREHENSIVE_REVIEW_2025-09-29.md** ← Full codebase review
10. **../../CLEANUP_ACTION_PLAN.md** ← Step-by-step fixes
11. **../../eod-status/2025-09-29-final-eod.md** ← Latest status

---

## 🤖 Your 8 CoreTet Agents

### 🔒 SecurityHardeningAgent
**Fixes:** RLS disabled, exposed keys, Edge Functions bypassed
**Use for:** "Fix security issues", "Enable RLS", "Rotate API keys"

### 🧹 CodeCleanupAgent
**Fixes:** 3,000 lines dead code, unused imports, duplicate files
**Use for:** "Remove dead code", "Clean up codebase", "Delete unused files"

### 🗄️ SchemaIntegrityAgent
**Fixes:** Missing columns, type mismatches, schema sync
**Use for:** "Fix database schema", "Add missing columns", "Sync types"

### 🧪 TestCoverageAgent
**Fixes:** <5% test coverage, no mocking, no E2E tests
**Use for:** "Add tests", "Set up Vitest", "Mock Clerk/Supabase"

### 🏗️ ArchitectureRefactorAgent
**Fixes:** Direct DB writes, monolithic components, no separation
**Use for:** "Refactor architecture", "Use Edge Functions", "Split components"

### 🎵 AudioOptimizationAgent
**Fixes:** Race conditions, no compression, large files
**Use for:** "Optimize audio upload", "Fix file cleanup", "Add compression"

### 🎨 UIRefactoringAgent
**Fixes:** Inline styles, 605-line MainDashboard, no lazy loading
**Use for:** "Split MainDashboard", "Extract styles", "Add error boundaries"

### 🚀 DeploymentReadinessAgent
**Fixes:** No CI/CD, no monitoring, environment issues
**Use for:** "Production checklist", "Set up CI/CD", "Configure monitoring"

---

## 💡 Example Usage

```python
from coretet_orchestrator import CoreTetOrchestrator

orch = CoreTetOrchestrator()

# Security fixes
orch.process_request("How do I enable RLS with Clerk authentication?")

# Code cleanup
orch.process_request("What dead code can I safely delete?")

# Refactoring
orch.process_request("How do I split the 605-line MainDashboard?")

# Testing
orch.process_request("Set up test infrastructure with Vitest")

# Production prep
orch.process_request("Production deployment checklist")
```

---

## 🎯 Your Immediate Priorities

Based on comprehensive review, tackle in this order:

### Week 1: Critical Security
```python
orch.process_request("Enable RLS on all tables with Clerk-compatible policies")
orch.process_request("Rotate all exposed API keys")
orch.process_request("Fix UUID generation algorithm")
```

### Week 1-2: Code Cleanup
```python
orch.process_request("Remove all Supabase Auth dead code")
orch.process_request("Fix database schema mismatches")
orch.process_request("Delete unused test scripts")
```

### Week 2-3: Testing
```python
orch.process_request("Set up Vitest with Clerk/Supabase mocks")
orch.process_request("Add tests for authentication flow")
orch.process_request("Add tests for critical components")
```

### Month 2: Refactoring
```python
orch.process_request("Refactor to use Edge Functions properly")
orch.process_request("Split MainDashboard into feature components")
orch.process_request("Extract inline styles to styled-components")
```

---

## 🔍 What Each Agent Knows

### All Agents Know:
- ✅ Your tech stack (React/Vite/Clerk/Supabase)
- ✅ Your codebase structure (~13,605 lines)
- ✅ Current issues (RLS disabled, dead code, etc.)
- ✅ Comprehensive review findings
- ✅ Cleanup action plan priorities

### What They DON'T Assume:
- ❌ You need to choose a framework (you already have React)
- ❌ You need to design auth (you have Clerk)
- ❌ You need to choose database (you have Supabase)
- ❌ You're building mobile (you're building web)

---

## 📊 CoreTet vs Generic

| Aspect | Generic Orchestra | CoreTet Orchestra |
|--------|------------------|-------------------|
| **Project Type** | Hypothetical | YOUR app |
| **Tech Stack** | Choose from options | React/Clerk/Supabase |
| **Phase** | Greenfield design | Refactoring/hardening |
| **Focus** | Plan new features | Fix existing issues |
| **Mobile** | React Native/Flutter | Web app (React/Vite) |
| **Auth** | Design system | Fix Clerk+Supabase |
| **Database** | Choose & design | Fix schema bugs |
| **Priority** | Build from scratch | Secure & clean up |

**TL;DR:** Use CoreTet Orchestra for all your work!

---

## 🚀 Quick Commands

```bash
# Set up (if needed)
export ANTHROPIC_API_KEY='your-key'

# Run CoreTet orchestra
python coretet_orchestrator.py

# Compare generic vs CoreTet
cat CORETET_VS_GENERIC.md
```

---

## 📖 Reading Order

**First time? Read in this order:**

1. **This file** (CORETET_INDEX.md) ← Overview
2. **CORETET_REALITY_CHECK.md** ← Understand the gaps
3. **CORETET_VS_GENERIC.md** ← See the difference
4. **../../COMPREHENSIVE_REVIEW_2025-09-29.md** ← Full context
5. **coretet_orchestrator.py** ← Start using it

**Need reference?**
- Generic docs (INDEX.md, MUSIC_APP_GUIDE.md) for learning
- CoreTet docs for actual work

---

## 🎓 Learning vs Working

### Learning About Music Apps?
Use generic orchestra:
- Study design patterns
- Explore tech options
- Understand architecture choices
- Plan hypothetical features

### Working on CoreTet?
Use CoreTet orchestra:
- Fix security issues
- Remove dead code
- Refactor components
- Prepare for production
- Address review findings

---

## ⚡ Pro Tips

1. **Always use CoreTet orchestra for your app**
   - Knows your actual codebase
   - Gives specific file paths
   - References real issues

2. **Check priority before acting**
   - Orchestra marks tasks as critical/high/medium/low
   - Follow comprehensive review roadmap
   - Week 1: Security (critical)
   - Week 2+: Everything else

3. **Ask specific questions**
   - ❌ "How do I build authentication?" (too generic)
   - ✅ "How do I enable RLS with Clerk JWTs?" (specific to CoreTet)

4. **Reference documentation**
   - Orchestra knows about comprehensive review
   - It can reference specific files
   - It understands cleanup action plan

---

## 🆘 Troubleshooting

### "Orchestra suggests wrong tech stack"
→ You're using generic orchestra. Switch to `coretet_orchestrator.py`

### "Suggestions don't match my code"
→ Make sure you're using CoreTet orchestra, not generic

### "I need help with new feature, not cleanup"
→ That's fine! CoreTet orchestra can help with new features too, but understands current context

---

## 📞 Need Help?

Ask the orchestrator itself:

```python
orch.process_request("What should I prioritize first based on the comprehensive review?")
orch.process_request("How do I fix the most critical security issues?")
orch.process_request("Walk me through removing dead code safely")
```

---

## ✅ Success Checklist

Before starting work, ensure:
- [ ] You're using `coretet_orchestrator.py` (not generic)
- [ ] You've read CORETET_REALITY_CHECK.md
- [ ] You understand your priorities (comprehensive review)
- [ ] You have ANTHROPIC_API_KEY set
- [ ] You know which agent handles your issue

---

## 🎯 Bottom Line

**Generic Orchestra:** "Let's design a music app!"
→ ❌ Not useful for CoreTet

**CoreTet Orchestra:** "Let's fix YOUR app's security and clean up that dead code!"
→ ✅ Exactly what you need

---

**Start here: `python coretet_orchestrator.py`**

**Good luck! 🚀🎵**