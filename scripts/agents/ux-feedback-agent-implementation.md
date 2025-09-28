# UI/UX Feedback Agent - Complete Implementation Guide

## Overview
This document contains the complete implementation for an AI-powered UI/UX feedback agent that provides best-in-class analysis with emphasis on simplicity, clarity, and thoughtful innovation.

## Project Structure
```
your-project/
├── .ux-feedback/
│   ├── agent.py
│   ├── cli.py
│   └── config.json
├── .vscode/
│   └── extensions/
│       └── ux-feedback/
│           ├── extension.ts
│           ├── package.json
│           └── tsconfig.json
└── .ux-feedback-config.json
```

## File 1: Core Python Agent
**Path:** `.ux-feedback/agent.py`

```python
"""
UI/UX Feedback Agent for Claude Code
Provides best-in-class UI/UX analysis and recommendations
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import asyncio
import aiohttp

@dataclass
class AppContext:
    """Stores application context for UX analysis"""
    name: str
    goals: List[str]
    target_market: str
    user_personas: List[Dict[str, str]]
    competitors: List[str]
    tech_stack: str
    current_features: List[str]
    
@dataclass
class UXFeedback:
    """Structured UX feedback response"""
    overall_score: float
    strengths: List[str]
    issues: List[Dict[str, str]]  # priority, description, suggestion
    innovations: List[Dict[str, str]]  # title, description, impact
    quick_wins: List[str]
    long_term_improvements: List[str]
    accessibility_notes: List[str]
    performance_considerations: List[str]

class UIUXFeedbackAgent:
    """AI Agent for providing comprehensive UI/UX feedback"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("Anthropic API key required. Set ANTHROPIC_API_KEY environment variable.")
        
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-5-sonnet-20241022"
        
    async def analyze_component(self, 
                               code: str, 
                               component_type: str,
                               app_context: AppContext) -> Dict:
        """Analyze a single UI component"""
        
        prompt = self._build_component_analysis_prompt(code, component_type, app_context)
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "max_tokens": 4000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.base_url, headers=headers, json=payload) as response:
                result = await response.json()
                
        return self._parse_feedback(result['content'][0]['text'])
    
    def _build_component_analysis_prompt(self, code: str, component_type: str, app_context: AppContext) -> str:
        """Build comprehensive prompt for component analysis"""
        
        return f"""You are an expert UI/UX designer analyzing a {component_type} component for a web application.

## Application Context
**Name**: {app_context.name}
**Goals**: {', '.join(app_context.goals)}
**Target Market**: {app_context.target_market}
**Tech Stack**: {app_context.tech_stack}
**Competitors**: {', '.join(app_context.competitors)}

## User Personas
{self._format_personas(app_context.user_personas)}

## Component Code to Analyze
```
{code}
```

## Analysis Instructions

Provide a comprehensive UI/UX analysis following these principles:

### Core Principles
1. **Simplicity First**: Identify any unnecessary complexity that could be simplified
2. **Clarity**: Assess if the purpose and functionality are immediately clear
3. **Consistency**: Check for consistency with common design patterns
4. **Innovation**: Suggest thoughtful enhancements that add value without complexity
5. **Accessibility**: Ensure WCAG 2.1 AA compliance
6. **Performance**: Consider render performance and user-perceived speed

### Evaluation Criteria
- Visual hierarchy and information architecture
- User flow and interaction patterns  
- Responsive design considerations
- Error handling and user feedback
- Loading states and animations
- Keyboard navigation and screen reader support
- Color contrast and typography
- Mobile-first considerations
- Cognitive load and decision fatigue

### Market Context
Compare against best practices from leading products in the {app_context.target_market} market.
Consider innovations from: {', '.join(app_context.competitors[:3]) if app_context.competitors else 'industry leaders'}

## Required Output Format

Respond with a JSON object containing:

```json
{{
  "overall_score": 0.0-10.0,
  "strengths": ["strength 1", "strength 2"],
  "issues": [
    {{
      "priority": "high|medium|low",
      "description": "Clear description of the issue",
      "suggestion": "Actionable improvement suggestion",
      "line": optional_line_number
    }}
  ],
  "innovations": [
    {{
      "title": "Innovation name",
      "description": "Detailed description",
      "impact": "Expected user impact"
    }}
  ],
  "quick_wins": ["Quick improvement 1", "Quick improvement 2"],
  "long_term_improvements": ["Strategic improvement 1"],
  "accessibility_notes": ["Accessibility consideration 1"],
  "performance_considerations": ["Performance tip 1"]
}}
```

Focus on actionable, specific feedback that balances simplicity with thoughtful innovation."""
    
    def _format_personas(self, personas: List[Dict[str, str]]) -> str:
        """Format user personas for the prompt"""
        if not personas:
            return "No specific user personas defined"
        
        formatted = []
        for i, persona in enumerate(personas, 1):
            formatted.append(f"{i}. **{persona.get('name', 'User')}**: {persona.get('description', '')}")
        
        return '\n'.join(formatted)
    
    def _parse_feedback(self, response: str) -> Dict:
        """Parse the AI response into structured feedback"""
        try:
            # Extract JSON from the response
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            
            # Try parsing the entire response as JSON
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback to extracting key information
            return self._fallback_parse(response)
    
    def _fallback_parse(self, response: str) -> Dict:
        """Fallback parser if JSON parsing fails"""
        return {
            "overall_score": 5.0,
            "strengths": ["Analysis completed but formatting error occurred"],
            "issues": [{"priority": "high", "description": "Review raw feedback", "suggestion": response[:500]}],
            "innovations": [],
            "quick_wins": [],
            "long_term_improvements": [],
            "accessibility_notes": [],
            "performance_considerations": [],
            "raw_feedback": response
        }
    
    async def analyze_full_app(self, 
                              project_path: str,
                              app_context: AppContext) -> Dict:
        """Analyze entire application UI/UX"""
        
        components = self._discover_components(project_path)
        results = []
        
        for component_path, component_type in components:
            with open(component_path, 'r') as f:
                code = f.read()
            
            feedback = await self.analyze_component(code, component_type, app_context)
            results.append({
                "component": str(component_path),
                "type": component_type,
                "feedback": feedback
            })
        
        return self._aggregate_feedback(results)
    
    def _discover_components(self, project_path: str) -> List[Tuple[Path, str]]:
        """Discover UI components in the project"""
        components = []
        path = Path(project_path)
        
        # Common component file patterns
        patterns = {
            "**/*.jsx": "React Component",
            "**/*.tsx": "TypeScript React Component",
            "**/*.vue": "Vue Component",
            "**/*.svelte": "Svelte Component",
            "**/components/**/*.js": "JavaScript Component",
            "**/components/**/*.ts": "TypeScript Component",
            "**/*.html": "HTML Template"
        }
        
        for pattern, component_type in patterns.items():
            for file_path in path.glob(pattern):
                # Skip node_modules and build directories
                if 'node_modules' not in str(file_path) and 'dist' not in str(file_path):
                    components.append((file_path, component_type))
        
        return components
    
    def _aggregate_feedback(self, results: List[Dict]) -> Dict:
        """Aggregate feedback from multiple components"""
        
        total_score = sum(r['feedback']['overall_score'] for r in results) / len(results) if results else 0
        
        all_issues = []
        all_innovations = []
        all_quick_wins = []
        
        for r in results:
            feedback = r['feedback']
            all_issues.extend(feedback.get('issues', []))
            all_innovations.extend(feedback.get('innovations', []))
            all_quick_wins.extend(feedback.get('quick_wins', []))
        
        # Sort issues by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        all_issues.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 3))
        
        return {
            "overall_score": round(total_score, 1),
            "components_analyzed": len(results),
            "top_issues": all_issues[:10],
            "top_innovations": all_innovations[:5],
            "quick_wins": list(set(all_quick_wins))[:10],
            "component_details": results
        }
    
    async def generate_report(self, 
                            analysis_results: Dict,
                            output_format: str = "markdown") -> str:
        """Generate a formatted UX feedback report"""
        
        if output_format == "markdown":
            return self._generate_markdown_report(analysis_results)
        elif output_format == "json":
            return json.dumps(analysis_results, indent=2)
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
    
    def _generate_markdown_report(self, results: Dict) -> str:
        """Generate a markdown formatted report"""
        
        report = f"""# UI/UX Analysis Report

## Overall Score: {results['overall_score']}/10

**Components Analyzed**: {results['components_analyzed']}

## Executive Summary

This report provides comprehensive UI/UX feedback emphasizing simplicity, clarity, and thoughtful innovation.

## Top Priority Issues

"""
        
        for issue in results['top_issues'][:5]:
            report += f"""
### 🔴 {issue['priority'].upper()}: {issue['description']}
**Suggestion**: {issue['suggestion']}
"""
        
        report += "\n## Recommended Innovations\n\n"
        
        for innovation in results['top_innovations']:
            report += f"""
### 💡 {innovation['title']}
{innovation['description']}
**Impact**: {innovation['impact']}
"""
        
        report += "\n## Quick Wins\n\n"
        
        for quick_win in results['quick_wins']:
            report += f"- {quick_win}\n"
        
        return report
```

## File 2: CLI Tool
**Path:** `.ux-feedback/cli.py`

```python
#!/usr/bin/env python3
"""
CLI wrapper for the UI/UX Feedback Agent
Provides easy command-line access to analysis features
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Optional
import os

# Import the main agent
from agent import UIUXFeedbackAgent, AppContext


class Colors:
    """Terminal colors for better output formatting"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_colored(text: str, color: str = Colors.ENDC):
    """Print colored text to terminal"""
    print(f"{color}{text}{Colors.ENDC}")


def load_config(config_path: Optional[str] = None) -> dict:
    """Load configuration from file or use defaults"""
    if config_path and Path(config_path).exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    
    # Try to find config in current directory
    default_config_path = Path('.ux-feedback-config.json')
    if default_config_path.exists():
        with open(default_config_path, 'r') as f:
            return json.load(f)
    
    # Return minimal default config
    return {
        "name": "Application",
        "target_market": "General",
        "goals": ["User-friendly", "Performant"],
        "competitors": [],
        "tech_stack": "Auto-detected",
        "user_personas": []
    }


def format_score_bar(score: float, max_score: float = 10) -> str:
    """Create a visual score bar"""
    filled = int((score / max_score) * 20)
    bar = '█' * filled + '░' * (20 - filled)
    
    if score >= 8:
        color = Colors.OKGREEN
    elif score >= 6:
        color = Colors.WARNING
    else:
        color = Colors.FAIL
    
    return f"{color}{bar} {score}/{max_score}{Colors.ENDC}"


def print_results(results: dict, verbose: bool = False):
    """Pretty print analysis results"""
    print_colored("\n" + "="*60, Colors.BOLD)
    print_colored("UI/UX ANALYSIS REPORT", Colors.HEADER + Colors.BOLD)
    print_colored("="*60 + "\n", Colors.BOLD)
    
    # Overall Score
    score = results.get('overall_score', 0)
    print(f"Overall Score: {format_score_bar(score)}")
    print(f"Components Analyzed: {results.get('components_analyzed', 0)}\n")
    
    # Top Issues
    issues = results.get('top_issues', [])
    if issues:
        print_colored("⚠️  TOP ISSUES", Colors.WARNING + Colors.BOLD)
        print_colored("-" * 40, Colors.WARNING)
        
        for i, issue in enumerate(issues[:5], 1):
            priority_color = {
                'high': Colors.FAIL,
                'medium': Colors.WARNING,
                'low': Colors.OKCYAN
            }.get(issue.get('priority', 'low'), Colors.ENDC)
            
            print(f"{i}. {priority_color}[{issue['priority'].upper()}]{Colors.ENDC} {issue['description']}")
            print(f"   💡 {issue['suggestion']}\n")
    
    # Innovations
    innovations = results.get('top_innovations', [])
    if innovations:
        print_colored("💡 RECOMMENDED INNOVATIONS", Colors.OKCYAN + Colors.BOLD)
        print_colored("-" * 40, Colors.OKCYAN)
        
        for innovation in innovations[:3]:
            print_colored(f"• {innovation['title']}", Colors.BOLD)
            print(f"  {innovation['description']}")
            print(f"  Impact: {innovation['impact']}\n")
    
    # Quick Wins
    quick_wins = results.get('quick_wins', [])
    if quick_wins:
        print_colored("🚀 QUICK WINS", Colors.OKGREEN + Colors.BOLD)
        print_colored("-" * 40, Colors.OKGREEN)
        
        for win in quick_wins[:5]:
            print(f"  ✓ {win}")
        print()


async def analyze_single_file(file_path: str, config: dict):
    """Analyze a single component file"""
    if not Path(file_path).exists():
        print_colored(f"Error: File {file_path} not found", Colors.FAIL)
        return
    
    agent = UIUXFeedbackAgent()
    
    with open(file_path, 'r') as f:
        code = f.read()
    
    # Determine component type from extension
    ext_to_type = {
        '.jsx': 'React Component',
        '.tsx': 'TypeScript React Component',
        '.vue': 'Vue Component',
        '.svelte': 'Svelte Component',
        '.html': 'HTML Template'
    }
    
    file_ext = Path(file_path).suffix
    component_type = ext_to_type.get(file_ext, 'Component')
    
    app_context = AppContext(
        name=config.get('name', 'App'),
        goals=config.get('goals', []),
        target_market=config.get('target_market', 'General'),
        user_personas=config.get('user_personas', []),
        competitors=config.get('competitors', []),
        tech_stack=config.get('tech_stack', 'Unknown'),
        current_features=config.get('current_features', [])
    )
    
    print_colored(f"Analyzing {file_path}...", Colors.OKCYAN)
    
    try:
        feedback = await agent.analyze_component(code, component_type, app_context)
        results = {
            'overall_score': feedback.get('overall_score', 0),
            'components_analyzed': 1,
            'top_issues': feedback.get('issues', []),
            'top_innovations': feedback.get('innovations', []),
            'quick_wins': feedback.get('quick_wins', [])
        }
        print_results(results)
        
    except Exception as e:
        print_colored(f"Analysis failed: {str(e)}", Colors.FAIL)


async def analyze_project(project_path: str, config: dict, verbose: bool = False):
    """Analyze entire project"""
    if not Path(project_path).exists():
        print_colored(f"Error: Project path {project_path} not found", Colors.FAIL)
        return
    
    agent = UIUXFeedbackAgent()
    
    app_context = AppContext(
        name=config.get('name', 'App'),
        goals=config.get('goals', []),
        target_market=config.get('target_market', 'General'),
        user_personas=config.get('user_personas', []),
        competitors=config.get('competitors', []),
        tech_stack=config.get('tech_stack', 'Unknown'),
        current_features=config.get('current_features', [])
    )
    
    print_colored(f"Analyzing project at {project_path}...", Colors.OKCYAN)
    print("This may take a few minutes depending on project size.\n")
    
    try:
        results = await agent.analyze_full_app(project_path, app_context)
        print_results(results, verbose)
        
        # Save report if requested
        return results
        
    except Exception as e:
        print_colored(f"Analysis failed: {str(e)}", Colors.FAIL)
        return None


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='UI/UX Feedback Agent - AI-powered interface analysis',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cli.py analyze ./src/components/Button.jsx
  python cli.py analyze-project ./src --verbose
  python cli.py analyze-project . --output report.json --threshold 7.0
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Analyze single file command
    analyze_parser = subparsers.add_parser('analyze', help='Analyze a single component file')
    analyze_parser.add_argument('file', help='Path to component file')
    analyze_parser.add_argument('--config', help='Path to config file')
    
    # Analyze project command
    project_parser = subparsers.add_parser('analyze-project', help='Analyze entire project')
    project_parser.add_argument('path', help='Path to project directory')
    project_parser.add_argument('--config', help='Path to config file')
    project_parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed output')
    project_parser.add_argument('--output', '-o', help='Save report to file')
    project_parser.add_argument('--format', choices=['json', 'markdown'], default='json', 
                               help='Output format for saved report')
    project_parser.add_argument('--threshold', type=float, help='Minimum score threshold (fail if below)')
    
    # Initialize command
    init_parser = subparsers.add_parser('init', help='Initialize config file')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Handle init command
    if args.command == 'init':
        config_template = {
            "name": "Your App Name",
            "goals": ["Simplify complex workflows", "Increase engagement"],
            "target_market": "B2B SaaS",
            "user_personas": [],
            "competitors": [],
            "tech_stack": "Auto-detected",
            "current_features": []
        }
        with open('.ux-feedback-config.json', 'w') as f:
            json.dump(config_template, f, indent=2)
        print_colored("✓ Created .ux-feedback-config.json", Colors.OKGREEN)
        print("Edit this file to customize your analysis settings.")
        sys.exit(0)
    
    # Load configuration
    config = load_config(args.config if hasattr(args, 'config') else None)
    
    # Check for API key
    if not os.getenv('ANTHROPIC_API_KEY'):
        print_colored("Error: ANTHROPIC_API_KEY environment variable not set", Colors.FAIL)
        print("Please set your API key: export ANTHROPIC_API_KEY='your-key-here'")
        sys.exit(1)
    
    # Run appropriate command
    if args.command == 'analyze':
        asyncio.run(analyze_single_file(args.file, config))
        
    elif args.command == 'analyze-project':
        results = asyncio.run(analyze_project(args.path, config, args.verbose))
        
        if results:
            # Save output if requested
            if args.output:
                agent = UIUXFeedbackAgent()
                if args.format == 'markdown':
                    report = asyncio.run(agent.generate_report(results, 'markdown'))
                    with open(args.output, 'w') as f:
                        f.write(report)
                else:
                    with open(args.output, 'w') as f:
                        json.dump(results, f, indent=2)
                
                print_colored(f"\n✓ Report saved to {args.output}", Colors.OKGREEN)
            
            # Check threshold
            if args.threshold:
                score = results.get('overall_score', 0)
                if score < args.threshold:
                    print_colored(
                        f"\n✗ Score {score} is below threshold {args.threshold}", 
                        Colors.FAIL
                    )
                    sys.exit(1)
                else:
                    print_colored(
                        f"\n✓ Score {score} meets threshold {args.threshold}", 
                        Colors.OKGREEN
                    )


if __name__ == "__main__":
    main()
```

## File 3: Configuration Template
**Path:** `.ux-feedback-config.json`

```json
{
    "name": "Your App Name",
    "goals": [
        "Simplify complex workflows",
        "Increase user engagement",
        "Reduce cognitive load",
        "Improve accessibility"
    ],
    "target_market": "B2B SaaS",
    "user_personas": [
        {
            "name": "Power User",
            "description": "Technical user who needs advanced features and keyboard shortcuts",
            "pain_points": ["Complex workflows", "Repetitive tasks"],
            "goals": ["Efficiency", "Customization"]
        },
        {
            "name": "Casual User",
            "description": "Non-technical user who values simplicity and guidance",
            "pain_points": ["Learning curve", "Feature discovery"],
            "goals": ["Ease of use", "Quick results"]
        },
        {
            "name": "Admin",
            "description": "User responsible for managing team and settings",
            "pain_points": ["Team onboarding", "Permission management"],
            "goals": ["Control", "Visibility"]
        }
    ],
    "competitors": [
        "Notion",
        "Airtable",
        "Monday.com",
        "Asana"
    ],
    "tech_stack": "React + TypeScript",
    "current_features": [
        "Dashboard",
        "Data visualization",
        "Collaboration tools",
        "Workflow automation"
    ],
    "design_system": {
        "primary_color": "#007AFF",
        "font_family": "Inter, system-ui, sans-serif",
        "spacing_unit": 8,
        "border_radius": 4
    },
    "analysis_preferences": {
        "emphasis": [
            "simplicity",
            "clarity",
            "innovation"
        ],
        "exclude_patterns": [
            "node_modules",
            "dist",
            "build",
            ".next",
            "coverage"
        ],
        "component_patterns": [
            "**/components/**/*.{jsx,tsx}",
            "**/pages/**/*.{jsx,tsx}",
            "**/views/**/*.{vue}",
            "**/layouts/**/*.{jsx,tsx}"
        ],
        "batch_size": 5,
        "max_file_size_kb": 100
    },
    "innovation_guidelines": {
        "allowed": [
            "Micro-interactions for better feedback",
            "Smart defaults based on user behavior",
            "Progressive disclosure of complexity",
            "Contextual help and tooltips",
            "Keyboard navigation enhancements"
        ],
        "avoid": [
            "Unnecessary animations",
            "Complex gestures",
            "Non-standard patterns without clear benefit",
            "Features that increase cognitive load"
        ]
    },
    "accessibility_requirements": {
        "standard": "WCAG 2.1 AA",
        "focus_areas": [
            "Keyboard navigation",
            "Screen reader support",
            "Color contrast",
            "Focus indicators",
            "Error messages"
        ]
    },
    "performance_targets": {
        "fcp": 1.8,
        "lcp": 2.5,
        "cls": 0.1,
        "tti": 3.8,
        "bundle_size_kb": 200
    }
}
```

## File 4: VS Code Extension
**Path:** `.vscode/extensions/ux-feedback/extension.ts`

```typescript
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('UI/UX Feedback Agent is now active!');

    // Register the main command
    const analyzeCommand = vscode.commands.registerCommand('ux-feedback.analyze', async () => {
        await runUXAnalysis();
    });

    // Register component-specific analysis
    const analyzeFileCommand = vscode.commands.registerCommand('ux-feedback.analyzeFile', async (uri: vscode.Uri) => {
        await analyzeSpecificFile(uri);
    });

    // Register quick action for current file
    const analyzeCurrentCommand = vscode.commands.registerCommand('ux-feedback.analyzeCurrent', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            await analyzeSpecificFile(activeEditor.document.uri);
        }
    });

    // Add status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(eye) UX Feedback";
    statusBarItem.command = 'ux-feedback.analyze';
    statusBarItem.tooltip = "Run UI/UX Analysis";
    statusBarItem.show();

    context.subscriptions.push(analyzeCommand, analyzeFileCommand, analyzeCurrentCommand, statusBarItem);

    // Create output channel for feedback
    const outputChannel = vscode.window.createOutputChannel('UI/UX Feedback');
    context.subscriptions.push(outputChannel);
}

async function runUXAnalysis() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    // Check for configuration file
    const configPath = path.join(workspaceFolder.uri.fsPath, '.ux-feedback-config.json');
    let config = await loadOrCreateConfig(configPath);

    // Show progress notification
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running UI/UX Analysis",
        cancellable: true
    }, async (progress, token) => {
        progress.report({ increment: 0, message: "Initializing analysis..." });

        // Prepare the Python script execution
        const scriptPath = path.join(workspaceFolder.uri.fsPath, '.ux-feedback', 'cli.py');
        const pythonProcess = spawn('python', [
            scriptPath,
            'analyze-project',
            workspaceFolder.uri.fsPath
        ]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
            progress.report({ increment: 10, message: "Analyzing components..." });
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        return new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    vscode.window.showErrorMessage(`Analysis failed: ${errorOutput}`);
                    reject(errorOutput);
                } else {
                    displayAnalysisResults(output);
                    resolve(output);
                }
            });

            token.onCancellationRequested(() => {
                pythonProcess.kill();
                reject('Analysis cancelled');
            });
        });
    });
}

async function analyzeSpecificFile(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(uri);
    const content = document.getText();
    
    // Determine component type based on file extension
    const componentType = getComponentType(uri.fsPath);

    // Create a diagnostic collection for inline feedback
    const diagnostics = vscode.languages.createDiagnosticCollection('ux-feedback');

    // Show quick pick for analysis type
    const analysisType = await vscode.window.showQuickPick([
        { label: '$(symbol-class) Component Structure', value: 'structure' },
        { label: '$(symbol-color) Visual Design', value: 'visual' },
        { label: '$(accessibility) Accessibility', value: 'accessibility' },
        { label: '$(dashboard) Performance', value: 'performance' },
        { label: '$(checklist) Comprehensive', value: 'all' }
    ], { placeHolder: 'Select analysis type' });

    if (!analysisType) return;

    // Run Python script for analysis
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;

    const scriptPath = path.join(workspaceFolder.uri.fsPath, '.ux-feedback', 'cli.py');
    const pythonProcess = spawn('python', [
        scriptPath,
        'analyze',
        uri.fsPath
    ]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.on('close', () => {
        // Parse and display feedback
        try {
            const feedback = JSON.parse(output);
            displayComponentFeedback(feedback, document, diagnostics);
        } catch (e) {
            // Display raw output
            const outputChannel = vscode.window.createOutputChannel('UI/UX Feedback');
            outputChannel.clear();
            outputChannel.append(output);
            outputChannel.show();
        }
    });
}

function getComponentType(filePath: string): string {
    const ext = path.extname(filePath);
    const componentTypes: { [key: string]: string } = {
        '.jsx': 'React Component',
        '.tsx': 'TypeScript React Component',
        '.vue': 'Vue Component',
        '.svelte': 'Svelte Component',
        '.html': 'HTML Template',
        '.css': 'Stylesheet',
        '.scss': 'SCSS Stylesheet'
    };
    
    return componentTypes[ext] || 'Unknown Component';
}

async function loadOrCreateConfig(configPath: string): Promise<any> {
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
    } catch (error) {
        // Create default config
        const defaultConfig = await promptForConfiguration();
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
}

async function promptForConfiguration(): Promise<any> {
    const appName = await vscode.window.showInputBox({
        prompt: 'Enter your application name',
        value: 'MyApp'
    });

    const targetMarket = await vscode.window.showQuickPick([
        'B2B SaaS',
        'B2C Mobile',
        'E-commerce',
        'Enterprise',
        'Developer Tools',
        'Social Media',
        'Educational',
        'Healthcare'
    ], { placeHolder: 'Select target market' });

    const goals = await vscode.window.showInputBox({
        prompt: 'Enter main goals (comma-separated)',
        value: 'Simplicity, User engagement, Performance'
    });

    const competitors = await vscode.window.showInputBox({
        prompt: 'Enter competitor products (comma-separated)',
        value: ''
    });

    return {
        name: appName || 'MyApp',
        target_market: targetMarket || 'B2B SaaS',
        goals: goals?.split(',').map(g => g.trim()) || [],
        competitors: competitors?.split(',').map(c => c.trim()) || [],
        tech_stack: 'Auto-detected',
        user_personas: []
    };
}

function displayAnalysisResults(results: string) {
    const outputChannel = vscode.window.createOutputChannel('UI/UX Feedback');
    outputChannel.clear();
    outputChannel.append(results);
    outputChannel.show();
}

function displayComponentFeedback(feedback: any, document: vscode.TextDocument, diagnostics: vscode.languages.DiagnosticCollection) {
    const diags: vscode.Diagnostic[] = [];

    // Add diagnostics for each issue
    feedback.issues?.forEach((issue: any) => {
        const line = (issue.line || 1) - 1; // Convert to 0-based
        const range = new vscode.Range(line, 0, line, document.lineAt(line).text.length);
        
        const severityMap: { [key: string]: vscode.DiagnosticSeverity } = {
            'high': vscode.DiagnosticSeverity.Error,
            'medium': vscode.DiagnosticSeverity.Warning,
            'low': vscode.DiagnosticSeverity.Information
        };
        
        const diagnostic = new vscode.Diagnostic(
            range,
            `${issue.description}\n💡 ${issue.suggestion}`,
            severityMap[issue.priority] || vscode.DiagnosticSeverity.Information
        );
        
        diagnostic.source = 'UX Feedback';
        diagnostic.code = 'ux-issue';
        diags.push(diagnostic);
    });

    diagnostics.set(document.uri, diags);

    // Show summary notification
    const message = `UX Score: ${feedback.overall_score}/10 | ${feedback.issues?.length || 0} issues found`;
    const action = feedback.overall_score < 6 ? vscode.window.showWarningMessage : vscode.window.showInformationMessage;
    
    action(message, 'View Details').then(selection => {
        if (selection === 'View Details') {
            displayAnalysisResults(JSON.stringify(feedback, null, 2));
        }
    });
}

export function deactivate() {}
```

## File 5: VS Code Extension Package
**Path:** `.vscode/extensions/ux-feedback/package.json`

```json
{
    "name": "ux-feedback-agent",
    "displayName": "UI/UX Feedback Agent",
    "description": "AI-powered UI/UX analysis providing best-in-class feedback with emphasis on simplicity and thoughtful innovation",
    "version": "1.0.0",
    "engines": {
        "vscode": "^1.74.0"
    },
    "categories": [
        "Linters",
        "Other"
    ],
    "keywords": [
        "ui",
        "ux",
        "design",
        "feedback",
        "ai",
        "claude",
        "analysis"
    ],
    "activationEvents": [
        "onCommand:ux-feedback.analyze",
        "onCommand:ux-feedback.analyzeFile",
        "onCommand:ux-feedback.analyzeCurrent"
    ],
    "main": "./out/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "ux-feedback.analyze",
                "title": "Run Full UI/UX Analysis",
                "category": "UX Feedback"
            },
            {
                "command": "ux-feedback.analyzeFile",
                "title": "Analyze This Component",
                "category": "UX Feedback"
            },
            {
                "command": "ux-feedback.analyzeCurrent",
                "title": "Analyze Current File",
                "category": "UX Feedback"
            }
        ],
        "menus": {
            "explorer/context": [
                {
                    "when": "resourceExtname =~ /\\.(jsx?|tsx?|vue|svelte)$/",
                    "command": "ux-feedback.analyzeFile",
                    "group": "2_workspace"
                }
            ],
            "editor/context": [
                {
                    "when": "resourceExtname =~ /\\.(jsx?|tsx?|vue|svelte|html|css|scss)$/",
                    "command": "ux-feedback.analyzeCurrent",
                    "group": "1_modification"
                }
            ]
        },
        "keybindings": [
            {
                "command": "ux-feedback.analyzeCurrent",
                "key": "ctrl+shift+u",
                "mac": "cmd+shift+u",
                "when": "editorTextFocus"
            }
        ],
        "configuration": {
            "title": "UI/UX Feedback Agent",
            "properties": {
                "uxFeedback.apiKey": {
                    "type": "string",
                    "default": "",
                    "description": "Anthropic API key for Claude integration",
                    "scope": "application"
                },
                "uxFeedback.model": {
                    "type": "string",
                    "enum": [
                        "claude-3-5-sonnet-20241022",
                        "claude-3-opus-20240229"
                    ],
                    "default": "claude-3-5-sonnet-20241022",
                    "description": "Claude model to use for analysis"
                },
                "uxFeedback.autoAnalyze": {
                    "type": "boolean",
                    "default": false,
                    "description": "Automatically analyze components on save"
                },
                "uxFeedback.focusAreas": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "accessibility",
                            "performance",
                            "visual-design",
                            "user-flow",
                            "mobile-responsiveness",
                            "simplicity",
                            "innovation"
                        ]
                    },
                    "default": ["simplicity", "accessibility", "innovation"],
                    "description": "Primary areas to focus on during analysis"
                },
                "uxFeedback.severityThreshold": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "default": "medium",
                    "description": "Minimum severity level for issues to display"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./"
    },
    "devDependencies": {
        "@types/node": "^18.x",
        "@types/vscode": "^1.74.0",
        "typescript": "^4.9.4"
    },
    "dependencies": {}
}
```

## File 6: TypeScript Configuration
**Path:** `.vscode/extensions/ux-feedback/tsconfig.json`

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES2020",
        "outDir": "out",
        "lib": [
            "ES2020"
        ],
        "sourceMap": true,
        "rootDir": ".",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    },
    "exclude": [
        "node_modules",
        ".vscode-test"
    ]
}
```

## Setup Instructions

### 1. Prerequisites
```bash
# Install Python dependencies
pip install aiohttp

# Install Node.js dependencies (for VS Code extension)
cd .vscode/extensions/ux-feedback
npm install
```

### 2. Environment Setup
```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Or add to .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
```

### 3. Initialize Configuration
```bash
# From your project root
python .ux-feedback/cli.py init

# Edit the generated config file
# Customize .ux-feedback-config.json with your app details
```

### 4. VS Code Extension Setup
```bash
# Compile the extension
cd .vscode/extensions/ux-feedback
npm run compile

# Link the extension (for development)
# Or package it as VSIX for distribution
```

## Usage Examples

### Command Line Usage

```bash
# Analyze a single component
python .ux-feedback/cli.py analyze ./src/components/Button.jsx

# Analyze entire project
python .ux-feedback/cli.py analyze-project ./src --verbose

# Generate markdown report
python .ux-feedback/cli.py analyze-project . --output report.md --format markdown

# CI/CD integration with threshold
python .ux-feedback/cli.py analyze-project . --threshold 7.0
```

### VS Code Usage

1. **Quick Analysis**: Press `Cmd+Shift+U` (Mac) or `Ctrl+Shift+U` (Windows/Linux)
2. **Right-click menu**: Right-click on any component file → "Analyze This Component"
3. **Command Palette**: `Cmd+Shift+P` → "UX Feedback: Run Full UI/UX Analysis"

### Python API Usage

```python
import asyncio
from ux_feedback.agent import UIUXFeedbackAgent, AppContext

async def main():
    agent = UIUXFeedbackAgent()
    
    app_context = AppContext(
        name="MyApp",
        goals=["Simplicity", "Performance"],
        target_market="B2B SaaS",
        user_personas=[],
        competitors=["Notion", "Airtable"],
        tech_stack="React + TypeScript",
        current_features=["Dashboard", "Analytics"]
    )
    
    # Analyze single component
    with open("component.jsx", "r") as f:
        code = f.read()
    
    feedback = await agent.analyze_component(
        code=code,
        component_type="React Component",
        app_context=app_context
    )
    
    print(f"Score: {feedback['overall_score']}/10")
    
    # Generate report
    report = await agent.generate_report(feedback, "markdown")
    print(report)

asyncio.run(main())
```

## CI/CD Integration

### GitHub Actions

```yaml
name: UI/UX Analysis

on:
  pull_request:
    paths:
      - 'src/**/*.jsx'
      - 'src/**/*.tsx'

jobs:
  ux-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install aiohttp
      
      - name: Run UX Analysis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python .ux-feedback/cli.py analyze-project ./src \
            --threshold 6.0 \
            --output ux-report.md \
            --format markdown
      
      - name: Comment PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('ux-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## Customization Guide

### Adding Custom Rules

Create `.ux-feedback/custom_rules.py`:

```python
def custom_accessibility_check(code: str) -> List[Dict]:
    """Custom accessibility validation"""
    issues = []
    
    # Check for missing alt text
    if '<img' in code and 'alt=' not in code:
        issues.append({
            "priority": "high",
            "description": "Image missing alt text",
            "suggestion": "Add descriptive alt text for accessibility"
        })
    
    return issues

def custom_performance_check(code: str) -> List[Dict]:
    """Custom performance validation"""
    issues = []
    
    # Check for large bundle imports
    if 'import * from' in code:
        issues.append({
            "priority": "medium",
            "description": "Using wildcard imports",
            "suggestion": "Import only needed functions to reduce bundle size"
        })
    
    return issues
```

### Extending Analysis

Add to `.ux-feedback/agent.py`:

```python
def analyze_with_custom_rules(self, code: str) -> Dict:
    """Extend analysis with custom rules"""
    base_feedback = self.analyze_component(code)
    
    # Add custom checks
    from custom_rules import custom_accessibility_check, custom_performance_check
    
    custom_issues = []
    custom_issues.extend(custom_accessibility_check(code))
    custom_issues.extend(custom_performance_check(code))
    
    base_feedback['issues'].extend(custom_issues)
    
    return base_feedback
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   ```bash
   export ANTHROPIC_API_KEY="your-key"
   # Or add to VS Code settings.json
   ```

2. **Python Module Not Found**
   ```bash
   pip install aiohttp
   # Ensure Python 3.8+ is installed
   ```

3. **VS Code Extension Not Working**
   ```bash
   cd .vscode/extensions/ux-feedback
   npm install
   npm run compile
   ```

4. **Analysis Timeout**
   - Reduce batch size in config
   - Check API rate limits
   - Increase timeout in agent.py

## Best Practices

### When to Run Analysis
- **Before PR/Merge**: Ensure UI standards are met
- **After Major Changes**: Validate UX consistency
- **Sprint Planning**: Identify improvement opportunities
- **Design Reviews**: Get AI-powered second opinion

### Score Interpretation
- **8-10**: Excellent - Minor refinements only
- **6-8**: Good - Some improvements recommended
- **4-6**: Fair - Significant improvements needed
- **Below 4**: Poor - Major redesign recommended

### Focus Areas by Project Stage
- **MVP/Early Stage**: Focus on simplicity and core functionality
- **Growth Stage**: Emphasize user engagement and conversion
- **Mature Product**: Innovation and differentiation
- **Enterprise**: Accessibility and compliance

## License
MIT

---

**Note for Claude Code**: This markdown file contains all necessary code and configuration to implement the UI/UX Feedback Agent. Create the file structure as shown and copy the code blocks into their respective files. Remember to set the ANTHROPIC_API_KEY environment variable before running.
