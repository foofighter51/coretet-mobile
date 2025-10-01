#!/bin/bash
# Launch the Agentic Orchestra (agents that can execute tasks)

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Unset any existing ANTHROPIC_API_KEY from shell to force using .env file
unset ANTHROPIC_API_KEY

# Activate virtual environment
source venv/bin/activate

# Run agentic orchestra
python3 agentic_orchestrator.py
