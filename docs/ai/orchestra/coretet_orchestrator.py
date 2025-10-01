"""
CoreTet Band App - Reality-Based Orchestrator Agent System

Specialized agents for refactoring, securing, and improving the existing CoreTet app.
Knows the actual codebase state, tech stack, and current priorities.
"""
from typing import Dict, List, Any, Optional
import sys
import os

# Add utils to path if running standalone
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from utils.claude_client import ClaudeClient
except ImportError:
    # Fallback for when utils module isn't available
    print("Warning: claude_client not found. Using placeholder.")
    class ClaudeClient:
        def __init__(self, api_key=None): pass
        def chat(self, *args, **kwargs): return ("Placeholder response", [])


class BaseAgent:
    """Base class for all agents"""
    def __init__(self, name: str, claude_client: ClaudeClient):
        self.name = name
        self.client = claude_client
        self.conversation_history: List[Dict[str, str]] = []

    def get_system_prompt(self) -> str:
        raise NotImplementedError

    def execute(self, task: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a task with optional context"""
        if context:
            task_with_context = f"{task}\n\nContext: {context}"
        else:
            task_with_context = task

        response, self.conversation_history = self.client.chat(
            user_message=task_with_context,
            conversation_history=self.conversation_history,
            system_prompt=self.get_system_prompt(),
            max_tokens=4000
        )

        return {
            "agent": self.name,
            "task": task,
            "result": response,
            "status": "success"
        }

    def reset(self):
        self.conversation_history = []


# ===== CORETET-SPECIFIC AGENTS =====

class SecurityHardeningAgent(BaseAgent):
    """
    Handles critical security fixes for CoreTet
    Expertise: RLS policies, Clerk auth, key rotation, Edge Functions
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("SecurityHardeningAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a security hardening specialist for the CoreTet Band app.

CRITICAL CURRENT STATE:
- RLS DISABLED on all tables (profiles, ensembles, versions, etc.)
- API keys exposed in .env.local file
- Direct database writes from client (bypassing security)
- Edge Functions deployed but NOT in use
- Weak UUID generation (32-bit hash, collision risk)
- No input validation
- No rate limiting

TECH STACK:
- Auth: Clerk (phone/SMS) with JWT tokens
- Database: Supabase PostgreSQL
- Edge Functions: Deno runtime
- Frontend: React/TypeScript (direct Supabase client)

KEY CHALLENGE:
- Clerk JWTs use RS256 signing
- Supabase expects JWTs signed with its key
- Edge Functions use custom header (x-clerk-token) to bypass Supabase JWT validation

YOUR MISSION:
1. Design RLS policies that work with Clerk user IDs
2. Force all writes through Edge Functions (no direct DB access)
3. Fix UUID generation (use SHA-256, not 32-bit hash)
4. Rotate exposed API keys (Clerk, Supabase, Gemini)
5. Remove .env.local from git repository
6. Add input validation on all user inputs
7. Implement rate limiting on Edge Functions

When providing solutions:
- Give specific SQL for RLS policies
- Provide exact code for fixes
- Include step-by-step instructions
- Explain security implications
- Reference the comprehensive review: docs/COMPREHENSIVE_REVIEW_2025-09-29.md"""


class CodeCleanupAgent(BaseAgent):
    """
    Handles removal of dead code and technical debt
    Expertise: Identifying unused code, safe refactoring
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("CodeCleanupAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a code cleanup specialist for the CoreTet Band app.

DEAD CODE IDENTIFIED (~3,000 lines):
- src/contexts/AuthContext.tsx (465 lines) - Supabase Auth, replaced by Clerk
- src/utils/supabaseAuthService.ts (500+ lines) - unused
- src/utils/authErrorHandler.ts - unused
- src/utils/userAccessService.ts - unused
- src/components/screens/EmailPasswordScreen.tsx - unused
- src/components/screens/ForgotPasswordScreen.tsx - unused
- src/components/screens/MagicLinkVerificationScreen.tsx - unused
- src/components/screens/PasswordResetScreen.tsx - unused
- src/components/screens/PhoneVerificationScreen.tsx - unused (different from Clerk's)
- src/App-original.tsx - old Supabase Auth version
- Multiple test scripts in /scripts (13 files)

TECH DEBT:
- MainDashboard.tsx is 605 lines (should be split)
- 100% inline styles (no CSS modules)
- No lazy loading for routes
- Duplicate App.tsx versions in archive/

YOUR MISSION:
1. Identify safe-to-delete files
2. Find unused imports and dependencies
3. Detect duplicate code
4. Recommend refactoring opportunities
5. Create cleanup scripts/commands
6. Archive old implementations properly

When providing cleanup:
- Give exact file paths to delete
- Explain why each file is safe to remove
- Provide git commands for removal
- Suggest archiving vs. deletion
- Check for hidden dependencies
- Verify no imports before deleting"""


class SchemaIntegrityAgent(BaseAgent):
    """
    Handles database schema mismatches and fixes
    Expertise: Supabase schema, TypeScript types, migrations
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("SchemaIntegrityAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a database schema specialist for CoreTet.

SCHEMA MISMATCHES IDENTIFIED:
1. Missing columns:
   - ensembles.authorized_phone_1 through authorized_phone_4 (used in code but not in original schema)
   - songs.ensemble_id (foreign key exists in SUPABASE_SETUP.md but not original schema.sql)

2. Type mismatches:
   - Application types (Band, Track, User) don't match database types (Ensemble, Version, Profile)
   - Manual mapping required everywhere (loses type safety)

3. Table name inconsistencies:
   - Code references playlist_versions
   - Schema defines playlist_items

FILES TO REVIEW:
- database/schema.sql (original schema)
- SUPABASE_SETUP.md (current schema with additions)
- lib/database.types.ts (TypeScript types)
- lib/supabase.ts (database helper methods)

YOUR MISSION:
1. Generate SQL migrations to add missing columns
2. Fix table name inconsistencies
3. Regenerate database.types.ts from actual schema
4. Align application types with database types
5. Add missing foreign keys
6. Create indexes for common queries
7. Verify all constraints

When providing fixes:
- Give exact SQL migration scripts
- Provide TypeScript type updates
- Include rollback scripts
- Explain impact on existing data
- Test queries before/after
- Update all relevant documentation"""


class TestCoverageAgent(BaseAgent):
    """
    Handles adding tests to the codebase
    Expertise: Vitest, React Testing Library, E2E testing
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("TestCoverageAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a testing specialist for CoreTet.

CURRENT STATE:
- Test coverage: <5%
- Only one test file exists: src/tests/design-consistency.test.tsx
- No component tests
- No integration tests
- No E2E tests
- No Edge Function tests

TECH STACK:
- Frontend: React 18 + TypeScript
- Testing framework: Need to set up (recommend Vitest)
- Auth: Clerk (requires mocking)
- Database: Supabase (requires mocking)

PRIORITY TEST COVERAGE:
1. CRITICAL:
   - Authentication flow (Clerk integration)
   - Profile creation/sync
   - Band creation/joining
   - Audio upload flow
   - Error boundaries

2. HIGH:
   - MainDashboard rendering
   - AudioUploader component
   - BandContext state management
   - Edge Function endpoints

3. MEDIUM:
   - Individual screen components
   - Utility functions
   - Type guards

YOUR MISSION:
1. Set up Vitest testing infrastructure
2. Create mock factories (Clerk, Supabase)
3. Write component tests for critical paths
4. Add integration tests for auth flow
5. Create E2E tests for main workflows
6. Test Edge Functions (Deno testing)
7. Achieve >70% code coverage

When providing tests:
- Include setup files (vitest.config.ts)
- Provide mock implementations
- Show example tests for each type
- Include CI/CD integration
- Explain mocking strategies
- Give coverage reporting setup"""


class ArchitectureRefactorAgent(BaseAgent):
    """
    Handles architectural improvements to existing codebase
    Expertise: React architecture, Edge Functions, Clerk + Supabase integration
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("ArchitectureRefactorAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are an architecture specialist for CoreTet.

CURRENT ARCHITECTURE:
- Frontend: React 18 + TypeScript + Vite
- Auth: Clerk (phone/SMS) → JWT tokens
- Database: Supabase PostgreSQL (direct client access - PROBLEM)
- Edge Functions: Deno functions (deployed but bypassed - PROBLEM)
- Storage: Supabase Storage

ARCHITECTURAL ISSUES:
1. Direct database writes from client (bypassing security)
2. Edge Functions exist but unused (authentication flow broken)
3. No separation of concerns (business logic in components)
4. MainDashboard is monolithic (605 lines)
5. No feature-based folder structure
6. Inline styles everywhere (no separation)

CORRECT FLOW (not implemented yet):
Client → Edge Function (validates Clerk JWT) → Supabase (with service role key)

CURRENT FLOW (insecure):
Client → Supabase (direct, no validation, RLS disabled)

YOUR MISSION:
1. Design proper client → Edge Function → Supabase flow
2. Refactor MainDashboard into feature components
3. Implement feature-based folder structure
4. Separate business logic from UI
5. Create proper abstraction layers
6. Design error handling strategy
7. Implement connection management

When providing refactoring:
- Show before/after architecture diagrams
- Provide step-by-step migration plan
- Include code examples
- Explain security improvements
- Consider backward compatibility
- Reference existing comprehensive review"""


class AudioOptimizationAgent(BaseAgent):
    """
    Handles audio-specific optimizations and improvements
    Expertise: Audio formats, upload optimization, streaming
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("AudioOptimizationAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are an audio engineering specialist for CoreTet.

CURRENT AUDIO IMPLEMENTATION:
- Upload: src/utils/audioUploadService.ts
- Component: src/components/molecules/AudioUploader.tsx
- Storage: Supabase Storage (audio-files bucket)
- Formats: Accepts various (WAV, MP3, etc.)

IDENTIFIED ISSUES:
1. Race condition in cleanup (if DB save fails, file may not delete)
2. No audio compression before upload
3. No format validation
4. No waveform generation
5. No streaming optimization
6. Large files (50MB+) from DAWs

TECH STACK:
- Frontend: React/TypeScript
- Storage: Supabase Storage
- Expected formats: 24-bit WAV from Logic/Ableton

YOUR MISSION:
1. Fix race condition in file cleanup
2. Add client-side audio compression
3. Implement format validation
4. Add waveform visualization
5. Optimize streaming for mobile networks
6. Handle large file uploads (chunking)
7. Add audio metadata extraction

When providing solutions:
- Give specific code fixes
- Recommend audio libraries (Web Audio API, etc.)
- Consider bandwidth constraints
- Balance quality vs. file size
- Include error handling
- Show progress indicators"""


class UIRefactoringAgent(BaseAgent):
    """
    Handles UI/UX improvements and component refactoring
    Expertise: React components, design systems, responsive design
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("UIRefactoringAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a UI/UX refactoring specialist for CoreTet.

CURRENT UI STATE:
- 100% inline styles (no CSS modules or styled-components)
- MainDashboard: 605 lines (should be split)
- No lazy loading (all screens load eagerly)
- No error boundaries (any error crashes app)
- Inconsistent loading states
- No accessibility features (ARIA labels missing)

TECH STACK:
- React 18 + TypeScript
- Inline styles everywhere
- Clerk UI components for auth
- Custom components for features

UI ISSUES:
1. MainDashboard renders 4 different screens inline (Playlists, Bands, Upload, Profile)
2. Styles recreated on every render (performance issue)
3. No component library or design system
4. No responsive breakpoints
5. No dark mode support

YOUR MISSION:
1. Split MainDashboard into separate view components
2. Extract inline styles to styled-components or CSS modules
3. Implement lazy loading with Suspense
4. Add error boundaries
5. Create consistent loading states (skeletons)
6. Add accessibility features
7. Implement responsive design

When providing refactoring:
- Show before/after component structure
- Provide migration strategy
- Include styled-components or CSS modules setup
- Give performance comparisons
- Ensure backward compatibility
- Include accessibility guidelines"""


class DeploymentReadinessAgent(BaseAgent):
    """
    Handles production deployment preparation
    Expertise: CI/CD, environment config, monitoring
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("DeploymentReadinessAgent", claude_client)

    def get_system_prompt(self) -> str:
        return """You are a deployment specialist for CoreTet.

CURRENT DEPLOYMENT STATE:
- Development only (npm run dev)
- No CI/CD pipeline
- Environment variables in .env.local (EXPOSED IN GIT)
- No production build tested
- No monitoring/logging
- No error tracking

TECH STACK:
- Frontend: Vite (React build)
- Backend: Supabase (managed)
- Edge Functions: Deno on Supabase
- Auth: Clerk (managed)

PRODUCTION REQUIREMENTS:
1. Rotate all exposed API keys
2. Set up proper environment variable management
3. Configure production RLS policies
4. Deploy Edge Functions with secrets
5. Set up monitoring (Sentry, Datadog, etc.)
6. Configure CDN for assets
7. Set up database backups
8. Implement rate limiting

YOUR MISSION:
1. Create production environment checklist
2. Design CI/CD pipeline (GitHub Actions recommended)
3. Configure environment variables properly
4. Set up error monitoring
5. Plan database backup strategy
6. Configure auto-scaling (if needed)
7. Create deployment documentation

When providing deployment plans:
- Include exact configuration files
- Provide step-by-step deployment guide
- Security checklist
- Rollback procedures
- Monitoring setup
- Cost optimization tips"""


# ===== CORETET ORCHESTRATOR =====

class CoreTetOrchestrator:
    """
    Orchestrator specialized for CoreTet Band app refactoring and hardening
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = ClaudeClient(api_key)

        # Initialize CoreTet-specific agents
        self.agents = {
            "security": SecurityHardeningAgent(self.client),
            "cleanup": CodeCleanupAgent(self.client),
            "schema": SchemaIntegrityAgent(self.client),
            "testing": TestCoverageAgent(self.client),
            "architecture": ArchitectureRefactorAgent(self.client),
            "audio": AudioOptimizationAgent(self.client),
            "ui": UIRefactoringAgent(self.client),
            "deployment": DeploymentReadinessAgent(self.client)
        }

        self.conversation_history: List[Dict[str, str]] = []
        self.task_log: List[Dict[str, Any]] = []
        self.project_context = self._get_project_context()

    def _get_project_context(self) -> str:
        """CoreTet-specific project context"""
        return """
PROJECT: CoreTet Band Collaboration App
STATUS: Working prototype in security hardening phase
CODEBASE: ~13,605 lines React/TypeScript

TECH STACK (ALREADY IMPLEMENTED):
- Frontend: React 18 + TypeScript + Vite
- Auth: Clerk (phone/SMS JWT) - WORKING
- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Edge Functions: Deno (deployed but bypassed)

WHAT'S WORKING:
✓ Clerk authentication (phone/SMS)
✓ Profile creation and sync
✓ Audio file upload
✓ Band creation/joining
✓ Basic UI and navigation

CRITICAL ISSUES (from comprehensive review):
1. RLS DISABLED on all tables (security F rating)
2. 3,000 lines of dead Supabase Auth code
3. API keys exposed in .env.local
4. Edge Functions bypassed (direct DB writes)
5. Weak UUID generation (collision risk)
6. Schema mismatches (missing columns)
7. Test coverage <5%
8. No error boundaries
9. MainDashboard 605 lines (needs splitting)
10. No production deployment plan

IMMEDIATE PRIORITIES:
1. Security hardening (Week 1)
2. Dead code removal (Week 1)
3. Schema fixes (Week 1-2)
4. Test coverage (Week 2-3)
5. Architecture refactoring (Month 2)
6. Production deployment (Month 2)

COMPREHENSIVE REVIEW: docs/COMPREHENSIVE_REVIEW_2025-09-29.md
CLEANUP PLAN: docs/CLEANUP_ACTION_PLAN.md
"""

    def get_orchestrator_prompt(self) -> str:
        return f"""You are the orchestrator for the CoreTet Band app refactoring team.

{self.project_context}

AVAILABLE AGENTS:
- security: Security hardening (RLS, keys, Edge Functions, auth)
- cleanup: Dead code removal, refactoring, tech debt
- schema: Database schema fixes, migrations, type sync
- testing: Test setup, coverage, mocking, E2E
- architecture: Refactoring, proper Edge Function usage, separation of concerns
- audio: Audio optimization, upload fixes, streaming
- ui: UI refactoring, component splitting, styling
- deployment: Production prep, CI/CD, monitoring

DELEGATION GUIDELINES:
1. Security issues → security
2. Dead code/cleanup → cleanup
3. Database problems → schema
4. Need tests → testing
5. Architecture questions → architecture
6. Audio/upload issues → audio
7. UI/component problems → ui
8. Production/deployment → deployment

CRITICAL: This is NOT a greenfield project. Focus on:
- Fixing existing code, not designing from scratch
- Security hardening, not designing auth
- Refactoring, not building features
- Testing existing flows, not planning new ones

For user requests, analyze:
1. What existing code needs fixing?
2. Which agents have relevant expertise?
3. What's the priority level?
4. Dependencies between fixes?

Respond with JSON:
{{
  "analysis": "Understanding of the issue/request",
  "priority": "critical/high/medium/low",
  "plan": [
    {{
      "agent": "agent_name",
      "task": "specific task for existing codebase",
      "order": 1,
      "depends_on": []
    }}
  ]
}}

For simple questions, respond directly."""

    def analyze_request(self, user_request: str) -> Dict[str, Any]:
        """Analyze request and create execution plan"""
        analysis_prompt = f"""Analyze this request for CoreTet:

User Request: {user_request}

Context: Working app with security issues and tech debt (see project context)

Which agents should handle this? Consider:
- Is this about fixing existing code or adding new features?
- What's the security impact?
- Is there dead code involved?
- Does it need testing?

Provide analysis and plan in JSON format."""

        response, self.conversation_history = self.client.chat(
            user_message=analysis_prompt,
            conversation_history=self.conversation_history,
            system_prompt=self.get_orchestrator_prompt()
        )

        # Parse JSON response
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response

            import json
            plan = json.loads(json_str)
            return plan
        except:
            return {
                "analysis": "Simple request",
                "priority": "medium",
                "plan": [],
                "direct_response": response
            }

    def execute_plan(self, plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute the delegation plan"""
        if "direct_response" in plan:
            return [{
                "agent": "orchestrator",
                "result": plan["direct_response"],
                "status": "success"
            }]

        results = []
        tasks = sorted(plan.get("plan", []), key=lambda x: x.get("order", 0))

        accumulated_context = {"project": self.project_context}

        for task_info in tasks:
            agent_name = task_info.get("agent")
            task_description = task_info.get("task")
            depends_on = task_info.get("depends_on", [])

            if agent_name not in self.agents:
                results.append({
                    "agent": agent_name,
                    "task": task_description,
                    "result": f"Error: Unknown agent '{agent_name}'",
                    "status": "error"
                })
                continue

            task_context = accumulated_context.copy()
            if depends_on:
                task_context["previous_results"] = {
                    dep: next((r["result"] for r in results if r["agent"] == dep), None)
                    for dep in depends_on
                }

            agent = self.agents[agent_name]
            result = agent.execute(task_description, context=task_context)
            results.append(result)

            accumulated_context[agent_name] = result["result"]

            self.task_log.append({
                "agent": agent_name,
                "task": task_description,
                "status": result["status"]
            })

        return results

    def synthesize_results(self, plan: Dict[str, Any], results: List[Dict[str, Any]]) -> str:
        """Synthesize results into coherent response"""
        if len(results) == 1 and results[0]["agent"] == "orchestrator":
            return results[0]["result"]

        synthesis_prompt = f"""Synthesize these agent results for CoreTet:

Request Analysis: {plan.get('analysis', 'N/A')}
Priority: {plan.get('priority', 'N/A')}

Agent Results:
"""
        for result in results:
            synthesis_prompt += f"\n=== {result['agent'].upper()} ===\n{result['result']}\n"

        synthesis_prompt += """
Provide a clear, actionable response that:
1. Directly addresses the CoreTet-specific issue
2. Integrates insights from all agents
3. References actual files/code in the codebase
4. Gives concrete next steps
5. Notes any security or priority concerns
"""

        response, _ = self.client.chat(
            user_message=synthesis_prompt,
            conversation_history=[],
            system_prompt="You are synthesizing technical recommendations for CoreTet Band app refactoring. Give specific, actionable guidance."
        )

        return response

    def process_request(self, user_request: str, verbose: bool = True) -> str:
        """Main method to process requests"""
        if verbose:
            print(f"\n🎵 CoreTet Processing: {user_request}\n")

        if verbose:
            print("📋 Analyzing request...")
        plan = self.analyze_request(user_request)

        if verbose:
            priority = plan.get('priority', 'medium')
            priority_emoji = {"critical": "🚨", "high": "⚠️", "medium": "📌", "low": "📝"}
            print(f"{priority_emoji.get(priority, '📋')} Priority: {priority.upper()}")
            print(f"Analysis: {plan.get('analysis', 'Direct response')}")
            if plan.get('plan'):
                print(f"📊 Delegating to {len(plan['plan'])} agent(s)\n")

        results = self.execute_plan(plan)

        if verbose:
            print("✨ Synthesizing results...\n")
        final_response = self.synthesize_results(plan, results)

        return final_response

    def reset_all(self):
        """Reset all agents"""
        self.conversation_history = []
        self.task_log = []
        for agent in self.agents.values():
            agent.reset()

    def get_task_log(self) -> List[Dict[str, Any]]:
        """Get execution log"""
        return self.task_log


if __name__ == "__main__":
    print("CoreTet Orchestrator initialized!")
    print("\nAvailable agents:")
    orchestrator = CoreTetOrchestrator()
    for name, agent in orchestrator.agents.items():
        print(f"  - {name}: {agent.__class__.__name__}")

    print("\n" + "="*60)
    print("Example usage:")
    print("="*60)

    # Example
    request = "I need to fix the security issues. Where should I start?"
    response = orchestrator.process_request(request)
    print("\nRESPONSE:")
    print(response)
