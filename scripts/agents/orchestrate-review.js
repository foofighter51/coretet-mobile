#!/usr/bin/env node

/**
 * Orchestrate Review - Combined Validator + Guardian workflow
 * Runs comprehensive code review using both agents in sequence
 */

require('dotenv').config({ path: '.env.local' });

const AgentOrchestrator = require('./core/AgentOrchestrator');
const ValidatorAgent = require('./validators/ValidatorAgent');
const GuardianAgent = require('./guardians/GuardianAgent');
const EnhancedMemoryAgent = require('./memory/EnhancedMemoryAgent');
const fs = require('fs');
const path = require('path');

class ReviewOrchestrator {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.validatorAgent = new ValidatorAgent();
    this.guardianAgent = new GuardianAgent();
    this.memoryAgent = new EnhancedMemoryAgent();
    
    // Register agents
    this.orchestrator.registerAgent(this.validatorAgent);
    this.orchestrator.registerAgent(this.guardianAgent);
    this.orchestrator.registerAgent(this.memoryAgent);
  }

  async run(args) {
    const options = this.parseArgs(args);
    
    try {
      console.log('🚀 Starting Comprehensive Code Review...\n');
      
      if (options.file) {
        await this.reviewFile(options.file, options);
      } else if (options.staged) {
        await this.reviewStaged(options);
      } else if (options.recent) {
        await this.reviewRecent(options);
      } else {
        console.log('Please specify --file, --staged, or --recent');
        this.printHelp();
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Review failed:', error.message);
      process.exit(1);
    }
  }

  parseArgs(args) {
    const options = {
      file: null,
      staged: false,
      recent: false,
      output: null,
      format: 'console',
      verbose: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--staged') {
        options.staged = true;
      } else if (arg === '--recent') {
        options.recent = true;
      } else if (arg === '--output' || arg === '-o') {
        options.output = args[++i];
      } else if (arg === '--format' || arg === '-f') {
        options.format = args[++i];
      } else if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      } else if (arg === '--help' || arg === '-h') {
        this.printHelp();
        process.exit(0);
      } else if (!arg.startsWith('--') && !options.file) {
        options.file = arg;
      }
    }

    return options;
  }

  async reviewFile(filePath, options) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Reviewing file: ${filePath}`);
    
    const codeContent = fs.readFileSync(filePath, 'utf8');
    
    // Run comprehensive review workflow
    const result = await this.orchestrator.executeWorkflow('codeReview', {
      fileName: filePath,
      codeContent,
      changeType: 'comprehensive-review',
      timestamp: new Date().toISOString()
    });

    await this.outputResults([result], filePath, options);
  }

  async reviewStaged(options) {
    console.log('📋 Reviewing staged files...');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      const { stdout } = await execAsync('git diff --cached --name-only');
      const stagedFiles = stdout.trim().split('\n').filter(file => 
        file && file.match(/\.(js|jsx|ts|tsx)$/)
      );

      if (stagedFiles.length === 0) {
        console.log('ℹ️  No staged JavaScript/TypeScript files found');
        return;
      }

      console.log(`Found ${stagedFiles.length} staged files to review`);
      
      const results = [];
      
      for (const file of stagedFiles) {
        if (fs.existsSync(file)) {
          console.log(`\n📋 Reviewing: ${file}`);
          
          const codeContent = fs.readFileSync(file, 'utf8');
          
          const result = await this.orchestrator.executeWorkflow('codeReview', {
            fileName: file,
            codeContent,
            changeType: 'staged-comprehensive-review'
          });
          
          results.push(result);
          
          // Quick status
          this.printQuickStatus(result);
        }
      }
      
      await this.outputResults(results, 'staged-files', options);
      
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error.message}`);
    }
  }

  async reviewRecent(options) {
    console.log('📅 Reviewing recent changes...');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      const { stdout } = await execAsync('git diff --name-only HEAD~1 HEAD');
      const recentFiles = stdout.trim().split('\n').filter(file => 
        file && file.match(/\.(js|jsx|ts|tsx)$/) && fs.existsSync(file)
      );

      if (recentFiles.length === 0) {
        console.log('ℹ️  No recent JavaScript/TypeScript file changes found');
        return;
      }

      console.log(`Found ${recentFiles.length} recently changed files`);
      
      const results = [];
      
      for (const file of recentFiles) {
        console.log(`\n📋 Reviewing: ${file}`);
        
        const codeContent = fs.readFileSync(file, 'utf8');
        
        const result = await this.orchestrator.executeWorkflow('codeReview', {
          fileName: file,
          codeContent,
          changeType: 'recent-comprehensive-review'
        });
        
        results.push(result);
        
        this.printQuickStatus(result);
      }
      
      await this.outputResults(results, 'recent-files', options);
      
    } catch (error) {
      throw new Error(`Failed to get recent files: ${error.message}`);
    }
  }

  printQuickStatus(result) {
    if (!result.success) {
      console.log(`   ❌ Review failed`);
      return;
    }

    const validatorResult = result.results.validator;
    const guardianResult = result.results.guardian;

    let status = [];

    if (validatorResult && validatorResult.success) {
      const rating = validatorResult.data.rating;
      status.push(`Validation: ${rating}`);
    }

    if (guardianResult && guardianResult.success) {
      const decision = guardianResult.data.decision;
      const emoji = this.getDecisionEmoji(decision);
      status.push(`Guardian: ${emoji} ${decision}`);
    }

    console.log(`   ${status.join(' | ')}`);
  }

  getDecisionEmoji(decision) {
    switch (decision) {
      case 'APPROVE': return '✅';
      case 'CONDITIONAL': return '🟡';
      case 'REJECT': return '🚫';
      default: return '❓';
    }
  }

  async outputResults(results, context, options) {
    if (options.format === 'json') {
      const output = JSON.stringify({ results, context }, null, 2);
      this.writeOutput(output, options.output);
    } else if (options.format === 'markdown') {
      const output = this.generateMarkdownReport(results, context);
      this.writeOutput(output, options.output);
    } else {
      this.printConsoleReport(results, context, options.verbose);
    }
  }

  printConsoleReport(results, context, verbose) {
    console.log('\n' + '='.repeat(70));
    console.log('📋 COMPREHENSIVE CODE REVIEW SUMMARY');
    console.log('='.repeat(70));

    const summary = this.generateSummary(results);
    
    console.log(`📊 Files Reviewed: ${summary.totalFiles}`);
    console.log(`⏱️  Total Duration: ${summary.totalDuration}ms`);
    console.log(`✅ Successful Reviews: ${summary.successful}`);
    console.log(`❌ Failed Reviews: ${summary.failed}`);
    
    console.log(`\n🔍 Validation Summary:`);
    console.log(`   🟢 Good: ${summary.validation.good}`);
    console.log(`   🟡 Minor Changes: ${summary.validation.minor}`);
    console.log(`   🔴 Major Changes: ${summary.validation.major}`);
    
    console.log(`\n🛡️  Guardian Summary:`);
    console.log(`   ✅ Approved: ${summary.guardian.approved}`);
    console.log(`   🟡 Conditional: ${summary.guardian.conditional}`);
    console.log(`   🚫 Rejected: ${summary.guardian.rejected}`);

    if (verbose) {
      console.log('\n📋 Detailed Results:');
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Review Result:`);
        console.log(`   Success: ${result.success ? '✅' : '❌'}`);
        console.log(`   Duration: ${result.duration || 'N/A'}ms`);
        
        if (result.success && result.results) {
          const validatorData = result.results.validator?.data;
          const guardianData = result.results.guardian?.data;
          
          if (validatorData) {
            console.log(`   Validator: ${validatorData.rating} (${validatorData.summary?.totalIssues || 0} issues)`);
          }
          
          if (guardianData) {
            console.log(`   Guardian: ${this.getDecisionEmoji(guardianData.decision)} ${guardianData.decision} (${guardianData.summary?.totalViolations || 0} violations)`);
          }
        }
        
        if (!result.success && result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
    }

    // Overall assessment
    console.log('\n' + '='.repeat(70));
    const overallScore = this.calculateOverallScore(summary);
    
    if (overallScore >= 90) {
      console.log('🌟 Excellent code quality and architectural compliance!');
    } else if (overallScore >= 75) {
      console.log('👍 Good code quality with minor architectural improvements needed');
    } else if (overallScore >= 60) {
      console.log('⚠️  Code quality and architecture need attention');
    } else {
      console.log('🚨 Significant code quality and architectural issues detected');
    }
    
    console.log(`📊 Overall Score: ${overallScore}%`);
    console.log('='.repeat(70));
  }

  generateSummary(results) {
    const summary = {
      totalFiles: results.length,
      successful: 0,
      failed: 0,
      totalDuration: 0,
      validation: { good: 0, minor: 0, major: 0, failed: 0 },
      guardian: { approved: 0, conditional: 0, rejected: 0, failed: 0 }
    };

    results.forEach(result => {
      if (result.success) {
        summary.successful++;
        summary.totalDuration += result.duration || 0;
        
        // Process validator results
        const validatorData = result.results.validator?.data;
        if (validatorData) {
          if (validatorData.rating?.includes('Good')) {
            summary.validation.good++;
          } else if (validatorData.rating?.includes('Minor')) {
            summary.validation.minor++;
          } else if (validatorData.rating?.includes('Major')) {
            summary.validation.major++;
          } else {
            summary.validation.failed++;
          }
        }
        
        // Process guardian results
        const guardianData = result.results.guardian?.data;
        if (guardianData) {
          switch (guardianData.decision) {
            case 'APPROVE':
              summary.guardian.approved++;
              break;
            case 'CONDITIONAL':
              summary.guardian.conditional++;
              break;
            case 'REJECT':
              summary.guardian.rejected++;
              break;
            default:
              summary.guardian.failed++;
          }
        }
      } else {
        summary.failed++;
      }
    });

    return summary;
  }

  calculateOverallScore(summary) {
    if (summary.totalFiles === 0) return 0;
    
    // Weight validation and guardian scores
    const validationScore = (summary.validation.good * 100 + summary.validation.minor * 70 + summary.validation.major * 40) / summary.totalFiles;
    const guardianScore = (summary.guardian.approved * 100 + summary.guardian.conditional * 60) / summary.totalFiles;
    
    // Combined score (60% validation, 40% guardian)
    return Math.round(validationScore * 0.6 + guardianScore * 0.4);
  }

  generateMarkdownReport(results, context) {
    const summary = this.generateSummary(results);
    
    let markdown = `# Comprehensive Code Review Report

**Context:** ${context}  
**Generated:** ${new Date().toISOString()}  
**Overall Score:** ${this.calculateOverallScore(summary)}%

## Summary

| Metric | Value |
|--------|-------|
| Files Reviewed | ${summary.totalFiles} |
| Successful Reviews | ${summary.successful} |
| Failed Reviews | ${summary.failed} |
| Total Duration | ${summary.totalDuration}ms |

### Validation Results
| Rating | Count |
|--------|-------|
| 🟢 Good | ${summary.validation.good} |
| 🟡 Minor Changes | ${summary.validation.minor} |
| 🔴 Major Changes | ${summary.validation.major} |
| ❌ Failed | ${summary.validation.failed} |

### Guardian Results
| Decision | Count |
|----------|-------|
| ✅ Approved | ${summary.guardian.approved} |
| 🟡 Conditional | ${summary.guardian.conditional} |
| 🚫 Rejected | ${summary.guardian.rejected} |
| ❌ Failed | ${summary.guardian.failed} |

## Detailed Results

`;

    results.forEach((result, index) => {
      markdown += `### Review ${index + 1}\n\n`;
      
      if (result.success) {
        const validatorData = result.results.validator?.data;
        const guardianData = result.results.guardian?.data;
        
        markdown += `**Duration:** ${result.duration || 'N/A'}ms\n\n`;
        
        if (validatorData) {
          markdown += `**Validation:** ${validatorData.rating}\n`;
          markdown += `**Issues:** ${validatorData.summary?.totalIssues || 0}\n\n`;
        }
        
        if (guardianData) {
          markdown += `**Guardian:** ${guardianData.decision}\n`;
          markdown += `**Violations:** ${guardianData.summary?.totalViolations || 0}\n\n`;
        }
      } else {
        markdown += `**Status:** Failed\n`;
        markdown += `**Error:** ${result.error}\n\n`;
      }
      
      markdown += '---\n\n';
    });

    return markdown;
  }

  writeOutput(content, outputPath) {
    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      console.log(`📝 Report saved to: ${outputPath}`);
    } else {
      console.log('\n' + content);
    }
  }

  printHelp() {
    console.log(`
📋 Comprehensive Code Review CLI

Usage:
  node scripts/agents/orchestrate-review.js [options]

Options:
  --file <path>         Review specific file
  --staged              Review staged files
  --recent              Review recent changes
  --output, -o <path>   Output file path
  --format, -f <type>   Output format (console, json, markdown)
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  # Review specific file
  node scripts/agents/orchestrate-review.js --file src/components/AudioPlayer.tsx

  # Review staged files
  node scripts/agents/orchestrate-review.js --staged --verbose

  # Review recent changes with report
  node scripts/agents/orchestrate-review.js --recent --format markdown --output reports/review.md
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ReviewOrchestrator();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = ReviewOrchestrator;