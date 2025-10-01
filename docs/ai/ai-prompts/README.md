# AI Prompt Library Quick Reference

**Note:** These prompts now integrate with **CoreTet Orchestra** for enhanced guidance.
See: `../AI_SYSTEM_OVERVIEW.md` for complete system architecture.

## 🎵 Orchestra Integration

**Primary Tool:** `../orchestra/coretet_orchestrator.py`

Use prompts below to structure questions for Orchestra:
```python
from coretet_orchestrator import CoreTetOrchestrator
orch = CoreTetOrchestrator()

# Example: Use daily-wrapup.md template with Orchestra
orch.process_request("Create EOD report for today based on git changes and task log")
```

## Daily Workflow
1. **Morning**: Use `daily-startup.md` + Ask Orchestra: "What's my priority today?"
2. **Tasks**: Refer to `task-prompts.md` + Ask Orchestra for specific guidance
3. **Mid-day Check**: Use `intervention-prompts.md` → Mid-Day Progress
4. **Issues**: Check `intervention-prompts.md` or ask Orchestra directly
5. **Evening**: Use `daily-wrapup.md` → Orchestra can generate EOD
6. **Friday**: Use `daily-wrapup.md` → Weekly Consolidation

## Periodic Maintenance
- **Bi-weekly**: `maintenance-prompts.md` → Sprint Checkpoint
- **Monthly**: `maintenance-prompts.md` → Trend Analysis

## Project Setup
- **New**: `implementation/new-project.md`
- **Existing**: `implementation/existing-project.md`
- **Team**: `implementation/team-onboarding.md`

## When Things Go Wrong
- **Emergency**: `emergency-procedures.md`
- **Over-engineering**: `intervention-prompts.md` → Complexity Reset
- **AI Conflicts**: `intervention-prompts.md` → AI Conflict Resolution
- **Code Issues**: Ask Orchestra (knows your actual codebase)

## Quick Commands
```bash
# Orchestra (primary tool)
cd docs/ai/orchestra && python coretet_orchestrator.py

# Find most recent EOD
ls -lt ./docs/eod-status/*-eod.md | grep -v TEMPLATE | head -1

# Verify date
date +"%Y-%m-%d %H:%M:%S %Z"

# Ask Orchestra for help
orch.process_request("What should I work on based on comprehensive review?")
```

## 🎯 Best Practice
1. Use these prompts for **structure and templates**
2. Ask **Orchestra for specific CoreTet guidance**
3. Orchestra knows your codebase, these prompts provide workflow
