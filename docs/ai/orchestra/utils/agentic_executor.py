"""
Agentic Executor - Enables agents to execute tasks with safety rails
"""
import json
from typing import Dict, List, Optional, Any
from .agent_tools import AgentToolkit
from .claude_client import ClaudeClient


class AgenticExecutor:
    """
    Wraps an agent with tool execution capabilities and safety rails
    """

    def __init__(self, agent_name: str, agent_system_prompt: str,
                 claude_client: ClaudeClient, project_root: str = None):
        """
        Args:
            agent_name: Name of the agent (e.g., "SecurityHardeningAgent")
            agent_system_prompt: System prompt defining agent's role and expertise
            claude_client: Claude API client
            project_root: Project root directory
        """
        self.agent_name = agent_name
        self.agent_system_prompt = agent_system_prompt
        self.client = claude_client
        self.toolkit = AgentToolkit(project_root)
        self.conversation_history = []
        self.execution_mode = "preview"  # "preview" or "execute"

    def execute_task(self, task_description: str, auto_execute: bool = False,
                    max_iterations: int = 10) -> Dict:
        """
        Execute a task using the agent

        Args:
            task_description: What the agent should do
            auto_execute: If True, automatically execute without previews
            max_iterations: Maximum planning/execution loops

        Returns:
            Dict with task results, changes made, and status
        """
        self.execution_mode = "execute" if auto_execute else "preview"

        # Build initial prompt with tool documentation
        initial_prompt = self._build_task_prompt(task_description)

        # Execute task with iterative loop
        iteration = 0
        task_complete = False
        all_actions = []

        while iteration < max_iterations and not task_complete:
            iteration += 1

            # Get agent's response
            response, self.conversation_history = self.client.chat(
                user_message=initial_prompt if iteration == 1 else "Continue with next step",
                conversation_history=self.conversation_history,
                system_prompt=self.agent_system_prompt,
                max_tokens=4000
            )

            # Parse response for tool calls
            actions = self._parse_tool_calls(response)

            if not actions:
                # Agent is done or just providing analysis
                task_complete = True
                break

            # Execute actions
            action_results = []
            for action in actions:
                result = self._execute_action(action)
                action_results.append(result)
                all_actions.append({
                    "action": action,
                    "result": result
                })

            # Feed results back to agent
            feedback = self._format_action_feedback(action_results)
            initial_prompt = feedback

        # Compile final results
        return {
            "status": "completed" if task_complete else "max_iterations_reached",
            "iterations": iteration,
            "actions_taken": all_actions,
            "changes_summary": self.toolkit.get_changes_summary(),
            "mode": self.execution_mode
        }

    def preview_task(self, task_description: str) -> Dict:
        """
        Preview what the agent would do without executing

        Returns:
            Dict with planned actions
        """
        prompt = f"""
{task_description}

Please provide a step-by-step plan of what you would do to complete this task.
List the specific files you would read, edit, or create, and what changes you would make.
Do NOT use tool syntax - just describe your plan in plain English.
"""

        response, _ = self.client.chat(
            user_message=prompt,
            system_prompt=self.agent_system_prompt,
            max_tokens=4000
        )

        return {
            "status": "preview",
            "plan": response
        }

    def _build_task_prompt(self, task_description: str) -> str:
        """Build the initial task prompt with tool documentation"""
        return f"""
{task_description}

You have access to the following tools to complete this task:

## read_file(file_path, offset=0, limit=None)
Read contents of a file with line numbers.
Example: read_file("src/App.tsx")

## write_file(file_path, content)
Create or overwrite a file.
Example: write_file("src/NewComponent.tsx", "import React...")

## edit_file(file_path, old_string, new_string, replace_all=False)
Replace text in a file.
Example: edit_file("src/App.tsx", "const foo = 1", "const foo = 2")

## glob(pattern, path=None)
Find files matching a pattern.
Example: glob("**/*.tsx")

## grep(pattern, path=None, file_pattern=None)
Search for text in files.
Example: grep("TODO", file_pattern="**/*.ts")

## bash(command)
Run a shell command.
Example: bash("npm test")

To use a tool, respond with JSON in this format:
```json
{{
  "tool": "read_file",
  "args": {{
    "file_path": "src/App.tsx"
  }},
  "reasoning": "I need to see the current structure before making changes"
}}
```

You can provide multiple tool calls in sequence. After I execute them, I'll give you the results.

Current mode: {self.execution_mode}
{"Actions will be executed immediately." if self.execution_mode == "execute" else "Actions will be previewed only."}

Please start by analyzing what needs to be done, then use the tools to complete the task.
"""

    def _parse_tool_calls(self, response: str) -> List[Dict]:
        """Extract tool calls from agent response"""
        actions = []

        # Look for JSON blocks
        import re
        json_pattern = r'```json\s*(\{.*?\})\s*```'
        matches = re.finditer(json_pattern, response, re.DOTALL)

        for match in matches:
            try:
                action = json.loads(match.group(1))
                if "tool" in action and "args" in action:
                    actions.append(action)
            except json.JSONDecodeError:
                continue

        return actions

    def _execute_action(self, action: Dict) -> Dict:
        """Execute a single tool action"""
        tool_name = action["tool"]
        args = action["args"]

        # Add preview flag if in preview mode
        if self.execution_mode == "preview" and tool_name in ["write_file", "edit_file", "bash"]:
            args["preview"] = True

        try:
            if tool_name == "read_file":
                result = self.toolkit.read_file(**args)
                return {"status": "success", "output": result}

            elif tool_name == "write_file":
                result = self.toolkit.write_file(**args)
                return result

            elif tool_name == "edit_file":
                result = self.toolkit.edit_file(**args)
                return result

            elif tool_name == "glob":
                result = self.toolkit.glob(**args)
                return {"status": "success", "files": result}

            elif tool_name == "grep":
                result = self.toolkit.grep(**args)
                return {"status": "success", "matches": result}

            elif tool_name == "bash":
                result = self.toolkit.bash(**args)
                return result

            else:
                return {"status": "error", "message": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"status": "error", "message": f"Tool execution error: {e}"}

    def _format_action_feedback(self, action_results: List[Dict]) -> str:
        """Format action results as feedback for the agent"""
        feedback = ["Here are the results of your actions:\n"]

        for i, result in enumerate(action_results, 1):
            feedback.append(f"Action {i}:")
            feedback.append(f"  Status: {result.get('status', 'unknown')}")

            if result.get("status") == "success":
                if "output" in result:
                    output = result["output"]
                    if len(output) > 500:
                        feedback.append(f"  Output: {output[:500]}... (truncated)")
                    else:
                        feedback.append(f"  Output: {output}")
                elif "files" in result:
                    feedback.append(f"  Found {len(result['files'])} files")
                elif "matches" in result:
                    feedback.append(f"  Found matches in {len(result['matches'])} files")

            if result.get("status") == "preview":
                feedback.append(f"  Preview: {result.get('message', 'No preview')}")

            if result.get("status") == "error":
                feedback.append(f"  Error: {result.get('message', 'Unknown error')}")

            feedback.append("")

        feedback.append("What should we do next? If the task is complete, just say 'TASK_COMPLETE'.")

        return "\n".join(feedback)

    def reset(self):
        """Reset conversation history and changes"""
        self.conversation_history = []
        self.toolkit.clear_changes()


class AgenticOrchestrator:
    """
    Manages multiple agentic agents and coordinates their work
    """

    def __init__(self, agents: Dict[str, Any], claude_client: ClaudeClient,
                 project_root: str = None):
        """
        Args:
            agents: Dict of agent_name -> agent_config
            claude_client: Claude API client
            project_root: Project root directory
        """
        self.agents = agents
        self.client = claude_client
        self.project_root = project_root
        self.executors = {}

        # Create executor for each agent
        for name, config in agents.items():
            self.executors[name] = AgenticExecutor(
                agent_name=name,
                agent_system_prompt=config.get("system_prompt", ""),
                claude_client=claude_client,
                project_root=project_root
            )

    def execute_task(self, task: str, agent_name: str = None,
                    auto_execute: bool = False) -> Dict:
        """
        Execute a task with a specific agent or auto-select the best agent

        Args:
            task: Task description
            agent_name: Specific agent to use (or None to auto-select)
            auto_execute: If True, execute without previews

        Returns:
            Dict with execution results
        """
        # Auto-select agent if not specified
        if agent_name is None:
            agent_name = self._select_agent(task)

        if agent_name not in self.executors:
            return {
                "status": "error",
                "message": f"Unknown agent: {agent_name}. Available: {list(self.executors.keys())}"
            }

        executor = self.executors[agent_name]

        # Execute task
        result = executor.execute_task(task, auto_execute=auto_execute)
        result["agent"] = agent_name

        return result

    def preview_task(self, task: str, agent_name: str = None) -> Dict:
        """Preview what an agent would do for a task"""
        if agent_name is None:
            agent_name = self._select_agent(task)

        if agent_name not in self.executors:
            return {
                "status": "error",
                "message": f"Unknown agent: {agent_name}"
            }

        executor = self.executors[agent_name]
        result = executor.preview_task(task)
        result["agent"] = agent_name

        return result

    def _select_agent(self, task: str) -> str:
        """Auto-select the best agent for a task based on keywords"""
        task_lower = task.lower()

        # Simple keyword matching
        if any(word in task_lower for word in ["security", "rls", "auth", "key", "jwt"]):
            return "security"
        elif any(word in task_lower for word in ["dead code", "cleanup", "remove", "delete"]):
            return "cleanup"
        elif any(word in task_lower for word in ["schema", "database", "table", "migration"]):
            return "schema"
        elif any(word in task_lower for word in ["test", "testing", "coverage"]):
            return "testing"
        elif any(word in task_lower for word in ["refactor", "architecture", "structure"]):
            return "architecture"
        elif any(word in task_lower for word in ["audio", "upload", "file", "storage"]):
            return "audio"
        elif any(word in task_lower for word in ["ui", "component", "screen", "interface"]):
            return "ui"
        elif any(word in task_lower for word in ["deploy", "production", "build"]):
            return "deployment"

        # Default to architecture agent for general tasks
        return "architecture"
