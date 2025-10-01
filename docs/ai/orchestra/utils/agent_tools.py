"""
Agent Tools - Give Orchestra agents the ability to execute actions
"""
import os
import subprocess
import glob as glob_module
import re
from typing import List, Dict, Tuple, Optional
from pathlib import Path


class AgentToolkit:
    """Provides file and command execution tools to agents"""

    def __init__(self, project_root: str = None):
        """
        Args:
            project_root: Root directory of the project (defaults to coretet-band)
        """
        if project_root is None:
            # Auto-detect project root (go up from orchestra directory)
            current = Path(__file__).resolve().parent.parent.parent.parent
            self.project_root = str(current)
        else:
            self.project_root = project_root

        self.changes_made = []  # Track all changes for review

    def read_file(self, file_path: str, offset: int = 0, limit: int = None) -> str:
        """
        Read a file from the project

        Args:
            file_path: Relative or absolute path to file
            offset: Line number to start reading from (0-indexed)
            limit: Maximum number of lines to read

        Returns:
            File contents with line numbers
        """
        full_path = self._resolve_path(file_path)

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            if offset > 0:
                lines = lines[offset:]
            if limit:
                lines = lines[:limit]

            # Format with line numbers (starting from offset + 1)
            numbered = []
            for i, line in enumerate(lines, start=offset + 1):
                numbered.append(f"{i:6d}\t{line.rstrip()}")

            return "\n".join(numbered)

        except FileNotFoundError:
            return f"Error: File not found: {file_path}"
        except Exception as e:
            return f"Error reading file: {e}"

    def write_file(self, file_path: str, content: str, preview: bool = True) -> Dict:
        """
        Write content to a file (creates or overwrites)

        Args:
            file_path: Relative or absolute path to file
            content: Content to write
            preview: If True, return preview instead of writing

        Returns:
            Dict with status, message, and preview
        """
        full_path = self._resolve_path(file_path)

        result = {
            "action": "write",
            "file": file_path,
            "exists": os.path.exists(full_path),
            "preview": content[:500] + ("..." if len(content) > 500 else ""),
            "full_content": content,
            "lines": len(content.split('\n'))
        }

        if preview:
            result["status"] = "preview"
            result["message"] = "Preview only - call with preview=False to execute"
            return result

        try:
            # Create parent directory if needed
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            result["status"] = "success"
            result["message"] = f"File written: {file_path}"
            self.changes_made.append(result)
            return result

        except Exception as e:
            result["status"] = "error"
            result["message"] = f"Error writing file: {e}"
            return result

    def edit_file(self, file_path: str, old_string: str, new_string: str,
                  replace_all: bool = False, preview: bool = True) -> Dict:
        """
        Edit a file by replacing text

        Args:
            file_path: Relative or absolute path to file
            old_string: Text to find and replace
            new_string: Replacement text
            replace_all: If True, replace all occurrences; if False, must be unique
            preview: If True, return preview instead of writing

        Returns:
            Dict with status, message, and preview
        """
        full_path = self._resolve_path(file_path)

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check if old_string exists
            count = content.count(old_string)
            if count == 0:
                return {
                    "action": "edit",
                    "file": file_path,
                    "status": "error",
                    "message": f"String not found in file: {old_string[:100]}"
                }

            if count > 1 and not replace_all:
                return {
                    "action": "edit",
                    "file": file_path,
                    "status": "error",
                    "message": f"String appears {count} times - must be unique or use replace_all=True"
                }

            # Perform replacement
            if replace_all:
                new_content = content.replace(old_string, new_string)
            else:
                new_content = content.replace(old_string, new_string, 1)

            result = {
                "action": "edit",
                "file": file_path,
                "old_string": old_string[:200],
                "new_string": new_string[:200],
                "occurrences": count,
                "replaced": count if replace_all else 1
            }

            if preview:
                # Show context around the change
                result["status"] = "preview"
                result["message"] = "Preview only - call with preview=False to execute"
                result["preview"] = self._get_diff_preview(content, new_content)
                return result

            # Write changes
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            result["status"] = "success"
            result["message"] = f"File edited: {file_path}"
            self.changes_made.append(result)
            return result

        except Exception as e:
            return {
                "action": "edit",
                "file": file_path,
                "status": "error",
                "message": f"Error editing file: {e}"
            }

    def glob(self, pattern: str, path: str = None) -> List[str]:
        """
        Find files matching a glob pattern

        Args:
            pattern: Glob pattern (e.g., "**/*.ts", "src/**/*.tsx")
            path: Directory to search in (defaults to project root)

        Returns:
            List of matching file paths (relative to project root)
        """
        search_path = self._resolve_path(path) if path else self.project_root

        # Use pathlib for recursive globbing
        search_dir = Path(search_path)
        matches = []

        for match in search_dir.glob(pattern):
            if match.is_file():
                # Return relative to project root
                rel_path = match.relative_to(self.project_root)
                matches.append(str(rel_path))

        # Sort by modification time (most recent first)
        matches.sort(key=lambda p: os.path.getmtime(
            os.path.join(self.project_root, p)
        ), reverse=True)

        return matches

    def grep(self, pattern: str, path: str = None, file_pattern: str = None,
             case_insensitive: bool = False, context: int = 0) -> Dict:
        """
        Search for pattern in files

        Args:
            pattern: Regex pattern to search for
            path: Directory or file to search (defaults to project root)
            file_pattern: Glob pattern to filter files (e.g., "*.ts")
            case_insensitive: Case-insensitive search
            context: Number of lines of context to show

        Returns:
            Dict with matches grouped by file
        """
        search_path = self._resolve_path(path) if path else self.project_root

        # Compile regex
        flags = re.IGNORECASE if case_insensitive else 0
        try:
            regex = re.compile(pattern, flags)
        except re.error as e:
            return {"error": f"Invalid regex pattern: {e}"}

        # Get list of files to search
        if os.path.isfile(search_path):
            files = [search_path]
        else:
            if file_pattern:
                files = [os.path.join(self.project_root, f)
                        for f in self.glob(file_pattern, search_path)]
            else:
                # Search all text files
                files = []
                for root, dirs, filenames in os.walk(search_path):
                    # Skip common directories
                    dirs[:] = [d for d in dirs if d not in
                              {'.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build'}]
                    for filename in filenames:
                        if not filename.endswith(('.pyc', '.png', '.jpg', '.gif', '.pdf')):
                            files.append(os.path.join(root, filename))

        # Search files
        results = {}
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                matches = []
                for i, line in enumerate(lines, start=1):
                    if regex.search(line):
                        match_data = {
                            "line": i,
                            "content": line.rstrip()
                        }

                        # Add context if requested
                        if context > 0:
                            start = max(0, i - context - 1)
                            end = min(len(lines), i + context)
                            match_data["context"] = [
                                f"{j+1}: {lines[j].rstrip()}"
                                for j in range(start, end)
                            ]

                        matches.append(match_data)

                if matches:
                    rel_path = os.path.relpath(file_path, self.project_root)
                    results[rel_path] = matches

            except Exception:
                # Skip files that can't be read
                pass

        return results

    def bash(self, command: str, preview: bool = True, timeout: int = 30) -> Dict:
        """
        Execute a bash command

        Args:
            command: Shell command to run
            preview: If True, show what would run instead of executing
            timeout: Command timeout in seconds

        Returns:
            Dict with status, output, and error
        """
        result = {
            "action": "bash",
            "command": command
        }

        if preview:
            result["status"] = "preview"
            result["message"] = "Preview only - call with preview=False to execute"
            return result

        try:
            proc = subprocess.run(
                command,
                shell=True,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=timeout
            )

            result["status"] = "success" if proc.returncode == 0 else "error"
            result["returncode"] = proc.returncode
            result["stdout"] = proc.stdout
            result["stderr"] = proc.stderr

            self.changes_made.append(result)
            return result

        except subprocess.TimeoutExpired:
            result["status"] = "error"
            result["message"] = f"Command timed out after {timeout}s"
            return result
        except Exception as e:
            result["status"] = "error"
            result["message"] = f"Error executing command: {e}"
            return result

    def get_changes_summary(self) -> str:
        """Get a summary of all changes made by the agent"""
        if not self.changes_made:
            return "No changes made yet"

        summary = [f"Changes made: {len(self.changes_made)}\n"]

        for i, change in enumerate(self.changes_made, 1):
            action = change.get("action", "unknown")
            if action == "write":
                summary.append(f"{i}. Wrote {change['file']} ({change['lines']} lines)")
            elif action == "edit":
                summary.append(f"{i}. Edited {change['file']} ({change['replaced']} replacements)")
            elif action == "bash":
                summary.append(f"{i}. Ran: {change['command']}")

        return "\n".join(summary)

    def clear_changes(self):
        """Clear the changes log"""
        self.changes_made = []

    def _resolve_path(self, path: str) -> str:
        """Convert relative path to absolute path within project"""
        if os.path.isabs(path):
            return path
        return os.path.join(self.project_root, path)

    def _get_diff_preview(self, old_content: str, new_content: str) -> str:
        """Generate a simple diff preview"""
        old_lines = old_content.split('\n')
        new_lines = new_content.split('\n')

        # Find first difference
        for i, (old, new) in enumerate(zip(old_lines, new_lines), 1):
            if old != new:
                preview = [
                    f"Line {i}:",
                    f"- {old}",
                    f"+ {new}"
                ]
                # Show a few lines of context
                if i > 1:
                    preview.insert(0, f"  {old_lines[i-2]}")
                if i < len(new_lines):
                    preview.append(f"  {new_lines[i]}")
                return "\n".join(preview)

        return "Content will change"
