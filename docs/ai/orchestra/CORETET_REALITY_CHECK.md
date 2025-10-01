# CoreTet Orchestra - Reality Check & Updates Needed

**Date:** 2025-09-29
**Status:** Orchestra needs major updates to match actual codebase

---

## 🚨 Critical Inaccuracies in Current Orchestra

### 1. Tech Stack Assumptions (WRONG)

**Orchestra Assumes:**
- Mobile app (React Native or Flutter)
- Need to choose backend framework
- Need to design database
- Greenfield project

**CoreTet Reality:**
- ✅ React 18 web app with TypeScript + Vite
- ✅ Supabase (PostgreSQL) backend - already implemented
- ✅ Clerk authentication - already integrated
- ✅ ~13,605 lines of existing code
- ✅ Working app with auth/upload/bands functional

---

### 2. Authentication Context (WRONG)

**Orchestra Assumes:**
- Need to design auth system
- Choose between OAuth/JWT/etc
- Plan security architecture

**CoreTet Reality:**
- ✅ Clerk authentication via phone/SMS (already working)
- ⚠️ RLS **disabled** on all tables (security issue)
- ⚠️ Edge Functions deployed but **bypassed**
- ⚠️ Direct database writes from client (insecure)
- ⚠️ Dual auth systems (Supabase Auth dead code still present)

---

### 3. Development Stage (WRONG)

**Orchestra Assumes:**
- Week 1: Design schema
- Week 2: Design UI
- Week 3: Implement features
- Week 4: Deploy

**CoreTet Reality:**
- **Current Phase:** Refactoring & security hardening
- **Immediate Need:** Fix critical security issues
- **Priority:** Remove 3,000 lines of dead code
- **Status:** Functional but not production-ready

---

### 4. Missing Critical Context

**Orchestra doesn't know:**
- RLS disabled (F security score)
- API keys exposed in .env.local
- Weak UUID generation causing collision risk
- Schema mismatches between code and database
- Edge Functions exist but aren't being used
- Comprehensive review completed (40 days of cleanup identified)

---

## ✅ What CoreTet Actually Needs

### Immediate Priorities (Week 1)
1. **SecurityAgent** - Fix RLS, rotate keys, secure auth flow
2. **RefactoringAgent** - Remove dead code, clean architecture
3. **SchemaAgent** - Fix database mismatches
4. **TestingAgent** - Add test coverage (currently <5%)

### Short Term (Month 1)
5. **AudioAgent** - Still relevant for upload optimization
6. **UIAgent** - Refactor MainDashboard (605 lines)
7. **CollabAgent** - Fix band creation/joining bugs
8. **DevOpsAgent** - Production deployment prep

### Not Needed Right Now
- ❌ MobileDevAgent (web app, not mobile)
- ❌ Framework selection (already using React/Vite)
- ❌ Database choice (already Supabase)
- ❌ Auth system design (already Clerk)

---

## 🎯 Recommended Orchestra Updates

### New Agent Lineup for CoreTet

1. **SecurityHardeningAgent**
   - Enable RLS with Clerk-compatible policies
   - Rotate exposed API keys
   - Fix UUID generation
   - Implement Edge Function usage
   - Security audit & fixes

2. **CodeCleanupAgent**
   - Remove Supabase Auth dead code (3,000 lines)
   - Delete unused components
   - Fix import statements
   - Archive old implementations
   - Clean up scripts folder

3. **SchemaIntegrityAgent**
   - Fix schema mismatches
   - Add missing columns (authorized_phone_1-4)
   - Regenerate TypeScript types
   - Verify foreign key constraints
   - Update database migrations

4. **TestCoverageAgent**
   - Add unit tests for components
   - Integration tests for auth flow
   - E2E tests for critical paths
   - Test Edge Functions
   - Achieve >70% coverage

5. **ArchitectureAgent** (Updated)
   - Knows about Clerk + Supabase stack
   - Understands Edge Functions role
   - Focuses on refactoring existing code
   - Optimizes current architecture

6. **AudioOptimizationAgent**
   - Optimize existing upload service
   - Fix race conditions in cleanup
   - Improve streaming performance
   - Waveform visualization

7. **UIRefactoringAgent**
   - Split MainDashboard (605 lines)
   - Extract inline styles
   - Add lazy loading
   - Implement error boundaries
   - Consistent loading states

8. **DeploymentAgent**
   - Production RLS policies
   - CI/CD pipeline
   - Environment configuration
   - Monitoring setup
   - Backup strategies

---

## 📊 Current Codebase State

### What Exists
```
/src
├── features (not organized by feature yet)
│   ├── App.tsx (Clerk auth, working)
│   ├── components/
│   │   ├── screens/ (8+ screens, some unused)
│   │   ├── molecules/ (AudioUploader, etc.)
│   ├── contexts/
│   │   ├── BandContext.tsx (band management)
│   │   ├── AuthContext.tsx (DEAD CODE - Supabase Auth)
│   ├── utils/
│   │   ├── clerkSupabaseSync.ts (working)
│   │   ├── supabaseAuthService.ts (DEAD CODE)
│   │   ├── audioUploadService.ts (working)
├── lib/
│   ├── supabase.ts (direct client, RLS disabled)
│   ├── clerk.ts
│   ├── database.types.ts (out of sync with schema)
/supabase/functions
├── create-profile/ (deployed but bypassed)
├── create-band/ (deployed but bypassed)
├── _shared/clerk.ts (JWT validation)
```

### Tech Stack (Actual)
- **Frontend:** React 18 + TypeScript + Vite
- **Auth:** Clerk (phone/SMS)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Edge Functions:** Deno (deployed but not in use)
- **Styling:** Inline styles (needs refactoring)
- **State:** React Context API

---

## 🔧 Updated Agent System Prompts

Each agent needs project context like this:

```python
PROJECT_CONTEXT = """
PROJECT: CoreTet Band Collaboration App
STATUS: Working prototype, security hardening phase
CODEBASE: ~13,605 lines React/TypeScript

TECH STACK (ALREADY CHOSEN):
- Frontend: React 18, TypeScript, Vite
- Auth: Clerk (phone/SMS) - WORKING
- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Edge Functions: Deno (deployed but bypassed)

CRITICAL ISSUES:
1. RLS disabled on all tables (security F)
2. 3,000 lines of dead Supabase Auth code
3. Edge Functions exist but unused
4. API keys exposed in .env.local
5. Weak UUID generation
6. Schema mismatches
7. <5% test coverage

IMMEDIATE PRIORITIES:
1. Security hardening (RLS, key rotation)
2. Dead code removal
3. Schema fixes
4. Test coverage

WHAT'S WORKING:
- Clerk authentication ✓
- Profile creation ✓
- Audio upload ✓
- Band context ✓
- Basic UI ✓

WHAT NEEDS WORK:
- Security (critical)
- Code cleanup (high)
- Testing (high)
- Performance (medium)
- Documentation (medium)
"""
```

---

## 📝 Action Items

### For You (User)
- [ ] Review this reality check
- [ ] Decide which agents to keep/modify/add
- [ ] Prioritize which problems to tackle first

### For Updated Orchestra
- [ ] Rewrite agent system prompts with CoreTet context
- [ ] Add SecurityHardeningAgent
- [ ] Add CodeCleanupAgent
- [ ] Add SchemaIntegrityAgent
- [ ] Remove/update mobile-specific agents
- [ ] Update examples to match actual use cases
- [ ] Create CoreTet-specific workflows

---

## 🎯 Example Updated Agent

**Before (Generic):**
```python
class SecurityPrivacyAgent:
    def get_system_prompt(self):
        return """You are a security specialist.

        Context: Music collaboration app needs authentication.

        Focus on:
        - Choosing auth system (OAuth, JWT, etc.)
        - Designing permission model
        - Planning encryption strategy
        """
```

**After (CoreTet-Specific):**
```python
class SecurityHardeningAgent:
    def get_system_prompt(self):
        return """You are a security hardening specialist for CoreTet.

        CURRENT STATE:
        - Clerk auth working but RLS disabled (CRITICAL)
        - API keys exposed in .env.local (CRITICAL)
        - Direct DB writes from client (HIGH RISK)
        - Edge Functions bypassed (SECURITY HOLE)
        - Weak UUID generation (DATA RISK)

        YOUR MISSION:
        1. Enable RLS with Clerk-compatible policies
        2. Rotate all exposed API keys
        3. Force Edge Function usage (no direct DB writes)
        4. Fix UUID generation algorithm
        5. Remove .env.local from repository
        6. Add input validation
        7. Implement rate limiting

        CONTEXT:
        - Using Clerk JWT tokens (not Supabase Auth)
        - Edge Functions use x-clerk-token custom header
        - Supabase validates Authorization header (conflict)
        - Need RLS policies that check Clerk user IDs
        """
```

---

## 💡 Bottom Line

The current orchestra is well-designed but **completely unaware** of:
1. Your actual tech stack (React web, not mobile)
2. Your current development stage (refactoring, not greenfield)
3. Your critical issues (security, dead code, schema problems)
4. Your immediate priorities (hardening, not designing)

**We need a CoreTet-specific orchestra that:**
- Knows the real codebase state
- Focuses on refactoring & security
- Understands Clerk + Supabase integration
- Prioritizes the 40-day cleanup roadmap
- Helps with actual problems, not hypothetical design decisions

---

**Next Steps:** Create updated `coretet_orchestrator.py` with reality-based agents.