#!/usr/bin/env node

/**
 * Validator Agent CLI - Command line interface for running validation
 * Usage: node scripts/agents/validators/validator-cli.js [file] [options]
 */

require('dotenv').config({ path: '.env.local' });

const ValidatorAgent = require('./ValidatorAgent');
const AgentOrchestrator = require('../core/AgentOrchestrator');
const fs = require('fs');
const path = require('path');

class ValidatorCLI {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.validatorAgent = new ValidatorAgent();
    
    // Register agent with orchestrator
    this.orchestrator.registerAgent(this.validatorAgent);
  }

  async run(args) {
    const options = this.parseArgs(args);
    
    try {
      console.log('🚀 Starting Validator Agent...\n');
      
      if (options.file) {
        await this.validateFile(options.file, options);
      } else if (options.staged) {
        await this.validateStaged(options);
      } else if (options.recent) {
        await this.validateRecent(options);
      } else {
        await this.validateAll(options);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
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

  async validateFile(filePath, options) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Validating file: ${filePath}`);
    
    const codeContent = fs.readFileSync(filePath, 'utf8');
    
    const context = {
      fileName: filePath,
      codeContent,
      changeType: 'file-validation',
      timestamp: new Date().toISOString()
    };

    const result = await this.validatorAgent.execute(context);
    
    await this.outputResults([result], options);
  }

  async validateStaged(options) {
    console.log('📋 Validating staged files...');
    
    // Get staged files
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

      console.log(`Found ${stagedFiles.length} staged files to validate`);
      
      const results = [];
      
      for (const file of stagedFiles) {
        if (fs.existsSync(file)) {
          console.log(`\n🔍 Validating: ${file}`);
          
          const codeContent = fs.readFileSync(file, 'utf8');
          const context = {
            fileName: file,
            codeContent,
            changeType: 'staged-validation'
          };
          
          const result = await this.validatorAgent.execute(context);
          results.push(result);
          
          // Quick status
          console.log(`   ${result.rating} (${result.summary?.totalIssues || 0} issues)`);
        }
      }
      
      await this.outputResults(results, options);
      
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error.message}`);
    }
  }

  async validateRecent(options) {
    console.log('📅 Validating recent changes...');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      // Get files changed in last commit
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
        console.log(`\n🔍 Validating: ${file}`);
        
        const codeContent = fs.readFileSync(file, 'utf8');
        const context = {
          fileName: file,
          codeContent,
          changeType: 'recent-validation'
        };
        
        const result = await this.validatorAgent.execute(context);
        results.push(result);
        
        console.log(`   ${result.rating} (${result.summary?.totalIssues || 0} issues)`);
      }
      
      await this.outputResults(results, options);
      
    } catch (error) {
      throw new Error(`Failed to get recent files: ${error.message}`);
    }
  }

  async validateAll(options) {
    console.log('🌍 Validating entire codebase...');
    
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
      console.log('ℹ️  No files found to validate');
      return;
    }

    console.log(`Found ${files.length} files to validate`);
    
    const results = [];
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`);
      
      const batchPromises = batch.map(async (file) => {
        console.log(`🔍 Validating: ${file}`);
        
        const codeContent = fs.readFileSync(file, 'utf8');
        const context = {
          fileName: file,
          codeContent,
          changeType: 'full-validation'
        };
        
        const result = await this.validatorAgent.execute(context);
        console.log(`   ${result.rating}`);
        
        return result;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    await this.outputResults(results, options);
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
      // Console output
      this.printConsoleReport(report, results, options.verbose);
    }
  }

  generateReport(results) {
    const summary = {
      totalFiles: results.length,
      passed: 0,
      needsMinorChanges: 0,
      needsMajorChanges: 0,
      failed: 0,
      totalIssues: 0,
      totalErrors: 0,
      totalWarnings: 0
    };

    results.forEach(result => {
      if (result.rating?.includes('Good')) {
        summary.passed++;
      } else if (result.rating?.includes('Minor')) {
        summary.needsMinorChanges++;
      } else if (result.rating?.includes('Major')) {
        summary.needsMajorChanges++;
      } else {
        summary.failed++;
      }
      
      if (result.summary) {
        summary.totalIssues += result.summary.totalIssues || 0;
        summary.totalErrors += result.summary.errors || 0;
        summary.totalWarnings += result.summary.warnings || 0;
      }
    });

    summary.successRate = summary.totalFiles > 0 ? 
      Math.round((summary.passed / summary.totalFiles) * 100) : 0;

    return summary;
  }

  printConsoleReport(report, results, verbose) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Files Analyzed: ${report.totalFiles}`);
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`🟡 Needs Minor Changes: ${report.needsMinorChanges}`);
    console.log(`🔴 Needs Major Changes: ${report.needsMajorChanges}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`📈 Success Rate: ${report.successRate}%`);
    
    console.log(`\n🔍 Issue Summary:`);
    console.log(`   Total Issues: ${report.totalIssues}`);
    console.log(`   Errors: ${report.totalErrors}`);
    console.log(`   Warnings: ${report.totalWarnings}`);

    if (verbose) {
      console.log('\n📋 Detailed Results:');
      results.forEach(result => {
        console.log(`\n📁 ${result.fileName}`);
        console.log(`   Rating: ${result.rating}`);
        if (result.summary) {
          console.log(`   Issues: ${result.summary.totalIssues}`);
        }
        if (result.aiAnalysis && result.aiAnalysis.summary) {
          console.log(`   AI Summary: ${result.aiAnalysis.summary}`);
        }
      });
    }

    // Overall assessment
    console.log('\n' + '='.repeat(60));
    if (report.successRate >= 90) {
      console.log('🌟 Excellent code quality! Keep up the great work.');
    } else if (report.successRate >= 70) {
      console.log('👍 Good code quality with room for improvement.');
    } else if (report.successRate >= 50) {
      console.log('⚠️  Code quality needs attention.');
    } else {
      console.log('🚨 Significant code quality issues detected.');
    }
    console.log('='.repeat(60));
  }

  generateMarkdownReport(report, results) {
    let markdown = `# Code Validation Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|-------|
| Files Analyzed | ${report.totalFiles} |
| Passed | ${report.passed} |
| Needs Minor Changes | ${report.needsMinorChanges} |
| Needs Major Changes | ${report.needsMajorChanges} |
| Failed | ${report.failed} |
| Success Rate | ${report.successRate}% |
| Total Issues | ${report.totalIssues} |
| Errors | ${report.totalErrors} |
| Warnings | ${report.totalWarnings} |

## Detailed Results

`;

    results.forEach(result => {
      markdown += `### ${result.fileName}\n\n`;
      markdown += `**Rating:** ${result.rating}\n\n`;
      
      if (result.summary) {
        markdown += `**Issues:** ${result.summary.totalIssues}\n\n`;
      }
      
      if (result.aiAnalysis && result.aiAnalysis.summary) {
        markdown += `**AI Analysis:** ${result.aiAnalysis.summary}\n\n`;
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
🔍 Validator Agent CLI

Usage:
  node scripts/agents/validators/validator-cli.js [file] [options]

Options:
  --staged              Validate staged files
  --recent              Validate recent changes
  --output, -o <path>   Output file path
  --format, -f <type>   Output format (console, json, markdown)
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  # Validate specific file
  node scripts/agents/validators/validator-cli.js src/components/AudioPlayer.tsx

  # Validate staged files
  node scripts/agents/validators/validator-cli.js --staged

  # Validate recent changes with markdown output
  node scripts/agents/validators/validator-cli.js --recent --format markdown --output reports/validation.md

  # Full codebase validation
  node scripts/agents/validators/validator-cli.js
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ValidatorCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = ValidatorCLI;