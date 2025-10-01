#!/usr/bin/env python3
"""
CoreTet Agentic Orchestra - AI agents that can actually execute tasks

This is the upgraded version where agents can:
- Read and write files
- Edit code
- Run commands
- Search the codebase
- Make actual changes (with safety rails)
"""
import sys
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.claude_client import ClaudeClient
from utils.agentic_executor import AgenticOrchestrator


class CoreTetAgenticOrchestra:
    """
    AI Orchestra with execution capabilities for CoreTet Band
    """

    def __init__(self, api_key: Optional[str] = None, project_root: str = None):
        """
        Initialize the orchestra with agentic capabilities

        Args:
            api_key: Anthropic API key (or uses ANTHROPIC_API_KEY env var)
            project_root: Root directory of CoreTet project
        """
        self.client = ClaudeClient(api_key)

        # Auto-detect project root
        if project_root is None:
            current = os.path.dirname(os.path.abspath(__file__))
            # Go up from docs/ai/orchestra to project root
            self.project_root = os.path.abspath(
                os.path.join(current, "..", "..", "..")
            )
        else:
            self.project_root = project_root

        # Define agent configurations with their expertise
        self.agent_configs = {
            "security": {
                "name": "SecurityHardeningAgent",
                "system_prompt": """You are a security expert focused on CoreTet Band's security issues.

**Known Issues:**
- RLS (Row Level Security) is DISABLED on all Supabase tables
- API keys were exposed in .env.local (now fixed but need rotation)
- Weak UUID generation using 32-bit hash (collision risk)
- Direct database writes from client (bypassing security)
- No JWT validation between Clerk and Supabase

**Your Expertise:**
- Enabling RLS with Clerk-compatible policies
- Rotating API keys and secrets
- Implementing proper JWT validation
- Fixing UUID generation
- Adding security middleware

**Project Context:**
- Frontend: React 18 + TypeScript + Vite
- Auth: Clerk (phone/SMS)
- Database: Supabase PostgreSQL
- Tables: profiles, bands, band_members, band_invitations, audio_files

When given a security task, break it down into steps and use your tools to make the actual changes."""
            },

            "cleanup": {
                "name": "CodeCleanupAgent",
                "system_prompt": """You are a code cleanup expert for CoreTet Band.

**Known Issues:**
- 3,000+ lines of dead Supabase Auth code (replaced by Clerk)
- Unused components and imports
- Commented-out code blocks
- Duplicate code patterns
- Unused dependencies

**Files with Dead Code:**
- src/utils/supabaseAuthService.ts (entire file unused)
- src/contexts/AuthContext.tsx (Supabase code still present)
- src/components/screens/* (old auth screens)

**Your Expertise:**
- Identifying dead code safely
- Removing unused imports and functions
- Consolidating duplicate code
- Cleaning up commented code
- Updating dependencies

When given a cleanup task, use tools to find and remove dead code safely."""
            },

            "schema": {
                "name": "SchemaIntegrityAgent",
                "system_prompt": """You are a database schema expert for CoreTet Band.

**Current Schema Issues:**
- Foreign key constraint removed from profiles.user_id
- RLS disabled on all tables
- No indexes on frequently queried columns
- Missing cascade deletes
- UUID generation issues

**Tables:**
- profiles (user_id, full_name, phone_number, created_at)
- bands (id, name, created_by, created_at)
- band_members (id, band_id, user_id, role, joined_at)
- band_invitations (id, band_id, invited_by, phone_number, status)
- audio_files (id, band_id, uploaded_by, file_path, created_at)

**Your Expertise:**
- Designing proper RLS policies
- Adding appropriate indexes
- Fixing foreign key constraints
- Creating migration scripts
- Optimizing queries

When given a schema task, create the necessary SQL and migration files."""
            },

            "architecture": {
                "name": "ArchitectureRefactorAgent",
                "system_prompt": """You are an architecture expert for CoreTet Band.

**Current Architecture Issues:**
- Edge Functions deployed but bypassed (JWT validation conflict)
- Client-side database writes (no server-side validation)
- Monolithic components (500+ line files)
- Mixed concerns (auth + business logic)
- No API layer between frontend and Supabase

**Architecture:**
- Frontend: React 18 + Vite
- Auth: Clerk (JWT tokens)
- Backend: Supabase (PostgreSQL + Edge Functions)
- Storage: Supabase Storage

**Your Expertise:**
- Designing proper API layers
- Splitting large components
- Separating concerns
- Implementing proper data flow
- Creating reusable patterns

When given an architecture task, refactor code to follow best practices."""
            },

            "audio": {
                "name": "AudioOptimizationAgent",
                "system_prompt": """You are an audio upload expert for CoreTet Band.

**Current Audio System:**
- Uses Supabase Storage
- Simple upload flow (no chunking)
- Basic metadata tracking
- No file validation
- No storage policies (RLS disabled)

**Files:**
- src/utils/audioUploadService.ts
- src/components/molecules/AudioUploader.tsx

**Your Expertise:**
- Implementing chunked uploads for large files
- Adding file validation (format, size, duration)
- Creating storage policies
- Optimizing metadata
- Adding progress tracking

When given an audio task, improve the upload system."""
            },

            "ui": {
                "name": "UIRefactoringAgent",
                "system_prompt": """You are a UI/UX expert for CoreTet Band.

**Current UI Issues:**
- Large monolithic components (500+ lines)
- Inconsistent error handling
- No loading states in some places
- Mixed Tailwind patterns
- Hardcoded strings (no i18n)

**Components:**
- src/components/screens/* (main screens)
- src/components/molecules/* (smaller components)
- src/App.tsx (routing)

**Your Expertise:**
- Splitting large components
- Adding consistent error/loading states
- Improving accessibility
- Creating reusable UI patterns
- Implementing responsive design

When given a UI task, refactor components for better UX."""
            },

            "testing": {
                "name": "TestCoverageAgent",
                "system_prompt": """You are a testing expert for CoreTet Band.

**Current Testing:**
- No unit tests
- No integration tests
- No E2E tests
- Test infrastructure not set up

**What Needs Testing:**
- Authentication flows
- Band creation/management
- Audio uploads
- Database operations
- Edge Functions (when re-enabled)

**Your Expertise:**
- Setting up Vitest for React
- Writing component tests
- Creating integration tests
- Mocking Supabase/Clerk
- Testing Edge Functions

When given a testing task, add comprehensive test coverage."""
            },

            "deployment": {
                "name": "DeploymentReadinessAgent",
                "system_prompt": """You are a deployment expert for CoreTet Band.

**Current Deployment:**
- Local dev only (npm run dev)
- No production build tested
- No CI/CD pipeline
- No environment management
- No monitoring/logging

**Your Expertise:**
- Setting up production builds
- Creating CI/CD workflows
- Environment configuration
- Deployment to Vercel/Netlify
- Adding error monitoring

When given a deployment task, prepare the app for production."""
            }
        }

        # Initialize orchestrator
        self.orchestrator = AgenticOrchestrator(
            agents=self.agent_configs,
            claude_client=self.client,
            project_root=self.project_root
        )

    def execute(self, task: str, agent: str = None, auto_execute: bool = False) -> Dict[str, Any]:
        """
        Execute a task with an agent

        Args:
            task: Task description
            agent: Specific agent to use (or None to auto-select)
            auto_execute: If True, execute immediately without previews

        Returns:
            Dict with execution results
        """
        return self.orchestrator.execute_task(
            task=task,
            agent_name=agent,
            auto_execute=auto_execute
        )

    def preview(self, task: str, agent: str = None) -> Dict[str, Any]:
        """
        Preview what an agent would do for a task

        Args:
            task: Task description
            agent: Specific agent to use (or None to auto-select)

        Returns:
            Dict with planned actions
        """
        return self.orchestrator.preview_task(task=task, agent_name=agent)

    def list_agents(self) -> Dict[str, str]:
        """Get list of available agents and their specialties"""
        return {
            name: config["system_prompt"].split("\n\n")[0]
            for name, config in self.agent_configs.items()
        }


def main():
    """Interactive mode for agentic orchestra"""
    print("\n" + "="*70)
    print("🎵 CoreTet Agentic Orchestra")
    print("="*70)
    print("\nYour AI agents can now EXECUTE tasks, not just advise!")
    print("\nAvailable agents:")
    print("  • security    - Fix RLS, rotate keys, add JWT validation")
    print("  • cleanup     - Remove dead code and unused imports")
    print("  • schema      - Fix database schema and migrations")
    print("  • architecture - Refactor code structure")
    print("  • audio       - Optimize audio upload system")
    print("  • ui          - Refactor UI components")
    print("  • testing     - Add test coverage")
    print("  • deployment  - Prepare for production")
    print("\n" + "="*70 + "\n")

    orchestra = CoreTetAgenticOrchestra()

    print("Commands:")
    print("  preview <task>  - See what agent would do")
    print("  execute <task>  - Execute task with safety previews")
    print("  auto <task>     - Execute task immediately")
    print("  agents          - List available agents")
    print("  quit            - Exit")
    print()

    while True:
        try:
            user_input = input("\n🎵 Command: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break

            if user_input.lower() == 'agents':
                agents = orchestra.list_agents()
                for name, desc in agents.items():
                    print(f"\n{name}:")
                    print(f"  {desc}")
                continue

            # Parse command
            parts = user_input.split(None, 1)
            if len(parts) < 2:
                print("Usage: preview|execute|auto <task description>")
                continue

            command, task = parts

            if command == "preview":
                print("\n📋 Generating preview...\n")
                result = orchestra.preview(task)
                print(f"Agent selected: {result.get('agent', 'unknown')}")
                print(f"\nPlan:\n{result.get('plan', 'No plan available')}")

            elif command == "execute":
                print("\n⚙️  Executing with safety previews...\n")
                result = orchestra.execute(task, auto_execute=False)
                print(f"Agent: {result.get('agent', 'unknown')}")
                print(f"Status: {result.get('status', 'unknown')}")
                print(f"Iterations: {result.get('iterations', 0)}")
                print(f"\nChanges:\n{result.get('changes_summary', 'No changes')}")

            elif command == "auto":
                confirm = input("⚠️  Auto-execute will make changes immediately. Continue? (yes/no): ")
                if confirm.lower() != 'yes':
                    print("Cancelled.")
                    continue

                print("\n🚀 Executing task...\n")
                result = orchestra.execute(task, auto_execute=True)
                print(f"Agent: {result.get('agent', 'unknown')}")
                print(f"Status: {result.get('status', 'unknown')}")
                print(f"Iterations: {result.get('iterations', 0)}")
                print(f"\nChanges:\n{result.get('changes_summary', 'No changes')}")

            else:
                print(f"Unknown command: {command}")
                print("Use: preview, execute, or auto")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    main()
