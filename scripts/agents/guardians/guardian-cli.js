#!/usr/bin/env node

/**
 * Guardian Agent CLI - Command line interface for architectural enforcement
 * Usage: node scripts/agents/guardians/guardian-cli.js [file] [options]
 */

require('dotenv').config({ path: '.env.local' });

const GuardianAgent = require('./GuardianAgent');
const AgentOrchestrator = require('../core/AgentOrchestrator');
const fs = require('fs');
const path = require('path');

class GuardianCLI {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.guardianAgent = new GuardianAgent();
    
    // Register agent with orchestrator
    this.orchestrator.registerAgent(this.guardianAgent);
  }

  async run(args) {
    const options = this.parseArgs(args);
    
    try {
      console.log('🚀 Starting Guardian Agent...\n');
      
      if (options.file) {
        await this.guardFile(options.file, options);
      } else if (options.staged) {
        await this.guardStaged(options);
      } else if (options.recent) {
        await this.guardRecent(options);
      } else {
        await this.guardAll(options);
      }
      
    } catch (error) {
      console.error('❌ Guardian analysis failed:', error.message);
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
      verbose: false,
      strict: false
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
      } else if (arg === '--strict') {
        options.strict = true;
      } else if (arg === '--help' || arg === '-h') {
        this.printHelp();
        process.exit(0);
      } else if (!arg.startsWith('--') && !options.file) {
        options.file = arg;
      }
    }

    return options;
  }

  async guardFile(filePath, options) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Guarding file: ${filePath}`);
    
    const codeContent = fs.readFileSync(filePath, 'utf8');
    
    const context = {
      fileName: filePath,
      codeContent,
      changeType: 'file-guardian-check',
      timestamp: new Date().toISOString()
    };

    const result = await this.guardianAgent.execute(context);
    
    await this.outputResults([result], options);
  }

  async guardStaged(options) {
    console.log('📋 Guarding staged files...');
    
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

      console.log(`Found ${stagedFiles.length} staged files to guard`);
      
      const results = [];
      
      for (const file of stagedFiles) {
        if (fs.existsSync(file)) {
          console.log(`\n🛡️  Guarding: ${file}`);
          
          const codeContent = fs.readFileSync(file, 'utf8');
          const context = {
            fileName: file,
            codeContent,
            changeType: 'staged-guardian-check'
          };
          
          const result = await this.guardianAgent.execute(context);
          results.push(result);
          
          // Quick status
          console.log(`   ${this.getDecisionEmoji(result.decision)} ${result.decision} (${result.summary?.totalViolations || 0} violations)`);
          
          // Show critical violations immediately
          if (result.decision === 'REJECT' && options.verbose) {
            const criticals = result.violations.filter(v => v.severity === 'critical');
            criticals.forEach(v => console.log(`     🚨 ${v.message}`));
          }
        }
      }
      
      await this.outputResults(results, options);
      
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error.message}`);
    }
  }

  async guardRecent(options) {
    console.log('📅 Guarding recent changes...');
    
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
        console.log(`\n🛡️  Guarding: ${file}`);
        
        const codeContent = fs.readFileSync(file, 'utf8');
        const context = {
          fileName: file,
          codeContent,
          changeType: 'recent-guardian-check'
        };
        
        const result = await this.guardianAgent.execute(context);
        results.push(result);
        
        console.log(`   ${this.getDecisionEmoji(result.decision)} ${result.decision} (${result.summary?.totalViolations || 0} violations)`);
      }
      
      await this.outputResults(results, options);
      
    } catch (error) {
      throw new Error(`Failed to get recent files: ${error.message}`);
    }
  }

  async guardAll(options) {
    console.log('🌍 Guarding entire codebase...');
    
    const glob = require('glob');
    
    const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', {
      ignore: [
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/**/__tests__/**',
        '**/*.d.ts'
      ]
    });

    if (files.length === 0) {
      console.log('ℹ️  No files found to guard');
      return;
    }

    console.log(`Found ${files.length} files to guard`);
    
    const results = [];
    
    // Process in smaller batches for Guardian (more intensive analysis)
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`);
      
      const batchPromises = batch.map(async (file) => {
        console.log(`🛡️  Guarding: ${file}`);
        
        const codeContent = fs.readFileSync(file, 'utf8');
        const context = {
          fileName: file,
          codeContent,
          changeType: 'full-guardian-check'
        };
        
        const result = await this.guardianAgent.execute(context);
        console.log(`   ${this.getDecisionEmoji(result.decision)} ${result.decision}`);
        
        return result;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    await this.outputResults(results, options);
  }

  getDecisionEmoji(decision) {
    switch (decision) {
      case 'APPROVE': return '✅';
      case 'CONDITIONAL': return '🟡';
      case 'REJECT': return '🚫';
      default: return '❓';
    }
  }

  async outputResults(results, options) {
    const report = this.generateReport(results);
    
    if (options.format === 'json') {
      const output = JSON.stringify({ report, results }, null, 2);
      this.writeOutput(output, options.output);
    } else if (options.format === 'markdown') {
      const output = this.generateMarkdownReport(report, results);
      this.writeOutput(output, options.output);
    } else {
      this.printConsoleReport(report, results, options.verbose, options.strict);
    }
  }

  generateReport(results) {
    const summary = {
      totalFiles: results.length,
      approved: 0,
      conditional: 0,
      rejected: 0,
      failed: 0,
      totalViolations: 0,
      criticalViolations: 0,
      warnings: 0
    };

    results.forEach(result => {
      switch (result.decision) {
        case 'APPROVE':
          summary.approved++;
          break;
        case 'CONDITIONAL':
          summary.conditional++;
          break;
        case 'REJECT':
          summary.rejected++;
          break;
        default:
          summary.failed++;
      }
      
      if (result.summary) {
        summary.totalViolations += result.summary.totalViolations || 0;
        summary.criticalViolations += result.summary.criticalViolations || 0;
        summary.warnings += result.summary.totalWarnings || 0;
      }
    });

    summary.approvalRate = summary.totalFiles > 0 ? 
      Math.round((summary.approved / summary.totalFiles) * 100) : 0;

    return summary;
  }

  printConsoleReport(report, results, verbose, strict) {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  GUARDIAN ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Files Analyzed: ${report.totalFiles}`);
    console.log(`✅ Approved: ${report.approved}`);
    console.log(`🟡 Conditional: ${report.conditional}`);
    console.log(`🚫 Rejected: ${report.rejected}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`📈 Approval Rate: ${report.approvalRate}%`);
    
    console.log(`\n🚨 Violation Summary:`);
    console.log(`   Total Violations: ${report.totalViolations}`);
    console.log(`   Critical: ${report.criticalViolations}`);
    console.log(`   Warnings: ${report.warnings}`);

    if (verbose) {
      console.log('\n📋 Detailed Results:');
      results.forEach(result => {
        console.log(`\n📁 ${result.fileName}`);
        console.log(`   Decision: ${this.getDecisionEmoji(result.decision)} ${result.decision}`);
        
        if (result.summary) {
          console.log(`   Violations: ${result.summary.totalViolations} (${result.summary.criticalViolations} critical)`);
        }
        
        if (result.aiAnalysis && result.aiAnalysis.reasoning) {
          console.log(`   AI Reasoning: ${result.aiAnalysis.reasoning.substring(0, 100)}...`);
        }
        
        // Show critical violations
        const criticals = result.violations?.filter(v => v.severity === 'critical') || [];
        if (criticals.length > 0) {
          console.log(`   Critical Issues:`);
          criticals.forEach(v => console.log(`     🚨 ${v.message}`));
        }
      });
    }

    // Overall assessment
    console.log('\n' + '='.repeat(60));
    if (report.criticalViolations === 0 && report.rejected === 0) {
      console.log('🌟 All files passed architectural validation!');
    } else if (report.criticalViolations > 0) {
      console.log('🚨 Critical architectural violations detected - immediate attention required');
    } else if (report.conditional > report.approved) {
      console.log('⚠️  Multiple files require architectural improvements');
    } else {
      console.log('👍 Good architectural compliance with room for improvement');
    }
    
    if (strict && (report.rejected > 0 || report.criticalViolations > 0)) {
      console.log('\n🛑 STRICT MODE: Exiting with error code due to violations');
      process.exit(1);
    }
    
    console.log('='.repeat(60));
  }

  generateMarkdownReport(report, results) {
    let markdown = `# Guardian Analysis Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|-------|
| Files Analyzed | ${report.totalFiles} |
| Approved | ${report.approved} |
| Conditional | ${report.conditional} |
| Rejected | ${report.rejected} |
| Failed | ${report.failed} |
| Approval Rate | ${report.approvalRate}% |
| Total Violations | ${report.totalViolations} |
| Critical Violations | ${report.criticalViolations} |
| Warnings | ${report.warnings} |

## Detailed Results

`;

    results.forEach(result => {
      markdown += `### ${result.fileName}\n\n`;
      markdown += `**Decision:** ${result.decision}\n\n`;
      
      if (result.summary) {
        markdown += `**Violations:** ${result.summary.totalViolations} (${result.summary.criticalViolations} critical)\n\n`;
      }
      
      if (result.aiAnalysis && result.aiAnalysis.reasoning) {
        markdown += `**AI Analysis:** ${result.aiAnalysis.reasoning}\n\n`;
      }
      
      // List violations
      if (result.violations && result.violations.length > 0) {
        markdown += `**Issues:**\n`;
        result.violations.forEach((violation, index) => {
          const severity = violation.severity === 'critical' ? '🚨' : '⚠️';
          markdown += `${index + 1}. ${severity} **${violation.rule}**: ${violation.message}\n`;
        });
        markdown += '\n';
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
🛡️  Guardian Agent CLI

Usage:
  node scripts/agents/guardians/guardian-cli.js [file] [options]

Options:
  --staged              Guard staged files
  --recent              Guard recent changes
  --output, -o <path>   Output file path
  --format, -f <type>   Output format (console, json, markdown)
  --verbose, -v         Verbose output with violation details
  --strict              Exit with error code if violations found
  --help, -h            Show this help

Examples:
  # Guard specific file
  node scripts/agents/guardians/guardian-cli.js src/components/AudioPlayer.tsx

  # Guard staged files with strict enforcement
  node scripts/agents/guardians/guardian-cli.js --staged --strict

  # Guard recent changes with detailed report
  node scripts/agents/guardians/guardian-cli.js --recent --verbose --format markdown --output reports/guardian.md

  # Full codebase architectural analysis
  node scripts/agents/guardians/guardian-cli.js --verbose
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new GuardianCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = GuardianCLI;