# 🔒 Security Fixes Playbook - Agentic Orchestra Commands

## Prerequisites

1. **Commit your current work:**
   ```bash
   git add .
   git commit -m "Checkpoint before security fixes"
   ```

2. **Launch Agentic Orchestra:**
   ```bash
   cd /Users/exleymini/Apps/coretet-band
   ./docs/ai/orchestra/run-agentic.sh
   ```

---

## Phase 1: Emergency Lockdown (CRITICAL - Do First)

### Step 1: Manually Rotate API Keys

⚠️ **This must be done manually in dashboards:**

1. **Clerk Dashboard** - Generate new publishable key
2. **Supabase Dashboard** - Generate new anon key
3. **Google AI Studio** - Generate new Gemini key

Update your `.env.local` with new keys.

### Step 2: Enable RLS on All Tables

**Command:**
```
preview Enable RLS on all tables: profiles, ensembles, ensemble_members, ensemble_invitations, versions
```

**Review the plan, then execute:**
```
execute Enable RLS on all tables: profiles, ensembles, ensemble_members, ensemble_invitations, versions
```

**After execution:**
```bash
# Exit orchestra (Ctrl+C or type: quit)
git diff
git add .
git commit -m "Enable RLS on all tables (Security Agent)"
```

### Step 3: Secure Environment Files

**Command:**
```
execute Create .env.template file and ensure .env.local is in .gitignore
```

**After execution:**
```bash
git diff
git add .
git commit -m "Secure environment configuration (Security Agent)"
```

### Step 4: Remove .env.local from Git History

**Command:**
```
execute Remove .env.local from git history using git filter-branch
```

⚠️ **Manual fallback if agent can't do this:**
```bash
git rm .env.local --cached
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
git push --force
```

---

## Phase 2: Secure Refactoring (This Week)

### Step 5: Fix Weak UUID Generation

**Command:**
```
execute Replace weak UUID generation in src/utils/crypto.ts with crypto.randomUUID()
```

**After execution:**
```bash
git diff src/utils/crypto.ts
git add .
git commit -m "Fix weak UUID generation (Security Agent)"
```

### Step 6: Remove Dead Supabase Auth Code

**Command:**
```
preview Remove all dead Supabase Auth code from the codebase
```

**Review what will be deleted, then:**
```
execute Remove all dead Supabase Auth code from the codebase
```

**After execution:**
```bash
git diff
git add .
git commit -m "Remove dead Supabase Auth code (Cleanup Agent)"
```

### Step 7: Delete Unused Auth Screens and Test Scripts

**Command:**
```
execute Delete unused files: src/contexts/AuthContext.tsx, src/utils/supabaseAuthService.ts, src/App-original.tsx, and all test scripts in /scripts/
```

**After execution:**
```bash
git status
git add .
git commit -m "Delete unused auth files and test scripts (Cleanup Agent)"
```

### Step 8: Design RLS Policies for Clerk JWT

**Command:**
```
preview Design comprehensive RLS policies for all tables that validate Clerk JWT tokens
```

**Review the policies, then:**
```
execute Create RLS policies for all tables with Clerk JWT validation
```

**After execution:**
```bash
git diff
git add .
git commit -m "Add Clerk-compatible RLS policies (Security Agent)"
```

---

## Phase 3: Edge Functions Security (Next)

### Step 9: Design Secure Edge Functions

**Command:**
```
preview Design secure Edge Functions for profiles, ensembles, and versions with Clerk JWT validation and input validation
```

**Review the design, then work with Claude Code to implement.**

### Step 10: Replace Direct Database Calls

**Command:**
```
preview Identify all direct Supabase client calls in src/lib/supabase.ts that need to be replaced with Edge Function calls
```

**After review:**
```
execute Create Edge Function client wrappers to replace direct database calls in src/lib/supabase.ts
```

**After execution:**
```bash
git diff
git add .
git commit -m "Replace direct DB calls with Edge Functions (Architecture Agent)"
```

---

## Phase 4: Security Testing (Final)

### Step 11: Set Up Testing Framework

**Command:**
```
preview Set up Vitest testing framework for security tests
```

**Then execute:**
```
execute Set up Vitest with initial configuration for security testing
```

**After execution:**
```bash
git diff
git add .
git commit -m "Set up Vitest testing framework (Testing Agent)"
```

### Step 12: Add RLS Security Tests

**Command:**
```
execute Create security tests for RLS policies to verify users cannot access other users' data
```

**After execution:**
```bash
git diff
git add .
git commit -m "Add RLS security tests (Testing Agent)"
```

### Step 13: Add Authentication Flow Tests

**Command:**
```
execute Create tests for Clerk authentication flow and JWT validation
```

**After execution:**
```bash
git diff
git add .
git commit -m "Add authentication flow tests (Testing Agent)"
```

### Step 14: Add Edge Function Tests

**Command:**
```
execute Create integration tests for all Edge Functions
```

**After execution:**
```bash
git diff
npm test  # Run tests to verify
git add .
git commit -m "Add Edge Function integration tests (Testing Agent)"
```

---

## Quick Reference: Common Commands

### Launch Orchestra
```bash
cd /Users/exleymini/Apps/coretet-band
./docs/ai/orchestra/run-agentic.sh
```

### Stop Orchestra
Press **Ctrl+C**

### Rollback Changes
```bash
git reset --hard HEAD
```

### Review Changes
```bash
git diff
git status
```

### Test After Changes
```bash
npm run dev
# Test the app manually
```

### Commit Changes
```bash
git add .
git commit -m "Description of changes (Agent Name)"
```

---

## Safety Checklist

Before each agent task:
- [ ] Current work is committed
- [ ] You understand what the agent will do (use `preview` first)
- [ ] You have a backup (git commit)

After each agent task:
- [ ] Review changes with `git diff`
- [ ] Test the app with `npm run dev`
- [ ] Commit if good, rollback if bad

---

## Estimated Timeline

| Phase | Tasks | Duration | Agent Used |
|-------|-------|----------|------------|
| **Phase 1** | Steps 1-4 | 1 day | security |
| **Phase 2** | Steps 5-8 | 3-5 days | security, cleanup |
| **Phase 3** | Steps 9-10 | 3-5 days | architecture, security |
| **Phase 4** | Steps 11-14 | 3-4 days | testing |

**Total: ~2 weeks to secure the app**

---

## Success Metrics

After completing all steps:
- [x] RLS enabled on all 5 tables
- [x] All API keys rotated and secured
- [x] Weak UUID generation fixed
- [x] Dead code removed (3,000+ lines)
- [x] Edge Functions handling all database operations
- [x] Comprehensive security tests passing
- [x] No direct Supabase client calls in frontend

**Security Rating: F → A**

---

## Troubleshooting

### Agent keeps looping
Be more specific:
- ❌ "Fix security issues"
- ✅ "Enable RLS on profiles table"

### Agent made wrong changes
```bash
git reset --hard HEAD
```

### Task failed
Try in preview mode first:
```
preview <task>
```

### Need help
Come back to Claude Code and ask!

---

## Ready to Start?

1. **Commit current work:**
   ```bash
   git add .
   git commit -m "Checkpoint before security fixes"
   ```

2. **Launch orchestra:**
   ```bash
   ./docs/ai/orchestra/run-agentic.sh
   ```

3. **Start with most critical:**
   ```
   execute Enable RLS on all tables: profiles, ensembles, ensemble_members, ensemble_invitations, versions
   ```

4. **Review and commit:**
   ```bash
   git diff
   git add .
   git commit -m "Enable RLS (Security Agent)"
   ```

**Let's secure your app! 🔒**
