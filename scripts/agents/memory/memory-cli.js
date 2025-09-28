#!/usr/bin/env node

/**
 * Memory Agent CLI - Command line interface for memory management and analytics
 * Usage: node scripts/agents/memory/memory-cli.js [action] [options]
 */

require('dotenv').config({ path: '.env.local' });

const EnhancedMemoryAgent = require('./EnhancedMemoryAgent');
const AgentOrchestrator = require('../core/AgentOrchestrator');
const fs = require('fs');
const path = require('path');

class MemoryCLI {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.memoryAgent = new EnhancedMemoryAgent();
    
    // Register agent with orchestrator
    this.orchestrator.registerAgent(this.memoryAgent);
  }

  async run(args) {
    const options = this.parseArgs(args);
    
    try {
      console.log('🚀 Starting Memory Agent...\n');
      
      switch (options.action) {
        case 'analyze':
          await this.runAnalysis(options);
          break;
          
        case 'patterns':
          await this.showPatterns(options);
          break;
          
        case 'search':
          await this.searchMemory(options);
          break;
          
        case 'learn':
          await this.runLearning(options);
          break;
          
        case 'optimize':
          await this.runOptimization(options);
          break;
          
        case 'stats':
          await this.showStatistics(options);
          break;
          
        case 'export':
          await this.exportMemory(options);
          break;
          
        case 'import':
          await this.importMemory(options);
          break;
          
        case 'clean':
          await this.cleanMemory(options);
          break;
          
        default:
          await this.showDashboard(options);
      }
      
    } catch (error) {
      console.error('❌ Memory operation failed:', error.message);
      process.exit(1);
    }
  }

  parseArgs(args) {
    const options = {
      action: 'dashboard',
      analysisType: 'comprehensive',
      query: null,
      output: null,
      format: 'console',
      verbose: false,
      limit: 10,
      timeframe: 'all'
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === 'analyze' || arg === 'patterns' || arg === 'search' || 
          arg === 'learn' || arg === 'optimize' || arg === 'stats' || 
          arg === 'export' || arg === 'import' || arg === 'clean') {
        options.action = arg;
      } else if (arg === '--type' || arg === '-t') {
        options.analysisType = args[++i];
      } else if (arg === '--query' || arg === '-q') {
        options.query = args[++i];
      } else if (arg === '--output' || arg === '-o') {
        options.output = args[++i];
      } else if (arg === '--format' || arg === '-f') {
        options.format = args[++i];
      } else if (arg === '--limit' || arg === '-l') {
        options.limit = parseInt(args[++i]) || 10;
      } else if (arg === '--timeframe') {
        options.timeframe = args[++i];
      } else if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      } else if (arg === '--help' || arg === '-h') {
        this.printHelp();
        process.exit(0);
      }
    }

    return options;
  }

  async showDashboard(options) {
    console.log('🧠 Memory Agent Dashboard');
    console.log('='.repeat(50));

    // Get memory statistics
    const result = await this.memoryAgent.execute({ action: 'ANALYZE', analysisType: 'comprehensive' });
    
    if (result.success) {
      const analysis = result.analysis;
      
      console.log('\n📊 Memory Overview:');
      console.log(`   Total Entries: ${analysis.memoryStats?.totalEntries || 0}`);
      console.log(`   Index Size: ${analysis.memoryStats?.indexSize || 0} terms`);
      console.log(`   Patterns: ${analysis.memoryStats?.patternsCount || 0} recognized`);
      
      if (analysis.performance) {
        console.log(`\n⚡ Performance:`);
        console.log(`   Average Relevance: ${Math.round((analysis.performance.averageRelevance || 0) * 100)}%`);
        console.log(`   Learning Effectiveness: ${Math.round((analysis.performance.learningEffectiveness || 0) * 100)}%`);
      }
      
      if (analysis.patterns) {
        console.log(`\n🎯 Pattern Highlights:`);
        const topPatterns = analysis.patterns.slice(0, 3);
        topPatterns.forEach((pattern, i) => {
          console.log(`   ${i + 1}. ${pattern.description} (${Math.round(pattern.confidence * 100)}% confidence)`);
        });
      }
      
      if (analysis.insights && analysis.insights.length > 0) {
        console.log(`\n💡 Key Insights:`);
        analysis.insights.slice(0, 3).forEach((insight, i) => {
          console.log(`   ${i + 1}. ${insight}`);
        });
      }
      
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        console.log(`\n🚀 Recommendations:`);
        analysis.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
      }
    } else {
      console.log('❌ Failed to load memory dashboard');
    }
  }

  async runAnalysis(options) {
    console.log(`🔍 Running ${options.analysisType} analysis...`);
    
    const result = await this.memoryAgent.execute({
      action: 'ANALYZE',
      analysisType: options.analysisType
    });

    if (result.success) {
      this.outputAnalysis(result.analysis, options);
    } else {
      console.error('❌ Analysis failed:', result.error);
    }
  }

  async showPatterns(options) {
    console.log('🎯 Recognized Patterns');
    console.log('='.repeat(50));

    // Get pattern analysis
    const result = await this.memoryAgent.execute({
      action: 'ANALYZE',
      analysisType: 'patterns'
    });

    if (result.success && result.analysis.patterns) {
      const patterns = result.analysis.patterns;
      
      if (patterns.length === 0) {
        console.log('ℹ️  No patterns found. Memory needs more data for pattern recognition.');
        return;
      }

      console.log(`\nFound ${patterns.length} patterns:\n`);

      patterns.forEach((pattern, index) => {
        console.log(`${index + 1}. ${this.getPatternEmoji(pattern.type)} ${pattern.description}`);
        console.log(`   Type: ${pattern.type}`);
        console.log(`   Confidence: ${Math.round(pattern.confidence * 100)}%`);
        console.log(`   Frequency: ${pattern.frequency} occurrences`);
        
        if (pattern.actionable) {
          console.log(`   🚨 Action Required: ${pattern.recommendation || 'Review this pattern'}`);
        }
        
        console.log('');
      });

      // Summary
      const actionablePatterns = patterns.filter(p => p.actionable);
      const highConfidencePatterns = patterns.filter(p => p.confidence > 0.8);
      
      console.log('📋 Pattern Summary:');
      console.log(`   High Confidence: ${highConfidencePatterns.length}`);
      console.log(`   Actionable: ${actionablePatterns.length}`);
      console.log(`   Average Confidence: ${Math.round(patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length * 100)}%`);
    }
  }

  async searchMemory(options) {
    if (!options.query) {
      console.log('❌ Please provide a search query with --query');
      return;
    }

    console.log(`🔍 Searching memory for: "${options.query}"`);
    
    const result = await this.memoryAgent.execute({
      action: 'RETRIEVE',
      queryContext: options.query
    });

    if (result.success && result.retrieved) {
      const retrieved = result.retrieved;
      
      console.log(`\n📋 Search Results: ${retrieved.totalFound} found\n`);
      
      if (retrieved.totalFound === 0) {
        console.log('ℹ️  No results found.');
        
        if (retrieved.suggestions) {
          console.log('\n💡 Suggestions:');
          retrieved.suggestions.forEach((suggestion, i) => {
            console.log(`   ${i + 1}. ${suggestion}`);
          });
        }
        return;
      }

      retrieved.entries.slice(0, options.limit).forEach((result, index) => {
        console.log(`${index + 1}. Relevance: ${Math.round(result.relevanceScore * 100)}%`);
        console.log(`   ID: ${result.id}`);
        console.log(`   Type: ${result.entry.type || 'unknown'}`);
        console.log(`   Timestamp: ${new Date(result.entry.timestamp).toLocaleString()}`);
        
        if (result.entry.context?.fileName) {
          console.log(`   File: ${result.entry.context.fileName}`);
        }
        
        if (result.entry.semanticTags) {
          console.log(`   Tags: ${result.entry.semanticTags.slice(0, 5).join(', ')}`);
        }
        
        console.log('');
      });

      if (retrieved.searchMetrics) {
        console.log('📊 Search Metrics:');
        console.log(`   Total Searched: ${retrieved.searchMetrics.totalSearched}`);
        console.log(`   Average Relevance: ${Math.round((retrieved.searchMetrics.averageRelevance || 0) * 100)}%`);
        console.log(`   Search Time: ${retrieved.searchMetrics.searchTime || 'N/A'}ms`);
      }
    }
  }

  async runLearning(options) {
    console.log('🧠 Running continuous learning...');
    
    const result = await this.memoryAgent.execute({
      action: 'LEARN'
    });

    if (result.success && result.learning) {
      const learning = result.learning;
      
      console.log(`\n✅ Learning completed: ${learning.learningActions.length} actions taken`);
      console.log(`📈 Total improvements: ${learning.improvements.length}`);
      console.log(`🎯 Learning effectiveness: ${Math.round((learning.metrics?.learningEffectiveness || 0) * 100)}%`);

      if (options.verbose && learning.improvements.length > 0) {
        console.log('\n📋 Improvements made:');
        learning.improvements.slice(0, 10).forEach((improvement, i) => {
          console.log(`   ${i + 1}. ${improvement.type}: ${improvement.reason || improvement.action || 'Applied'}`);
        });
      }
    } else {
      console.error('❌ Learning failed:', result.error);
    }
  }

  async runOptimization(options) {
    console.log('⚡ Running memory optimization...');
    
    const result = await this.memoryAgent.execute({
      action: 'OPTIMIZE'
    });

    if (result.success && result.optimization) {
      const optimization = result.optimization;
      
      console.log(`\n✅ Optimization completed: ${optimization.actions?.length || 0} actions taken`);
      
      if (optimization.actions && optimization.actions.length > 0) {
        console.log('\n📋 Actions taken:');
        optimization.actions.forEach((action, i) => {
          console.log(`   ${i + 1}. ${action}`);
        });
      }
    } else {
      console.error('❌ Optimization failed:', result.error);
    }
  }

  async showStatistics(options) {
    console.log('📊 Memory Statistics');
    console.log('='.repeat(50));
    
    // Get comprehensive analysis
    const result = await this.memoryAgent.execute({
      action: 'ANALYZE',
      analysisType: 'comprehensive'
    });

    if (result.success && result.analysis) {
      const analysis = result.analysis;
      
      // Memory stats
      if (analysis.memoryStats) {
        console.log('\n🧠 Memory Overview:');
        Object.entries(analysis.memoryStats).forEach(([key, value]) => {
          console.log(`   ${this.formatStatKey(key)}: ${this.formatStatValue(value)}`);
        });
      }
      
      // Performance stats
      if (analysis.performance) {
        console.log('\n⚡ Performance Metrics:');
        Object.entries(analysis.performance).forEach(([key, value]) => {
          if (typeof value !== 'object') {
            console.log(`   ${this.formatStatKey(key)}: ${this.formatStatValue(value)}`);
          }
        });
      }
      
      // Quality stats
      if (analysis.quality) {
        console.log('\n🎯 Quality Metrics:');
        Object.entries(analysis.quality).forEach(([key, value]) => {
          if (typeof value !== 'object' && key !== 'qualityTrends') {
            console.log(`   ${this.formatStatKey(key)}: ${this.formatStatValue(value)}`);
          }
        });
      }
      
      // Pattern stats
      if (analysis.patterns && analysis.patterns.length > 0) {
        console.log('\n🔍 Pattern Statistics:');
        const patternTypes = {};
        analysis.patterns.forEach(p => {
          patternTypes[p.type] = (patternTypes[p.type] || 0) + 1;
        });
        
        Object.entries(patternTypes).forEach(([type, count]) => {
          console.log(`   ${this.formatStatKey(type)}: ${count} patterns`);
        });
      }
    }
  }

  outputAnalysis(analysis, options) {
    if (options.format === 'json') {
      const output = JSON.stringify(analysis, null, 2);
      this.writeOutput(output, options.output);
    } else {
      this.printAnalysis(analysis, options);
    }
  }

  printAnalysis(analysis, options) {
    console.log(`\n📊 ${analysis.type.toUpperCase()} ANALYSIS RESULTS`);
    console.log('='.repeat(60));
    
    // Show each analysis section
    Object.entries(analysis).forEach(([key, value]) => {
      if (key === 'type' || key === 'timestamp') return;
      
      console.log(`\n📋 ${this.formatStatKey(key)}:`);
      
      if (Array.isArray(value)) {
        if (value.length === 0) {
          console.log('   (No data)');
        } else {
          value.slice(0, options.verbose ? 20 : 5).forEach((item, i) => {
            if (typeof item === 'object') {
              console.log(`   ${i + 1}. ${item.description || item.message || JSON.stringify(item).substring(0, 100)}`);
            } else {
              console.log(`   ${i + 1}. ${item}`);
            }
          });
          
          if (value.length > (options.verbose ? 20 : 5)) {
            console.log(`   ... and ${value.length - (options.verbose ? 20 : 5)} more`);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          console.log(`   ${this.formatStatKey(subKey)}: ${this.formatStatValue(subValue)}`);
        });
      } else {
        console.log(`   ${this.formatStatValue(value)}`);
      }
    });
  }

  getPatternEmoji(type) {
    const emojis = {
      outcome: '🎯',
      filetype: '📁',
      error: '🚨',
      performance: '⚡',
      quality: '✨',
      security: '🔒'
    };
    return emojis[type] || '🔍';
  }

  formatStatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/_/g, ' ');
  }

  formatStatValue(value) {
    if (typeof value === 'number') {
      if (value < 1 && value > 0) {
        return Math.round(value * 100) + '%';
      }
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? '✅ Yes' : '❌ No';
    }
    return String(value);
  }

  writeOutput(content, outputPath) {
    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      console.log(`📝 Output saved to: ${outputPath}`);
    } else {
      console.log(content);
    }
  }

  printHelp() {
    console.log(`
🧠 Memory Agent CLI

Usage:
  node scripts/agents/memory/memory-cli.js [action] [options]

Actions:
  dashboard         Show memory dashboard (default)
  analyze           Run memory analysis
  patterns          Show recognized patterns
  search            Search memory entries
  learn             Run continuous learning
  optimize          Optimize memory storage
  stats             Show detailed statistics
  export            Export memory data
  import            Import memory data
  clean             Clean old memory entries

Options:
  --type, -t <type>     Analysis type (comprehensive, patterns, performance, quality, trends)
  --query, -q <query>   Search query
  --output, -o <path>   Output file path
  --format, -f <type>   Output format (console, json)
  --limit, -l <num>     Limit results (default: 10)
  --timeframe <period>  Time period (all, week, month, year)
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  # Show dashboard
  node scripts/agents/memory/memory-cli.js

  # Analyze patterns
  node scripts/agents/memory/memory-cli.js analyze --type patterns

  # Search for specific content
  node scripts/agents/memory/memory-cli.js search --query "audio component"

  # Run learning and optimization
  node scripts/agents/memory/memory-cli.js learn
  node scripts/agents/memory/memory-cli.js optimize

  # Export analysis to file
  node scripts/agents/memory/memory-cli.js analyze --format json --output reports/memory-analysis.json
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new MemoryCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = MemoryCLI;