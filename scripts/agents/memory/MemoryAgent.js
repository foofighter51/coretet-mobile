#!/usr/bin/env node

/**
 * Memory Agent - Knowledge Management and Context Preservation
 * Stores execution history, patterns, and provides context for future reviews
 */

const BaseAgent = require('../core/BaseAgent');
const fs = require('fs');
const path = require('path');

class MemoryAgent extends BaseAgent {
  constructor(options = {}) {
    super('memory', {
      type: 'knowledge-management',
      version: '1.0.0',
      description: 'Knowledge management and context preservation agent',
      priority: 0,
      timeout: 30000,
      retryAttempts: 3,
      dependencies: [],
      ...options
    });

    // Memory storage configuration
    this.memoryPath = path.join(__dirname, '../memory/agent-memory.json');
    this.agentMemory = this.loadMemory();

    console.log('🧠 Memory Agent initialized');
  }

  async execute(context) {
    const { action = 'STORE', dataToStore, queryContext } = context;
    
    console.log(`🧠 Memory operation: ${action}`);

    const result = {
      action,
      timestamp: new Date().toISOString(),
      success: true
    };

    try {
      switch (action) {
        case 'STORE':
          result.stored = await this.storeData(dataToStore, context);
          break;
        
        case 'RETRIEVE':
          result.retrieved = await this.retrieveData(queryContext, context);
          break;
        
        case 'ANALYZE':
          result.analysis = await this.analyzePatterns(context);
          break;
        
        default:
          // Default action is to store the execution context
          result.stored = await this.storeExecutionContext(context);
      }

      // Always save memory after operations
      this.saveMemory();

      return result;

    } catch (error) {
      console.error(`❌ Memory operation failed:`, error.message);
      
      result.success = false;
      result.error = error.message;
      
      return result;
    }
  }

  async storeData(data, context) {
    if (!data) {
      return this.storeExecutionContext(context);
    }

    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: context.dataType || 'execution',
      data: this.sanitizeData(data),
      context: this.extractRelevantContext(context),
      relevanceScore: this.calculateRelevanceScore(data, context)
    };

    if (!this.agentMemory.entries) {
      this.agentMemory.entries = [];
    }

    this.agentMemory.entries.push(entry);
    
    // Keep only last 1000 entries
    if (this.agentMemory.entries.length > 1000) {
      this.agentMemory.entries = this.agentMemory.entries.slice(-1000);
    }

    return {
      entryId: entry.id,
      stored: true,
      entriesCount: this.agentMemory.entries.length
    };
  }

  async retrieveData(query, context) {
    if (!this.agentMemory.entries || this.agentMemory.entries.length === 0) {
      return {
        found: false,
        message: 'No data in memory'
      };
    }

    // Simple retrieval for now - could be enhanced with more sophisticated matching
    const relevantEntries = this.agentMemory.entries
      .filter(entry => this.matchesQuery(entry, query))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Top 10 most relevant

    return {
      found: relevantEntries.length > 0,
      entries: relevantEntries,
      totalFound: relevantEntries.length
    };
  }

  async analyzePatterns(context) {
    if (!this.agentMemory.entries || this.agentMemory.entries.length === 0) {
      return {
        patterns: [],
        insights: ['Insufficient data for pattern analysis']
      };
    }

    const patterns = [];
    const insights = [];

    // Analyze execution patterns
    const executionEntries = this.agentMemory.entries.filter(e => e.type === 'execution');
    if (executionEntries.length > 5) {
      const successRate = executionEntries.filter(e => e.data.success).length / executionEntries.length;
      patterns.push({
        type: 'success-rate',
        value: successRate,
        description: `Overall success rate: ${Math.round(successRate * 100)}%`
      });

      if (successRate < 0.8) {
        insights.push('Success rate is below 80% - consider investigating common failure patterns');
      }
    }

    // Analyze file type patterns
    const fileTypes = {};
    executionEntries.forEach(entry => {
      if (entry.context && entry.context.fileName) {
        const ext = path.extname(entry.context.fileName);
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    });

    patterns.push({
      type: 'file-types',
      value: fileTypes,
      description: 'File type distribution in processed files'
    });

    return {
      patterns,
      insights,
      totalEntries: this.agentMemory.entries.length
    };
  }

  async storeExecutionContext(context) {
    const executionData = {
      fileName: context.fileName,
      changeType: context.changeType,
      workflowId: context.workflowId,
      timestamp: context.timestamp,
      success: context.success !== false, // Default to true unless explicitly false
      agents: context.agents || [],
      results: context.results ? this.summarizeResults(context.results) : null
    };

    return this.storeData(executionData, {
      ...context,
      dataType: 'execution'
    });
  }

  summarizeResults(results) {
    const summary = {};
    
    Object.entries(results).forEach(([agentName, result]) => {
      summary[agentName] = {
        success: result.success,
        duration: result.duration,
        hasData: !!result.data,
        timestamp: result.timestamp
      };
      
      // Extract key metrics without storing full data
      if (result.data) {
        if (result.data.rating) summary[agentName].rating = result.data.rating;
        if (result.data.decision) summary[agentName].decision = result.data.decision;
        if (result.data.summary) summary[agentName].summary = result.data.summary;
      }
    });
    
    return summary;
  }

  matchesQuery(entry, query) {
    if (!query) return true;
    
    // Simple text matching - could be enhanced
    const searchText = JSON.stringify(entry).toLowerCase();
    const queryText = JSON.stringify(query).toLowerCase();
    
    return searchText.includes(queryText);
  }

  calculateRelevanceScore(data, context) {
    let score = 5; // Base score
    
    // Recent data is more relevant
    const age = Date.now() - new Date(context.timestamp || Date.now()).getTime();
    const daysSinceCreation = age / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - daysSinceCreation); // Up to 5 bonus points for recent data
    
    // Success results are more relevant for learning
    if (data && data.success) {
      score += 2;
    }
    
    // File-specific data gets relevance boost
    if (context.fileName) {
      score += 1;
    }
    
    return Math.min(10, score); // Cap at 10
  }

  extractRelevantContext(context) {
    return {
      fileName: context.fileName,
      changeType: context.changeType,
      workflowId: context.workflowId,
      timestamp: context.timestamp
    };
  }

  sanitizeData(data) {
    // Remove sensitive information
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Remove potentially large or sensitive fields
      delete sanitized.codeContent;
      delete sanitized.fullResults;
      delete sanitized.rawResponse;
      
      return sanitized;
    }
    
    return data;
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️  Could not load memory, starting fresh:', error.message);
    }
    
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      entries: [],
      metadata: {
        totalExecutions: 0,
        lastCleanup: new Date().toISOString()
      }
    };
  }

  saveMemory() {
    try {
      const memoryDir = path.dirname(this.memoryPath);
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }
      
      this.agentMemory.metadata.lastUpdate = new Date().toISOString();
      this.agentMemory.metadata.totalEntries = this.agentMemory.entries?.length || 0;
      
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.agentMemory, null, 2));
    } catch (error) {
      console.error('❌ Failed to save memory:', error.message);
    }
  }

  generateId() {
    return `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCapabilities() {
    return [
      ...super.getCapabilities(),
      'data-storage',
      'pattern-analysis',
      'context-retrieval',
      'execution-tracking',
      'learning-integration'
    ];
  }

  // Clean old entries
  async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    if (!this.agentMemory.entries) return;
    
    const cutoff = Date.now() - maxAge;
    const originalCount = this.agentMemory.entries.length;
    
    this.agentMemory.entries = this.agentMemory.entries.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime > cutoff;
    });
    
    const removed = originalCount - this.agentMemory.entries.length;
    if (removed > 0) {
      console.log(`🧹 Memory cleanup: removed ${removed} old entries`);
      this.saveMemory();
    }
  }
}

module.exports = MemoryAgent;