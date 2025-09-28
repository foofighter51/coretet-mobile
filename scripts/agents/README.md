# CoreTet AI Agent System

A sophisticated multi-agent system for automated code review, quality assurance, and continuous learning.

## 🏗️ System Architecture

The agent system consists of specialized agents working together to provide comprehensive code analysis:

- **🔍 Validator Agent**: TypeScript, ESLint, security, and performance validation
- **🛡️ Guardian Agent**: Architectural patterns and business rule enforcement  
- **🧠 Memory Agent**: Intelligent storage, pattern recognition, and continuous learning
- **🎭 Agent Orchestrator**: Central coordination and workflow management

## 📁 Directory Structure

```
scripts/agents/
├── README.md                    # This documentation
├── core/
│   ├── AgentOrchestrator.js     # Central workflow coordinator
│   ├── BaseAgent.js             # Foundation class for all agents
│   └── InterAgentComms.js       # Message passing system
├── config/
│   ├── agent-config.json        # System configuration
│   └── prompt-templates.json    # AI prompt templates
├── validators/
│   ├── ValidatorAgent.js        # Code quality validation
│   └── validator-cli.js         # CLI interface
├── guardians/
│   ├── GuardianAgent.js         # Architectural enforcement
│   └── guardian-cli.js          # CLI interface
├── memory/
│   ├── EnhancedMemoryAgent.js   # Advanced memory management
│   ├── memory-cli.js            # CLI interface
│   └── data/                    # Memory persistence (auto-created)
└── orchestrate-review.js        # Comprehensive review workflow
```

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have the required environment variables in `.env.local`:
```bash
# Google Gemini API (required for AI analysis)
GEMINI_API_KEY=your-gemini-api-key

# Optional: Enable debug logging
DEBUG_AGENTS=true
```

### 2. Basic Usage

#### Individual Agent Commands

```bash
# Validate a specific file
npm run validate:file src/components/MyComponent.tsx

# Run guardian checks on staged files
npm run guard:staged

# Check memory statistics
npm run memory:stats

# View memory dashboard
npm run memory:dashboard
```

#### Comprehensive Review (Recommended)

```bash
# Review a specific file with all agents
npm run review:comprehensive -- --file src/components/MyComponent.tsx

# Review all staged files
npm run review:comprehensive -- --staged

# Review recent changes with detailed output
npm run review:comprehensive -- --recent --verbose
```

## 🔧 Configuration

### Agent Configuration (`config/agent-config.json`)

Key settings you can customize:

```json
{
  "agents": {
    "validator": {
      "enabled": true,
      "config": {
        "checks": {
          "typescript": true,
          "eslint": true,
          "prettier": true,
          "security": true,
          "performance": true
        }
      }
    },
    "guardian": {
      "enabled": true,
      "config": {
        "rules": {
          "enforceComponentStructure": true,
          "preventDirectDbAccess": true,
          "validateApiRoutes": true
        }
      }
    },
    "memory": {
      "enabled": true,
      "config": {
        "storage": {
          "maxExecutions": 1000,
          "maxAge": "7d",
          "compressionEnabled": true
        }
      }
    }
  },
  "workflows": {
    "codeReview": {
      "agents": ["validator", "guardian", "memory"],
      "parallel": false,
      "timeout": 180000
    }
  }
}
```

### Workflow Execution Modes

- **Sequential** (`"parallel": false`): Agents run one after another, memory agent receives all results
- **Parallel** (`"parallel": true`): Agents run simultaneously for faster execution

## 📋 Available Commands

### Package.json Scripts

| Command | Description |
|---------|-------------|
| `npm run validate:file <path>` | Validate specific file |
| `npm run validate:staged` | Validate staged files |
| `npm run validate:recent` | Validate recent changes |
| `npm run guard:file <path>` | Guardian checks on file |
| `npm run guard:staged` | Guardian checks on staged files |
| `npm run guard:strict` | Strict guardian validation |
| `npm run memory:dashboard` | Memory analytics dashboard |
| `npm run memory:stats` | Memory statistics |
| `npm run memory:learn` | Trigger learning process |
| `npm run review:comprehensive` | Full multi-agent review |

### Command Line Options

```bash
# File-specific review
npm run review:comprehensive -- --file src/components/Button.tsx

# Staged files review
npm run review:comprehensive -- --staged --verbose

# Recent changes review with markdown output
npm run review:comprehensive -- --recent --format markdown --output reports/review.md

# Multiple output formats
--format console|json|markdown
--output <file-path>
--verbose
```

## 🎯 Best Practices

### 1. Pre-Commit Workflow

Add to your git pre-commit hook:
```bash
#!/bin/bash
npm run review:comprehensive -- --staged
if [ $? -ne 0 ]; then
  echo "❌ Code review failed. Please fix issues before committing."
  exit 1
fi
```

### 2. CI/CD Integration

For continuous integration:
```bash
# In your CI pipeline
npm run review:comprehensive -- --recent --format json --output ci-review.json
```

### 3. Development Workflow

Recommended development flow:

1. **During Development**: Use individual agents for quick feedback
   ```bash
   npm run validate:file src/components/NewFeature.tsx
   ```

2. **Before Commit**: Run comprehensive review on staged files
   ```bash
   npm run review:comprehensive -- --staged
   ```

3. **Code Review**: Generate detailed reports for PR reviews
   ```bash
   npm run review:comprehensive -- --recent --format markdown --output pr-review.md
   ```

### 4. Memory Management

The Memory Agent learns from every review:

- **View Learning Progress**: `npm run memory:stats`
- **Manual Learning**: `npm run memory:learn`
- **Pattern Analysis**: `npm run memory:dashboard`

## 📊 Understanding Agent Output

### Validator Agent Output

```
🔍 Validation Summary:
   🟢 Good: 5 files
   🟡 Minor Changes: 2 files
   🔴 Major Changes: 0 files
```

- **🟢 Good**: No issues found
- **🟡 Minor Changes**: Formatting or minor improvements needed
- **🔴 Major Changes**: Significant issues requiring attention

### Guardian Agent Output

```
🛡️ Guardian Summary:
   ✅ Approved: 4 files
   🟡 Conditional: 1 file
   🚫 Rejected: 0 files
```

- **✅ Approved**: Meets architectural standards
- **🟡 Conditional**: Minor violations, proceed with caution
- **🚫 Rejected**: Critical violations, must be fixed

### Memory Agent Insights

```
🧠 Memory Overview:
   Total Entries: 45
   Average Relevance: 87%
   Learning Effectiveness: 92%
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Agent Timeout Errors
```bash
❌ Agent failed: validator (30000ms) Agent execution timeout
```
**Solution**: Increase timeout in `agent-config.json`:
```json
{
  "workflows": {
    "codeReview": {
      "timeout": 300000  // 5 minutes
    }
  }
}
```

#### 2. Missing Gemini API Key
```bash
❌ Memory operation failed: API key not configured
```
**Solution**: Add to `.env.local`:
```bash
GEMINI_API_KEY=your-api-key-here
```

#### 3. Memory Persistence Issues
```bash
⚠️ No data to store in memory
```
**Solution**: Ensure agents run in sequential mode:
```json
{
  "workflows": {
    "codeReview": {
      "parallel": false  // Sequential execution
    }
  }
}
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG_AGENTS=true npm run review:comprehensive -- --file src/test.tsx
```

## 🧠 Memory Agent Advanced Features

### Pattern Recognition

The Memory Agent automatically identifies:
- **Outcome Patterns**: Success/failure trends across files
- **Error Patterns**: Common error types and frequencies  
- **Performance Patterns**: Slow validation areas
- **File Type Patterns**: Issues specific to .tsx, .ts, etc.

### Intelligent Retrieval

```bash
# Search memory for specific patterns
npm run memory:search -- --query "typescript errors"

# Analyze quality trends
npm run memory:patterns
```

### Learning Integration

The system continuously improves by:
- Tracking validation success rates
- Learning from repeated issues
- Adapting relevance scoring
- Optimizing search algorithms

## 🚀 Advanced Usage

### Custom Workflows

Create custom workflows in `agent-config.json`:

```json
{
  "workflows": {
    "securityReview": {
      "description": "Security-focused review",
      "agents": ["guardian", "validator"],
      "parallel": false,
      "timeout": 120000
    }
  }
}
```

### Extending Agents

To add new validation checks:

1. Extend `ValidatorAgent.js` with new check methods
2. Add configuration in `agent-config.json`
3. Update prompt templates in `prompt-templates.json`

### Integration with External Tools

The agents can integrate with:
- **GitHub Actions**: Automated PR reviews
- **Slack/Discord**: Notification webhooks  
- **JIRA**: Issue creation for violations
- **SonarQube**: Code quality metrics

## 📈 Performance Optimization

### Memory Management

- **Automatic Compression**: Old entries are compressed to save space
- **Relevance Decay**: Older entries lose relevance over time
- **Pattern Optimization**: Frequently used patterns are cached

### Execution Optimization

- **Parallel Execution**: Use for faster feedback on independent checks
- **Sequential Execution**: Use when agents need to share results
- **Selective Agents**: Disable unused agents to improve performance

## 🤝 Contributing

To contribute new agents or improvements:

1. **New Agent**: Extend `BaseAgent.js` and implement `execute()` method
2. **Configuration**: Add agent config to `agent-config.json`
3. **CLI Interface**: Create CLI script following existing patterns
4. **Documentation**: Update this README with new features

## 📝 License

This agent system is part of the CoreTet project. See the main project LICENSE for details.

---

**Need Help?** Check the troubleshooting section above or run `npm run memory:dashboard` to see system health and insights.