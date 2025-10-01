#!/usr/bin/env python3
"""
CoreTet Orchestra - Interactive Mode
Run this to start working with your AI development team
"""
import sys
import os
from dotenv import load_dotenv
from pathlib import Path

# Get the directory of this file
SCRIPT_DIR = Path(__file__).parent.resolve()

# Load .env file from the orchestra directory explicitly
load_dotenv(SCRIPT_DIR / ".env")

# Ensure we can import from current directory
sys.path.insert(0, str(SCRIPT_DIR))

try:
    from coretet_orchestrator import CoreTetOrchestrator
    print("✅ Orchestra loaded successfully!")
except ImportError as e:
    print(f"❌ Error loading orchestra: {e}")
    print("\nMake sure you have:")
    print("1. pip install anthropic")
    print("2. export ANTHROPIC_API_KEY='your-key'")
    sys.exit(1)


def print_banner():
    print("\n" + "="*60)
    print("🎵 CoreTet Band - AI Orchestra")
    print("="*60)
    print("\nYour 8 specialized AI agents are ready:")
    print("  • SecurityHardeningAgent - Fix RLS, rotate keys")
    print("  • CodeCleanupAgent - Remove dead code")
    print("  • SchemaIntegrityAgent - Fix database issues")
    print("  • TestCoverageAgent - Add test coverage")
    print("  • ArchitectureRefactorAgent - Refactor code")
    print("  • AudioOptimizationAgent - Optimize uploads")
    print("  • UIRefactoringAgent - Split components")
    print("  • DeploymentReadinessAgent - Production prep")
    print("\n" + "="*60 + "\n")


def interactive_mode():
    """Run interactive Q&A session"""
    orch = CoreTetOrchestrator()

    print("Type your questions below. Commands:")
    print("  'priority' - What should I work on today?")
    print("  'security' - Show critical security issues")
    print("  'cleanup' - Show dead code to remove")
    print("  'quit' or 'exit' - End session")
    print("  'reset' - Clear conversation history")
    print()

    while True:
        try:
            user_input = input("\n🎵 Question: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye! Happy coding!")
                break

            if user_input.lower() == 'reset':
                orch.reset_all()
                print("✅ Conversation history cleared")
                continue

            # Handle shortcuts
            if user_input.lower() == 'priority':
                user_input = "What should I prioritize today based on the comprehensive review?"
            elif user_input.lower() == 'security':
                user_input = "List the critical security issues and how to fix them"
            elif user_input.lower() == 'cleanup':
                user_input = "What dead code can I safely delete?"

            # Process request
            response = orch.process_request(user_input, verbose=True)

            print("\n" + "="*60)
            print("📋 RESPONSE:")
            print("="*60)
            print(response)
            print()

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye! Happy coding!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Try rephrasing your question or type 'reset' to clear history")


def quick_questions():
    """Answer a few predefined questions"""
    orch = CoreTetOrchestrator()

    questions = [
        "What's the most critical issue I should fix first?",
        "What are the quick wins from the cleanup action plan?",
        "How do I enable RLS with Clerk authentication?"
    ]

    for i, question in enumerate(questions, 1):
        print(f"\n{'='*60}")
        print(f"Question {i}/{len(questions)}: {question}")
        print('='*60 + "\n")

        response = orch.process_request(question, verbose=False)
        print(response)
        print()

        if i < len(questions):
            input("\nPress Enter for next question...")


def main():
    print_banner()

    print("Choose mode:")
    print("1. Interactive Q&A (recommended)")
    print("2. Quick questions mode")
    print("3. Exit")

    choice = input("\nYour choice (1-3): ").strip()

    if choice == '1':
        interactive_mode()
    elif choice == '2':
        quick_questions()
    else:
        print("👋 Goodbye!")


if __name__ == "__main__":
    main()
