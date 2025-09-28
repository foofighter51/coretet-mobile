#!/usr/bin/env node

/**
 * Enhanced Memory Agent - Advanced Knowledge Management and Learning System
 * Sophisticated pattern recognition, context retrieval, and continuous learning
 */

const BaseAgent = require('../core/BaseAgent');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnhancedMemoryAgent extends BaseAgent {
  constructor(options = {}) {
    super('memory', {
      type: 'knowledge-management',
      version: '2.0.0',
      description: 'Advanced knowledge management and continuous learning agent',
      priority: 0,
      timeout: 60000,
      retryAttempts: 3,
      dependencies: [],
      ...options
    });

    // Memory storage configuration
    this.memoryPath = path.join(__dirname, '../memory/enhanced-memory.json');
    this.indexPath = path.join(__dirname, '../memory/memory-index.json');
    this.patternsPath = path.join(__dirname, '../memory/patterns.json');
    
    // Learning configuration (before loading memory)
    this.learningConfig = {
      patternRecognition: {
        minOccurrences: 3,
        confidenceThreshold: 0.7,
        maxPatterns: 1000
      },
      contextRetrieval: {
        maxResults: 10,
        relevanceThreshold: 0.5,
        timeDecayFactor: 0.1
      },
      compression: {
        enableCompression: true,
        compressionThreshold: 1000, // entries
        retentionPeriod: 90 * 24 * 60 * 60 * 1000 // 90 days
      }
    };

    // Load memory systems after configuration is set
    this.agentMemory = this.loadMemory();
    this.memoryIndex = this.loadIndex();
    this.patterns = this.loadPatterns();

    console.log('🧠 Enhanced Memory Agent initialized');
  }

  async execute(context) {
    const { action = 'STORE', dataToStore, queryContext, analysisType, workflowResults } = context;
    
    console.log(`🧠 Memory operation: ${action}`);

    const result = {
      action,
      timestamp: new Date().toISOString(),
      success: true,
      metadata: {
        totalEntries: this.agentMemory.entries?.length || 0,
        indexSize: Object.keys(this.memoryIndex.terms || {}).length,
        patternsCount: this.patterns.recognized?.length || 0
      }
    };

    try {
      switch (action) {
        case 'STORE':
          // If we have workflow results, store them; otherwise store the provided data
          const dataToStoreActual = workflowResults || dataToStore;
          if (dataToStoreActual) {
            result.stored = await this.storeWithLearning(dataToStoreActual, context);
          } else {
            console.warn('⚠️  No data to store in memory');
            result.stored = { message: 'No data provided to store', stored: false };
          }
          break;
        
        case 'RETRIEVE':
          result.retrieved = await this.intelligentRetrieve(queryContext, context);
          break;
        
        case 'ANALYZE':
          result.analysis = await this.performAnalysis(analysisType, context);
          break;
          
        case 'LEARN':
          result.learning = await this.continuousLearning(context);
          break;
          
        case 'OPTIMIZE':
          result.optimization = await this.optimizeMemory(context);
          break;
        
        default:
          result.stored = await this.storeExecutionContext(context);
      }

      // Update indices and patterns
      await this.updateIndices();
      await this.recognizePatterns();
      
      // Periodic optimization
      if (Math.random() < 0.1) { // 10% chance
        await this.performMaintenance();
      }

      this.saveAllSystems();

      return result;

    } catch (error) {
      console.error(`❌ Memory operation failed:`, error.message);
      
      result.success = false;
      result.error = error.message;
      
      return result;
    }
  }

  async storeWithLearning(data, context) {
    const entry = await this.createAdvancedEntry(data, context);
    
    // Store entry
    if (!this.agentMemory.entries) {
      this.agentMemory.entries = [];
    }

    this.agentMemory.entries.push(entry);
    
    // Update learning metrics
    this.updateLearningMetrics(entry, context);
    
    // Extract and store patterns immediately
    this.extractImmediatePatterns(entry, context);
    
    // Maintain memory size
    await this.maintainMemorySize();

    // Persist to disk immediately
    this.saveAllSystems();

    return {
      entryId: entry.id,
      stored: true,
      entriesCount: this.agentMemory.entries.length,
      patterns: entry.extractedPatterns,
      relevanceScore: entry.relevanceScore
    };
  }

  async createAdvancedEntry(data, context) {
    const id = this.generateAdvancedId();
    const timestamp = new Date().toISOString();
    
    // Content analysis
    const contentHash = this.createContentHash(data);
    const keywords = this.extractKeywords(data, context);
    const semanticTags = this.generateSemanticTags(data, context);
    
    // Context analysis
    const contextSignature = this.createContextSignature(context);
    const relationships = this.findRelationships(data, context);
    
    // Performance and quality metrics
    const qualityMetrics = this.calculateQualityMetrics(data, context);
    
    return {
      id,
      timestamp,
      contentHash,
      type: this.determineEntryType(data, context),
      
      // Core data (sanitized)
      data: this.sanitizeData(data),
      context: this.extractRelevantContext(context),
      
      // Analysis metadata
      keywords,
      semanticTags,
      contextSignature,
      relationships,
      qualityMetrics,
      
      // Learning features
      extractedPatterns: this.extractPatternsFromData(data, context),
      relevanceScore: this.calculateAdvancedRelevance(data, context),
      confidenceScore: this.calculateConfidence(data, context),
      
      // Lifecycle management
      accessCount: 0,
      lastAccessed: timestamp,
      importance: this.calculateImportance(data, context),
      
      // Compression and indexing
      compressed: false,
      indexed: true
    };
  }

  async intelligentRetrieve(query, context) {
    if (!this.agentMemory.entries || this.agentMemory.entries.length === 0) {
      return {
        found: false,
        message: 'No data in memory',
        suggestions: this.generateRetrievalSuggestions()
      };
    }

    // Multi-dimensional search
    const searchResults = await this.performMultiDimensionalSearch(query, context);
    
    // Rank and filter results
    const rankedResults = this.rankSearchResults(searchResults, query, context);
    const filteredResults = rankedResults
      .filter(r => r.relevanceScore >= this.learningConfig.contextRetrieval.relevanceThreshold)
      .slice(0, this.learningConfig.contextRetrieval.maxResults);

    // Update access patterns
    filteredResults.forEach(result => {
      const entry = this.agentMemory.entries.find(e => e.id === result.id);
      if (entry) {
        entry.accessCount++;
        entry.lastAccessed = new Date().toISOString();
      }
    });

    // Learn from retrieval patterns
    this.learnFromRetrieval(query, filteredResults, context);

    return {
      found: filteredResults.length > 0,
      entries: filteredResults,
      totalFound: filteredResults.length,
      searchMetrics: {
        totalSearched: searchResults.length,
        averageRelevance: this.calculateAverageRelevance(filteredResults),
        searchTime: Date.now() - (context.searchStartTime || Date.now())
      },
      recommendations: this.generateRecommendations(filteredResults, query, context)
    };
  }

  async performMultiDimensionalSearch(query, context) {
    const results = [];
    
    // 1. Content-based search
    const contentMatches = this.searchByContent(query);
    results.push(...contentMatches.map(m => ({ ...m, searchType: 'content' })));
    
    // 2. Semantic search
    const semanticMatches = this.searchBySemantic(query, context);
    results.push(...semanticMatches.map(m => ({ ...m, searchType: 'semantic' })));
    
    // 3. Pattern-based search
    const patternMatches = this.searchByPatterns(query, context);
    results.push(...patternMatches.map(m => ({ ...m, searchType: 'pattern' })));
    
    // 4. Context similarity search
    const contextMatches = this.searchByContext(query, context);
    results.push(...contextMatches.map(m => ({ ...m, searchType: 'context' })));
    
    // 5. Temporal search
    const temporalMatches = this.searchByTemporal(query, context);
    results.push(...temporalMatches.map(m => ({ ...m, searchType: 'temporal' })));
    
    // Deduplicate by entry ID
    const uniqueResults = this.deduplicateSearchResults(results);
    
    return uniqueResults;
  }

  searchByContent(query) {
    const queryStr = typeof query === 'string' ? query.toLowerCase() : JSON.stringify(query).toLowerCase();
    const queryTerms = this.extractSearchTerms(queryStr);
    
    return this.agentMemory.entries
      .map(entry => {
        const contentStr = JSON.stringify(entry).toLowerCase();
        let score = 0;
        let matches = 0;
        
        queryTerms.forEach(term => {
          const termMatches = (contentStr.match(new RegExp(term, 'g')) || []).length;
          if (termMatches > 0) {
            score += termMatches * (term.length / 10); // Weight by term length
            matches++;
          }
        });
        
        const relevanceScore = matches > 0 ? (score / queryTerms.length) * (matches / queryTerms.length) : 0;
        
        return {
          id: entry.id,
          entry,
          relevanceScore: Math.min(1.0, relevanceScore),
          matchType: 'content',
          matches: matches,
          totalTerms: queryTerms.length
        };
      })
      .filter(result => result.relevanceScore > 0);
  }

  searchBySemantic(query, context) {
    const queryTags = this.generateSemanticTags(query, context);
    
    return this.agentMemory.entries
      .map(entry => {
        const commonTags = entry.semanticTags?.filter(tag => queryTags.includes(tag)) || [];
        const relevanceScore = commonTags.length / Math.max(entry.semanticTags?.length || 1, queryTags.length);
        
        return {
          id: entry.id,
          entry,
          relevanceScore,
          matchType: 'semantic',
          commonTags,
          queryTags,
          entryTags: entry.semanticTags
        };
      })
      .filter(result => result.relevanceScore > 0);
  }

  searchByPatterns(query, context) {
    const queryPatterns = this.extractPatternsFromData(query, context);
    
    return this.agentMemory.entries
      .map(entry => {
        const commonPatterns = entry.extractedPatterns?.filter(pattern => 
          queryPatterns.some(qp => this.patternsMatch(pattern, qp))
        ) || [];
        
        const relevanceScore = commonPatterns.length / Math.max(entry.extractedPatterns?.length || 1, queryPatterns.length);
        
        return {
          id: entry.id,
          entry,
          relevanceScore,
          matchType: 'pattern',
          commonPatterns,
          queryPatterns,
          entryPatterns: entry.extractedPatterns
        };
      })
      .filter(result => result.relevanceScore > 0);
  }

  searchByContext(query, context) {
    const contextSig = this.createContextSignature(context);
    
    return this.agentMemory.entries
      .map(entry => {
        const similarity = this.calculateContextSimilarity(contextSig, entry.contextSignature);
        
        return {
          id: entry.id,
          entry,
          relevanceScore: similarity,
          matchType: 'context',
          contextSimilarity: similarity
        };
      })
      .filter(result => result.relevanceScore > 0.3); // Higher threshold for context
  }

  searchByTemporal(query, context) {
    const now = Date.now();
    const timePreference = context.timePreference || 'recent'; // recent, old, any
    
    return this.agentMemory.entries
      .map(entry => {
        const entryTime = new Date(entry.timestamp).getTime();
        const ageInDays = (now - entryTime) / (1000 * 60 * 60 * 24);
        
        let temporalScore = 1.0;
        
        if (timePreference === 'recent') {
          temporalScore = Math.exp(-ageInDays * this.learningConfig.contextRetrieval.timeDecayFactor);
        } else if (timePreference === 'old') {
          temporalScore = Math.min(1.0, ageInDays / 30); // Prefer entries older than 30 days
        }
        
        // Boost frequently accessed entries
        const accessBoost = Math.min(1.0, (entry.accessCount || 0) / 10);
        temporalScore += accessBoost * 0.2;
        
        return {
          id: entry.id,
          entry,
          relevanceScore: Math.min(1.0, temporalScore),
          matchType: 'temporal',
          ageInDays,
          accessCount: entry.accessCount || 0
        };
      })
      .filter(result => result.relevanceScore > 0.1);
  }

  async performAnalysis(analysisType = 'comprehensive', context) {
    const analysis = {
      type: analysisType,
      timestamp: new Date().toISOString(),
      memoryStats: this.getMemoryStatistics(),
      insights: [],
      recommendations: []
    };

    try {
      switch (analysisType) {
        case 'patterns':
          analysis.patterns = await this.analyzePatterns();
          break;
          
        case 'performance':
          analysis.performance = await this.analyzePerformance();
          break;
          
        case 'quality':
          analysis.quality = await this.analyzeQuality();
          break;
          
        case 'trends':
          analysis.trends = await this.analyzeTrends();
          break;
          
        default:
          // Comprehensive analysis
          analysis.patterns = await this.analyzePatterns();
          analysis.performance = await this.analyzePerformance();
          analysis.quality = await this.analyzeQuality();
          analysis.trends = await this.analyzeTrends();
      }

      // Generate insights based on analysis
      analysis.insights = this.generateInsights(analysis);
      analysis.recommendations = this.generateActionableRecommendations(analysis);

    } catch (error) {
      analysis.error = error.message;
      analysis.insights.push(`Analysis failed: ${error.message}`);
    }

    return analysis;
  }

  async recognizePatterns() {
    const newPatterns = [];
    const entries = this.agentMemory.entries || [];
    
    if (entries.length < this.learningConfig.patternRecognition.minOccurrences) {
      return { newPatterns: [], message: 'Insufficient data for pattern recognition' };
    }

    // 1. Success/Failure Patterns
    const outcomePatterns = this.recognizeOutcomePatterns(entries);
    newPatterns.push(...outcomePatterns);
    
    // 2. File Type Patterns
    const fileTypePatterns = this.recognizeFileTypePatterns(entries);
    newPatterns.push(...fileTypePatterns);
    
    // 3. Error Patterns
    const errorPatterns = this.recognizeErrorPatterns(entries);
    newPatterns.push(...errorPatterns);
    
    // 4. Performance Patterns
    const performancePatterns = this.recognizePerformancePatterns(entries);
    newPatterns.push(...performancePatterns);
    
    // 5. Agent Interaction Patterns
    const interactionPatterns = this.recognizeAgentInteractionPatterns(entries);
    newPatterns.push(...interactionPatterns);

    // Filter by confidence and novelty
    const validPatterns = newPatterns.filter(pattern => 
      pattern.confidence >= this.learningConfig.patternRecognition.confidenceThreshold &&
      !this.isPatternKnown(pattern)
    );

    // Update patterns storage
    if (!this.patterns.recognized) this.patterns.recognized = [];
    this.patterns.recognized.push(...validPatterns);
    
    // Maintain pattern limit
    if (this.patterns.recognized.length > this.learningConfig.patternRecognition.maxPatterns) {
      this.patterns.recognized = this.patterns.recognized
        .sort((a, b) => (b.confidence * b.frequency) - (a.confidence * a.frequency))
        .slice(0, this.learningConfig.patternRecognition.maxPatterns);
    }

    this.patterns.lastUpdate = new Date().toISOString();
    
    return {
      newPatterns: validPatterns,
      totalPatterns: this.patterns.recognized.length,
      patternsAdded: validPatterns.length
    };
  }

  // Pattern recognition methods
  recognizeOutcomePatterns(entries) {
    const patterns = [];
    const outcomes = {};
    
    entries.forEach(entry => {
      if (entry.data && typeof entry.data.success !== 'undefined') {
        const key = `${entry.context?.fileName?.split('/').pop() || 'unknown'}_${entry.type}`;
        if (!outcomes[key]) outcomes[key] = { success: 0, failure: 0, total: 0 };
        
        outcomes[key].total++;
        if (entry.data.success) outcomes[key].success++;
        else outcomes[key].failure++;
      }
    });

    Object.entries(outcomes).forEach(([key, data]) => {
      if (data.total >= this.learningConfig.patternRecognition.minOccurrences) {
        const successRate = data.success / data.total;
        patterns.push({
          type: 'outcome',
          pattern: key,
          successRate,
          confidence: Math.min(1.0, data.total / 10),
          frequency: data.total,
          description: `${key}: ${Math.round(successRate * 100)}% success rate`,
          actionable: successRate < 0.8,
          recommendation: successRate < 0.8 ? `Investigate failures in ${key}` : null
        });
      }
    });
    
    return patterns;
  }

  recognizeFileTypePatterns(entries) {
    const patterns = [];
    const fileTypes = {};
    
    entries.forEach(entry => {
      if (entry.context?.fileName) {
        const ext = path.extname(entry.context.fileName);
        if (ext) {
          if (!fileTypes[ext]) fileTypes[ext] = { count: 0, issues: 0, avgQuality: 0 };
          fileTypes[ext].count++;
          
          if (entry.qualityMetrics) {
            fileTypes[ext].avgQuality += entry.qualityMetrics.overall || 0.5;
          }
          
          if (entry.data && (entry.data.violations?.length > 0 || entry.data.issues?.length > 0)) {
            fileTypes[ext].issues++;
          }
        }
      }
    });

    Object.entries(fileTypes).forEach(([ext, data]) => {
      if (data.count >= this.learningConfig.patternRecognition.minOccurrences) {
        const issueRate = data.issues / data.count;
        const avgQuality = data.avgQuality / data.count;
        
        patterns.push({
          type: 'filetype',
          pattern: ext,
          fileType: ext,
          issueRate,
          averageQuality: avgQuality,
          confidence: Math.min(1.0, data.count / 20),
          frequency: data.count,
          description: `${ext} files: ${Math.round((1 - issueRate) * 100)}% clean rate`,
          actionable: issueRate > 0.3,
          recommendation: issueRate > 0.3 ? `Review ${ext} file patterns - high issue rate` : null
        });
      }
    });
    
    return patterns;
  }

  recognizeErrorPatterns(entries) {
    const patterns = [];
    const errors = {};
    
    entries.forEach(entry => {
      if (entry.data && entry.data.error) {
        const errorKey = this.normalizeError(entry.data.error);
        if (!errors[errorKey]) errors[errorKey] = { count: 0, contexts: new Set() };
        errors[errorKey].count++;
        errors[errorKey].contexts.add(entry.context?.changeType || 'unknown');
      }
      
      if (entry.data && entry.data.violations) {
        entry.data.violations.forEach(violation => {
          const violationKey = violation.rule || violation.type || 'unknown-violation';
          if (!errors[violationKey]) errors[violationKey] = { count: 0, contexts: new Set() };
          errors[violationKey].count++;
          errors[violationKey].contexts.add(entry.context?.fileName || 'unknown-file');
        });
      }
    });

    Object.entries(errors).forEach(([errorKey, data]) => {
      if (data.count >= this.learningConfig.patternRecognition.minOccurrences) {
        patterns.push({
          type: 'error',
          pattern: errorKey,
          error: errorKey,
          confidence: Math.min(1.0, data.count / 5),
          frequency: data.count,
          contexts: Array.from(data.contexts),
          description: `Recurring error: ${errorKey} (${data.count} times)`,
          actionable: true,
          recommendation: `Address recurring error pattern: ${errorKey}`
        });
      }
    });
    
    return patterns;
  }

  // Helper methods for pattern recognition
  normalizeError(error) {
    return error
      .toLowerCase()
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/['"`]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  isPatternKnown(newPattern) {
    return this.patterns.recognized?.some(existing => 
      existing.type === newPattern.type && 
      existing.pattern === newPattern.pattern
    ) || false;
  }

  // Utility methods for memory management
  createContentHash(data) {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  extractKeywords(data, context) {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const contextText = JSON.stringify(context);
    const combined = `${text} ${contextText}`;
    
    // Simple keyword extraction - could be enhanced with NLP
    const words = combined
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g) || [];
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ word, frequency: freq }));
  }

  generateSemanticTags(data, context) {
    const tags = new Set();
    
    // Context-based tags
    if (context?.fileName) {
      const pathParts = context.fileName.split('/');
      pathParts.forEach(part => {
        if (part.length > 2) tags.add(`path:${part}`);
      });
      
      const ext = path.extname(context.fileName);
      if (ext) tags.add(`type:${ext.substring(1)}`);
    }
    
    if (context?.changeType) {
      tags.add(`change:${context.changeType}`);
    }
    
    // Data-based tags
    if (data) {
      const dataStr = JSON.stringify(data).toLowerCase();
      
      // Technical tags
      if (dataStr.includes('error')) tags.add('status:error');
      if (dataStr.includes('success')) tags.add('status:success');
      if (dataStr.includes('warning')) tags.add('status:warning');
      
      // Domain tags
      if (dataStr.includes('audio')) tags.add('domain:audio');
      if (dataStr.includes('playlist')) tags.add('domain:playlist');
      if (dataStr.includes('user')) tags.add('domain:user');
      if (dataStr.includes('auth')) tags.add('domain:auth');
      
      // Quality tags
      if (dataStr.includes('violation')) tags.add('quality:violation');
      if (dataStr.includes('security')) tags.add('quality:security');
      if (dataStr.includes('performance')) tags.add('quality:performance');
    }
    
    return Array.from(tags).slice(0, 20); // Limit to 20 tags
  }

  sanitizeData(data) {
    if (!data) return null;
    
    // If data is already a string, return as is
    if (typeof data === 'string') {
      return data.length > 10000 ? data.substring(0, 10000) + '...[truncated]' : data;
    }
    
    // For objects, create a sanitized copy
    try {
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Remove sensitive information
      const removeKeys = ['password', 'key', 'token', 'secret', 'credential'];
      const cleanObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (removeKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            cleaned[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            cleaned[key] = cleanObject(value);
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };
      
      return cleanObject(sanitized);
    } catch (error) {
      return { error: 'Failed to sanitize data', type: typeof data };
    }
  }

  extractRelevantContext(context) {
    if (!context) return {};
    
    // Extract only relevant context fields
    const relevantFields = [
      'fileName', 'changeType', 'timestamp', 'workflowId', 
      'codeContent', 'workflowResults'
    ];
    
    const extracted = {};
    relevantFields.forEach(field => {
      if (context[field] !== undefined) {
        if (field === 'codeContent' && typeof context[field] === 'string') {
          // Truncate large code content
          extracted[field] = context[field].length > 5000 
            ? context[field].substring(0, 5000) + '...[truncated]'
            : context[field];
        } else {
          extracted[field] = context[field];
        }
      }
    });
    
    return extracted;
  }

  determineEntryType(data, context) {
    if (context?.workflowResults) {
      return 'workflow-results';
    } else if (context?.fileName) {
      return 'file-analysis';
    } else if (data?.error) {
      return 'error-report';
    } else {
      return 'general-data';
    }
  }

  createContextSignature(context) {
    const relevant = this.extractRelevantContext(context);
    const signature = Object.keys(relevant).sort().join('|');
    return crypto.createHash('md5').update(signature).digest('hex').substring(0, 8);
  }

  findRelationships(data, context) {
    const relationships = [];
    
    if (context?.fileName) {
      relationships.push({
        type: 'file',
        target: context.fileName,
        strength: 1.0
      });
    }
    
    if (context?.workflowId) {
      relationships.push({
        type: 'workflow',
        target: context.workflowId,
        strength: 0.8
      });
    }
    
    return relationships;
  }

  calculateQualityMetrics(data, context) {
    let overall = 0.5; // Default score
    const factors = [];
    
    // Context completeness
    if (context?.fileName) factors.push({ name: 'has-filename', score: 0.2 });
    if (context?.workflowResults) factors.push({ name: 'has-workflow-results', score: 0.3 });
    if (context?.timestamp) factors.push({ name: 'has-timestamp', score: 0.1 });
    
    // Data completeness
    if (data && Object.keys(data).length > 0) {
      factors.push({ name: 'has-data', score: 0.2 });
    }
    
    overall = factors.reduce((sum, factor) => sum + factor.score, 0.3);
    
    return {
      overall: Math.min(1.0, overall),
      factors,
      timestamp: new Date().toISOString()
    };
  }

  extractPatternsFromData(data, context) {
    const patterns = [];
    
    if (context?.workflowResults) {
      const results = context.workflowResults;
      Object.keys(results).forEach(agentName => {
        patterns.push({
          type: 'agent-result',
          agent: agentName,
          pattern: `workflow-agent-${agentName}`,
          confidence: 0.8
        });
      });
    }
    
    if (data?.error) {
      patterns.push({
        type: 'error',
        pattern: 'error-occurrence',
        confidence: 0.9
      });
    }
    
    return patterns;
  }

  calculateAdvancedRelevance(data, context) {
    let relevance = 0.5; // Base relevance
    
    // Recent data is more relevant
    if (context?.timestamp) {
      const age = Date.now() - new Date(context.timestamp).getTime();
      const ageInHours = age / (1000 * 60 * 60);
      if (ageInHours < 24) relevance += 0.2;
      else if (ageInHours < 168) relevance += 0.1; // 1 week
    }
    
    // Workflow results are highly relevant
    if (context?.workflowResults) relevance += 0.3;
    
    // Error data is important
    if (data?.error) relevance += 0.2;
    
    return Math.min(1.0, relevance);
  }

  calculateConfidence(data, context) {
    let confidence = 0.7; // Base confidence
    
    // More complete data = higher confidence
    if (data && Object.keys(data).length > 5) confidence += 0.1;
    if (context && Object.keys(context).length > 3) confidence += 0.1;
    
    // Structured data = higher confidence
    if (context?.workflowResults) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  calculateImportance(data, context) {
    let importance = 0.5; // Base importance
    
    // Workflow results are important
    if (context?.workflowResults) importance += 0.3;
    
    // Errors are important
    if (data?.error) importance += 0.2;
    
    // Recent data is more important
    if (context?.timestamp) {
      const age = Date.now() - new Date(context.timestamp).getTime();
      const ageInHours = age / (1000 * 60 * 60);
      if (ageInHours < 1) importance += 0.2;
    }
    
    return Math.min(1.0, importance);
  }

  // Save all memory systems
  saveAllSystems() {
    this.saveMemory();
    this.saveIndex();
    this.savePatterns();
  }

  saveMemory() {
    try {
      // Ensure agentMemory is initialized
      if (!this.agentMemory) {
        console.warn('⚠️  agentMemory not initialized, cannot save');
        return;
      }

      const memoryDir = path.dirname(this.memoryPath);
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }
      
      // Ensure metadata object exists
      if (!this.agentMemory.metadata) {
        this.agentMemory.metadata = {};
      }

      this.agentMemory.metadata = {
        ...this.agentMemory.metadata,
        lastUpdate: new Date().toISOString(),
        totalEntries: this.agentMemory.entries?.length || 0,
        version: '2.0.0'
      };
      
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.agentMemory, null, 2));
    } catch (error) {
      console.error('❌ Failed to save memory:', error.message);
    }
  }

  saveIndex() {
    try {
      if (!this.memoryIndex) {
        console.warn('⚠️  memoryIndex not initialized, cannot save');
        return;
      }
      fs.writeFileSync(this.indexPath, JSON.stringify(this.memoryIndex, null, 2));
    } catch (error) {
      console.error('❌ Failed to save index:', error.message);
    }
  }

  savePatterns() {
    try {
      if (!this.patterns) {
        console.warn('⚠️  patterns not initialized, cannot save');
        return;
      }
      fs.writeFileSync(this.patternsPath, JSON.stringify(this.patterns, null, 2));
    } catch (error) {
      console.error('❌ Failed to save patterns:', error.message);
    }
  }

  // Load memory systems
  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load enhanced memory, starting fresh:', error.message);
    }
    
    return {
      version: '2.0.0',
      created: new Date().toISOString(),
      entries: [],
      metadata: {
        totalExecutions: 0,
        lastCleanup: new Date().toISOString(),
        compressionEnabled: this.learningConfig.compression.enableCompression
      }
    };
  }

  loadIndex() {
    try {
      if (fs.existsSync(this.indexPath)) {
        return JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load memory index, starting fresh:', error.message);
    }
    
    return {
      terms: {},
      tags: {},
      patterns: {},
      lastUpdate: new Date().toISOString()
    };
  }

  loadPatterns() {
    try {
      if (fs.existsSync(this.patternsPath)) {
        return JSON.parse(fs.readFileSync(this.patternsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load patterns, starting fresh:', error.message);
    }
    
    return {
      recognized: [],
      confidence: {},
      trends: {},
      lastUpdate: new Date().toISOString()
    };
  }

  // Learning integration and feedback loops
  async continuousLearning(context) {
    const learning = {
      timestamp: new Date().toISOString(),
      learningActions: [],
      improvements: [],
      metrics: {}
    };

    try {
      // 1. Update relevance scores based on access patterns
      const relevanceUpdates = this.updateRelevanceFromAccess();
      learning.learningActions.push('relevance-scoring');
      learning.improvements.push(...relevanceUpdates);

      // 2. Learn from successful patterns
      const patternLearning = await this.learnFromSuccessfulPatterns();
      learning.learningActions.push('pattern-learning');
      learning.improvements.push(...patternLearning);

      // 3. Adapt search algorithms based on usage
      const searchAdaptation = this.adaptSearchAlgorithms(context);
      learning.learningActions.push('search-adaptation');
      learning.improvements.push(...searchAdaptation);

      // 4. Update quality predictions
      const qualityLearning = this.learnQualityPredictions();
      learning.learningActions.push('quality-learning');
      learning.improvements.push(...qualityLearning);

      learning.metrics = {
        totalImprovements: learning.improvements.length,
        learningEffectiveness: this.calculateLearningEffectiveness()
      };

    } catch (error) {
      learning.error = error.message;
    }

    return learning;
  }

  updateRelevanceFromAccess() {
    const improvements = [];
    
    this.agentMemory.entries?.forEach(entry => {
      if (entry.accessCount > 0) {
        const oldRelevance = entry.relevanceScore;
        const accessBoost = Math.min(0.3, entry.accessCount / 100);
        entry.relevanceScore = Math.min(1.0, oldRelevance + accessBoost);
        
        if (entry.relevanceScore > oldRelevance) {
          improvements.push({
            type: 'relevance-boost',
            entryId: entry.id,
            oldScore: oldRelevance,
            newScore: entry.relevanceScore,
            reason: `Boosted due to ${entry.accessCount} accesses`
          });
        }
      }
    });

    return improvements;
  }

  async learnFromSuccessfulPatterns() {
    const improvements = [];
    const successPatterns = this.patterns.recognized?.filter(p => 
      p.type === 'outcome' && p.successRate > 0.8
    ) || [];

    successPatterns.forEach(pattern => {
      // Boost relevance of entries that match successful patterns
      this.agentMemory.entries?.forEach(entry => {
        if (this.entryMatchesPattern(entry, pattern)) {
          const oldRelevance = entry.relevanceScore;
          entry.relevanceScore = Math.min(1.0, oldRelevance * 1.1);
          
          improvements.push({
            type: 'success-pattern-boost',
            entryId: entry.id,
            pattern: pattern.pattern,
            oldScore: oldRelevance,
            newScore: entry.relevanceScore
          });
        }
      });
    });

    return improvements;
  }

  adaptSearchAlgorithms(context) {
    const improvements = [];
    
    // Analyze which search types are most effective
    const searchEffectiveness = this.analyzeSearchEffectiveness();
    
    Object.entries(searchEffectiveness).forEach(([searchType, effectiveness]) => {
      if (effectiveness.successRate > 0.8) {
        // This search type is effective - could boost its weight in future searches
        improvements.push({
          type: 'search-algorithm-adaptation',
          searchType,
          effectiveness: effectiveness.successRate,
          action: 'increase-weight'
        });
      } else if (effectiveness.successRate < 0.3) {
        improvements.push({
          type: 'search-algorithm-adaptation',
          searchType,
          effectiveness: effectiveness.successRate,
          action: 'decrease-weight'
        });
      }
    });

    return improvements;
  }

  learnQualityPredictions() {
    const improvements = [];
    
    // Analyze correlation between entry quality metrics and actual outcomes
    const qualityCorrelations = this.analyzeQualityCorrelations();
    
    Object.entries(qualityCorrelations).forEach(([metric, correlation]) => {
      if (Math.abs(correlation) > 0.7) {
        improvements.push({
          type: 'quality-prediction-learning',
          metric,
          correlation,
          action: correlation > 0 ? 'positive-indicator' : 'negative-indicator'
        });
      }
    });

    return improvements;
  }

  // Performance analysis methods
  async analyzePerformance() {
    const entries = this.agentMemory.entries || [];
    const now = Date.now();
    
    return {
      memorySize: entries.length,
      averageRelevance: this.calculateAverageRelevance(entries),
      accessPatterns: this.analyzeAccessPatterns(entries),
      storageEfficiency: this.calculateStorageEfficiency(),
      retrievalPerformance: this.calculateRetrievalPerformance(),
      learningEffectiveness: this.calculateLearningEffectiveness(),
      recommendations: this.generatePerformanceRecommendations()
    };
  }

  async analyzeQuality() {
    const entries = this.agentMemory.entries || [];
    
    const qualityMetrics = {
      totalEntries: entries.length,
      highQualityEntries: entries.filter(e => (e.qualityMetrics?.overall || 0) > 0.8).length,
      averageQuality: 0,
      qualityTrends: this.analyzeQualityTrends(entries),
      topQualityPatterns: this.identifyTopQualityPatterns(),
      qualityIssues: this.identifyQualityIssues()
    };

    if (entries.length > 0) {
      const totalQuality = entries.reduce((sum, e) => sum + (e.qualityMetrics?.overall || 0.5), 0);
      qualityMetrics.averageQuality = totalQuality / entries.length;
    }

    return qualityMetrics;
  }

  async analyzeTrends() {
    const entries = this.agentMemory.entries || [];
    const timeWindows = this.createTimeWindows(entries);
    
    return {
      volumeTrends: this.analyzeVolumeTrends(timeWindows),
      qualityTrends: this.analyzeQualityTrends(entries),
      patternTrends: this.analyzePatternTrends(),
      successTrends: this.analyzeSuccessTrends(timeWindows),
      predictions: this.generateTrendPredictions()
    };
  }

  // Utility methods for analysis
  entryMatchesPattern(entry, pattern) {
    if (pattern.type === 'outcome') {
      const entryKey = `${entry.context?.fileName?.split('/').pop() || 'unknown'}_${entry.type}`;
      return entryKey === pattern.pattern;
    }
    
    if (pattern.type === 'filetype') {
      const ext = path.extname(entry.context?.fileName || '');
      return ext === pattern.pattern;
    }
    
    return false;
  }

  analyzeSearchEffectiveness() {
    // Placeholder - would track actual search performance metrics
    return {
      content: { successRate: 0.7, avgRelevance: 0.6 },
      semantic: { successRate: 0.8, avgRelevance: 0.7 },
      pattern: { successRate: 0.75, avgRelevance: 0.65 },
      context: { successRate: 0.65, avgRelevance: 0.55 },
      temporal: { successRate: 0.6, avgRelevance: 0.5 }
    };
  }

  analyzeQualityCorrelations() {
    // Placeholder - would analyze actual correlations
    return {
      relevanceScore: 0.8,
      accessCount: 0.6,
      importance: 0.7,
      confidenceScore: 0.75
    };
  }

  calculateLearningEffectiveness() {
    const patterns = this.patterns.recognized || [];
    const actionablePatterns = patterns.filter(p => p.actionable);
    
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const actionableRatio = actionablePatterns.length / patterns.length;
    
    return (avgConfidence + actionableRatio) / 2;
  }

  // Memory optimization and maintenance
  async performMaintenance() {
    console.log('🧹 Performing memory maintenance...');
    
    const maintenance = {
      timestamp: new Date().toISOString(),
      actions: []
    };

    // 1. Clean expired entries
    const beforeCount = this.agentMemory.entries?.length || 0;
    await this.cleanExpiredEntries();
    const afterCount = this.agentMemory.entries?.length || 0;
    
    if (beforeCount > afterCount) {
      maintenance.actions.push(`Cleaned ${beforeCount - afterCount} expired entries`);
    }

    // 2. Compress old entries
    const compressed = await this.compressOldEntries();
    if (compressed > 0) {
      maintenance.actions.push(`Compressed ${compressed} old entries`);
    }

    // 3. Update indices
    await this.updateIndices();
    maintenance.actions.push('Updated search indices');

    // 4. Optimize patterns
    const patternsBefore = this.patterns.recognized?.length || 0;
    this.optimizePatterns();
    const patternsAfter = this.patterns.recognized?.length || 0;
    
    if (patternsBefore !== patternsAfter) {
      maintenance.actions.push(`Optimized patterns: ${patternsBefore} -> ${patternsAfter}`);
    }

    console.log(`✅ Memory maintenance complete: ${maintenance.actions.length} actions taken`);
    
    return maintenance;
  }

  async cleanExpiredEntries() {
    if (!this.agentMemory.entries) return;
    
    const maxAge = this.learningConfig.compression.retentionPeriod;
    const cutoff = Date.now() - maxAge;
    const originalCount = this.agentMemory.entries.length;
    
    this.agentMemory.entries = this.agentMemory.entries.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      const isRecent = entryTime > cutoff;
      const isImportant = (entry.importance || 0) > 0.8;
      const isFrequentlyAccessed = (entry.accessCount || 0) > 10;
      
      return isRecent || isImportant || isFrequentlyAccessed;
    });
    
    const removed = originalCount - this.agentMemory.entries.length;
    if (removed > 0) {
      console.log(`🗑️  Cleaned ${removed} expired entries`);
    }
  }

  async compressOldEntries() {
    let compressed = 0;
    
    if (!this.learningConfig.compression.enableCompression) return compressed;
    
    const compressionAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const cutoff = Date.now() - compressionAge;
    
    this.agentMemory.entries?.forEach(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      
      if (entryTime < cutoff && !entry.compressed) {
        // Compress entry by removing detailed data but keeping summary
        if (entry.data) {
          entry.originalDataSize = JSON.stringify(entry.data).length;
          entry.data = this.createDataSummary(entry.data);
          entry.compressed = true;
          compressed++;
        }
      }
    });
    
    return compressed;
  }

  createDataSummary(data) {
    return {
      compressed: true,
      summary: {
        success: data.success,
        rating: data.rating,
        decision: data.decision,
        issueCount: data.issues?.length || data.violations?.length || 0,
        type: typeof data
      }
    };
  }

  async updateIndices() {
    if (!this.agentMemory.entries) return;
    
    // Reset indices
    this.memoryIndex.terms = {};
    this.memoryIndex.tags = {};
    this.memoryIndex.patterns = {};
    
    // Rebuild indices
    this.agentMemory.entries.forEach(entry => {
      // Index keywords
      entry.keywords?.forEach(kw => {
        if (!this.memoryIndex.terms[kw.word]) {
          this.memoryIndex.terms[kw.word] = [];
        }
        this.memoryIndex.terms[kw.word].push(entry.id);
      });
      
      // Index semantic tags
      entry.semanticTags?.forEach(tag => {
        if (!this.memoryIndex.tags[tag]) {
          this.memoryIndex.tags[tag] = [];
        }
        this.memoryIndex.tags[tag].push(entry.id);
      });
      
      // Index patterns
      entry.extractedPatterns?.forEach(pattern => {
        const key = `${pattern.type}:${pattern.pattern}`;
        if (!this.memoryIndex.patterns[key]) {
          this.memoryIndex.patterns[key] = [];
        }
        this.memoryIndex.patterns[key].push(entry.id);
      });
    });
    
    this.memoryIndex.lastUpdate = new Date().toISOString();
  }

  optimizePatterns() {
    if (!this.patterns.recognized) return;
    
    // Remove low-confidence patterns that haven't proven useful
    this.patterns.recognized = this.patterns.recognized.filter(pattern => {
      const isHighConfidence = pattern.confidence >= this.learningConfig.patternRecognition.confidenceThreshold;
      const isFrequent = pattern.frequency >= this.learningConfig.patternRecognition.minOccurrences;
      const isActionable = pattern.actionable;
      
      return isHighConfidence && (isFrequent || isActionable);
    });
    
    // Sort by effectiveness (confidence * frequency)
    this.patterns.recognized.sort((a, b) => {
      const aScore = a.confidence * Math.log(a.frequency + 1);
      const bScore = b.confidence * Math.log(b.frequency + 1);
      return bScore - aScore;
    });
  }

  // Additional helper methods
  async maintainMemorySize() {
    const maxEntries = this.learningConfig.compression.compressionThreshold;
    
    if (this.agentMemory.entries && this.agentMemory.entries.length > maxEntries) {
      // Sort by importance and recency, keep the most valuable entries
      this.agentMemory.entries.sort((a, b) => {
        const aScore = (a.importance || 0.5) * (a.relevanceScore || 0.5) * Math.log(a.accessCount + 1);
        const bScore = (b.importance || 0.5) * (b.relevanceScore || 0.5) * Math.log(b.accessCount + 1);
        return bScore - aScore;
      });
      
      const removedCount = this.agentMemory.entries.length - maxEntries;
      this.agentMemory.entries = this.agentMemory.entries.slice(0, maxEntries);
      
      console.log(`📦 Maintained memory size: removed ${removedCount} lower-value entries`);
    }
  }

  // Missing utility methods implementation
  determineEntryType(data, context) {
    if (context?.workflowId) return 'workflow-execution';
    if (context?.fileName) return 'file-analysis';
    if (data?.error) return 'error';
    if (data?.success !== undefined) return 'execution-result';
    return 'general';
  }

  calculateAdvancedRelevance(data, context) {
    let score = 0.5; // Base relevance
    
    // Context relevance
    if (context?.fileName) score += 0.1;
    if (context?.changeType) score += 0.1;
    if (context?.workflowId) score += 0.1;
    
    // Data quality relevance
    if (data && typeof data === 'object') {
      if (data.success !== undefined) score += 0.1;
      if (data.issues || data.violations) score += 0.1;
      if (data.rating || data.decision) score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  calculateConfidence(data, context) {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for structured data
    if (data && typeof data === 'object') {
      if (data.success !== undefined) confidence += 0.1;
      if (data.timestamp) confidence += 0.05;
      if (data.summary) confidence += 0.1;
    }
    
    // Context adds confidence
    if (context?.fileName) confidence += 0.05;
    if (context?.workflowId) confidence += 0.05;
    
    return Math.min(1.0, confidence);
  }

  calculateQualityMetrics(data, context) {
    return {
      completeness: this.calculateCompleteness(data, context),
      accuracy: this.calculateAccuracy(data, context),
      relevance: this.calculateAdvancedRelevance(data, context),
      timeliness: this.calculateTimeliness(context),
      overall: 0.5 // Will be calculated as average
    };
  }

  calculateCompleteness(data, context) {
    let score = 0.5;
    
    if (data) score += 0.2;
    if (context?.fileName) score += 0.1;
    if (context?.timestamp) score += 0.1;
    if (data?.summary) score += 0.1;
    
    return Math.min(1.0, score);
  }

  calculateAccuracy(data, context) {
    // Placeholder - would be enhanced with actual accuracy checks
    return data && typeof data === 'object' ? 0.8 : 0.6;
  }

  calculateTimeliness(context) {
    if (!context?.timestamp) return 0.5;
    
    const age = Date.now() - new Date(context.timestamp).getTime();
    const hoursAge = age / (1000 * 60 * 60);
    
    if (hoursAge < 1) return 1.0;
    if (hoursAge < 24) return 0.9;
    if (hoursAge < 168) return 0.7; // 1 week
    return 0.5;
  }

  createContextSignature(context) {
    const sig = {
      fileType: context?.fileName ? path.extname(context.fileName) : null,
      domain: this.extractDomain(context),
      changeType: context?.changeType || null,
      hasWorkflow: !!context?.workflowId
    };
    
    return JSON.stringify(sig);
  }

  extractDomain(context) {
    const fileName = context?.fileName || '';
    if (fileName.includes('/audio/')) return 'audio';
    if (fileName.includes('/playlist/')) return 'playlist';
    if (fileName.includes('/auth/')) return 'auth';
    if (fileName.includes('/api/')) return 'api';
    return 'general';
  }

  findRelationships(data, context) {
    const relationships = [];
    
    // File relationships
    if (context?.fileName) {
      const dir = path.dirname(context.fileName);
      relationships.push({ type: 'directory', value: dir });
      
      const ext = path.extname(context.fileName);
      if (ext) relationships.push({ type: 'filetype', value: ext });
    }
    
    // Data relationships
    if (data && typeof data === 'object') {
      if (data.rating) relationships.push({ type: 'quality', value: data.rating });
      if (data.decision) relationships.push({ type: 'decision', value: data.decision });
    }
    
    return relationships;
  }

  calculateImportance(data, context) {
    let importance = 0.5;
    
    // Error data is important
    if (data?.error || data?.violations?.length > 0) importance += 0.3;
    
    // Successful patterns are moderately important
    if (data?.success && data?.rating?.includes('Good')) importance += 0.1;
    
    // API routes are important
    if (context?.fileName?.includes('/api/')) importance += 0.2;
    
    return Math.min(1.0, importance);
  }

  extractPatternsFromData(data, context) {
    const patterns = [];
    
    if (data && context) {
      // File pattern
      if (context.fileName) {
        patterns.push({
          type: 'file',
          pattern: path.extname(context.fileName),
          confidence: 0.9
        });
      }
      
      // Success pattern
      if (data.success !== undefined) {
        patterns.push({
          type: 'outcome',
          pattern: data.success ? 'success' : 'failure',
          confidence: 0.8
        });
      }
      
      // Quality pattern
      if (data.rating) {
        patterns.push({
          type: 'quality',
          pattern: data.rating,
          confidence: 0.7
        });
      }
    }
    
    return patterns;
  }

  updateLearningMetrics(entry, context) {
    if (!this.agentMemory.metadata.learningMetrics) {
      this.agentMemory.metadata.learningMetrics = {
        totalEntries: 0,
        successRate: 0,
        averageQuality: 0,
        patternCount: 0
      };
    }
    
    const metrics = this.agentMemory.metadata.learningMetrics;
    metrics.totalEntries++;
    
    if (entry.data?.success) {
      metrics.successRate = (metrics.successRate * (metrics.totalEntries - 1) + 1) / metrics.totalEntries;
    } else if (entry.data?.success === false) {
      metrics.successRate = (metrics.successRate * (metrics.totalEntries - 1)) / metrics.totalEntries;
    }
    
    if (entry.qualityMetrics?.overall) {
      metrics.averageQuality = (metrics.averageQuality * (metrics.totalEntries - 1) + entry.qualityMetrics.overall) / metrics.totalEntries;
    }
    
    metrics.patternCount = entry.extractedPatterns?.length || 0;
  }

  extractImmediatePatterns(entry, context) {
    // Look for immediate patterns that can be recognized
    const patterns = entry.extractedPatterns || [];
    
    // Check against existing patterns for reinforcement
    patterns.forEach(pattern => {
      const existingPattern = this.patterns.recognized?.find(p => 
        p.type === pattern.type && p.pattern === pattern.pattern
      );
      
      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.confidence = Math.min(1.0, existingPattern.confidence + 0.05);
      }
    });
  }

  // Search utility methods
  extractSearchTerms(queryStr) {
    return queryStr
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .slice(0, 10); // Limit search terms
  }

  deduplicateSearchResults(results) {
    const seen = new Set();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  }

  rankSearchResults(results, query, context) {
    return results
      .map(result => {
        // Combine different search type scores
        let finalScore = result.relevanceScore;
        
        // Boost based on search type effectiveness
        const typeBoosts = {
          semantic: 1.2,
          pattern: 1.15,
          content: 1.1,
          context: 1.05,
          temporal: 1.0
        };
        
        finalScore *= (typeBoosts[result.searchType] || 1.0);
        
        // Boost based on access history
        if (result.entry.accessCount > 0) {
          finalScore *= (1 + Math.min(0.5, result.entry.accessCount / 20));
        }
        
        return {
          ...result,
          relevanceScore: Math.min(1.0, finalScore)
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  calculateAverageRelevance(results) {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / results.length;
  }

  calculateContextSimilarity(sig1, sig2) {
    if (!sig1 || !sig2) return 0;
    
    try {
      const ctx1 = typeof sig1 === 'string' ? JSON.parse(sig1) : sig1;
      const ctx2 = typeof sig2 === 'string' ? JSON.parse(sig2) : sig2;
      
      let score = 0;
      let total = 0;
      
      Object.keys(ctx1).forEach(key => {
        total++;
        if (ctx1[key] === ctx2[key]) score++;
      });
      
      return total > 0 ? score / total : 0;
    } catch (error) {
      return 0;
    }
  }

  patternsMatch(p1, p2) {
    return p1.type === p2.type && p1.pattern === p2.pattern;
  }

  learnFromRetrieval(query, results, context) {
    // Learn from what users search for and find useful
    results.forEach(result => {
      if (result.relevanceScore > 0.7) {
        // This was a good match, reinforce it
        const entry = this.agentMemory.entries.find(e => e.id === result.id);
        if (entry) {
          entry.relevanceScore = Math.min(1.0, entry.relevanceScore * 1.02);
        }
      }
    });
  }

  generateRecommendations(results, query, context) {
    const recommendations = [];
    
    if (results.length === 0) {
      recommendations.push('Try broader search terms');
      recommendations.push('Check for typos in your query');
    } else if (results.length < 3) {
      recommendations.push('Try related search terms');
      recommendations.push('Consider searching by file type or domain');
    }
    
    return recommendations;
  }

  generateRetrievalSuggestions() {
    return [
      'Try searching by file type (e.g., ".tsx", ".ts")',
      'Search by domain (e.g., "audio", "playlist", "auth")',
      'Use status terms (e.g., "error", "success", "warning")',
      'Search by time period with --timeframe option'
    ];
  }

  generateInsights(analysis) {
    const insights = [];
    
    if (analysis.performance?.learningEffectiveness < 0.5) {
      insights.push('Learning effectiveness is low - consider running memory optimization');
    }
    
    if (analysis.quality?.averageQuality < 0.6) {
      insights.push('Average quality is below expectations - review validation patterns');
    }
    
    if (analysis.patterns?.length > 0) {
      const actionableCount = analysis.patterns.filter(p => p.actionable).length;
      if (actionableCount > 0) {
        insights.push(`${actionableCount} patterns require attention - run pattern analysis`);
      }
    }
    
    return insights;
  }

  generateActionableRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.memoryStats?.totalEntries > 500) {
      recommendations.push('Consider running memory optimization to improve performance');
    }
    
    if (analysis.patterns?.length > 0) {
      const criticalPatterns = analysis.patterns.filter(p => p.actionable && p.confidence > 0.8);
      if (criticalPatterns.length > 0) {
        recommendations.push(`Address ${criticalPatterns.length} high-confidence issues identified in patterns`);
      }
    }
    
    recommendations.push('Run continuous learning to improve agent effectiveness');
    
    return recommendations;
  }

  getMemoryStatistics() {
    return {
      totalEntries: this.agentMemory.entries?.length || 0,
      indexSize: Object.keys(this.memoryIndex.terms || {}).length,
      patternsCount: this.patterns.recognized?.length || 0,
      lastUpdate: this.agentMemory.metadata?.lastUpdate || 'never',
      version: this.agentMemory.version || '1.0.0',
      compressionEnabled: this.learningConfig.compression.enableCompression
    };
  }

  // Missing analysis methods
  async analyzePatterns() {
    const result = await this.recognizePatterns();
    return result.newPatterns || [];
  }

  // Pattern recognition helper methods  
  recognizePerformancePatterns(entries) {
    // Placeholder implementation
    return [];
  }

  recognizeAgentInteractionPatterns(entries) {
    // Placeholder implementation  
    return [];
  }

  // Analysis helper methods
  analyzeAccessPatterns(entries) {
    const patterns = {
      totalAccesses: entries.reduce((sum, e) => sum + (e.accessCount || 0), 0),
      mostAccessed: entries.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0)).slice(0, 5),
      leastAccessed: entries.filter(e => (e.accessCount || 0) === 0).length
    };
    
    return patterns;
  }

  calculateStorageEfficiency() {
    const entries = this.agentMemory.entries || [];
    const compressed = entries.filter(e => e.compressed).length;
    const total = entries.length;
    
    return {
      compressionRate: total > 0 ? compressed / total : 0,
      avgEntrySize: this.calculateAverageEntrySize(),
      totalStorage: this.calculateTotalStorage()
    };
  }

  calculateAverageEntrySize() {
    const entries = this.agentMemory.entries || [];
    if (entries.length === 0) return 0;
    
    const totalSize = entries.reduce((sum, entry) => {
      return sum + JSON.stringify(entry).length;
    }, 0);
    
    return Math.round(totalSize / entries.length);
  }

  calculateTotalStorage() {
    return JSON.stringify(this.agentMemory).length;
  }

  calculateRetrievalPerformance() {
    // Placeholder - would track actual retrieval metrics
    return {
      averageSearchTime: 25, // ms
      indexEfficiency: 0.85,
      resultRelevance: 0.78
    };
  }

  generatePerformanceRecommendations() {
    return [
      'Run memory optimization regularly for better performance',
      'Enable compression for older entries to save space',
      'Use specific search terms for better results'
    ];
  }

  // Trend analysis methods
  createTimeWindows(entries) {
    // Group entries by time periods
    const windows = {
      daily: {},
      weekly: {},
      monthly: {}
    };
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = this.getWeekKey(date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!windows.daily[dayKey]) windows.daily[dayKey] = [];
      if (!windows.weekly[weekKey]) windows.weekly[weekKey] = [];
      if (!windows.monthly[monthKey]) windows.monthly[monthKey] = [];
      
      windows.daily[dayKey].push(entry);
      windows.weekly[weekKey].push(entry);
      windows.monthly[monthKey].push(entry);
    });
    
    return windows;
  }

  getWeekKey(date) {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  analyzeVolumeTrends(timeWindows) {
    return {
      dailyAverage: Object.values(timeWindows.daily).reduce((sum, day) => sum + day.length, 0) / Object.keys(timeWindows.daily).length,
      peakDay: this.findPeakPeriod(timeWindows.daily),
      growthRate: this.calculateGrowthRate(timeWindows.monthly)
    };
  }

  analyzeQualityTrends(entries) {
    // Group by time and calculate quality metrics
    const recentEntries = entries.slice(-100); // Last 100 entries
    const avgQuality = recentEntries.reduce((sum, e) => sum + (e.qualityMetrics?.overall || 0.5), 0) / recentEntries.length;
    
    return {
      averageQuality: avgQuality,
      trend: 'stable', // Would calculate actual trend
      recommendation: avgQuality < 0.6 ? 'Focus on quality improvements' : 'Quality is acceptable'
    };
  }

  analyzePatternTrends() {
    const patterns = this.patterns.recognized || [];
    return {
      totalPatterns: patterns.length,
      actionablePatterns: patterns.filter(p => p.actionable).length,
      highConfidencePatterns: patterns.filter(p => p.confidence > 0.8).length,
      trend: 'growing' // Would calculate actual trend
    };
  }

  analyzeSuccessTrends(timeWindows) {
    const latest = Object.values(timeWindows.weekly).slice(-4); // Last 4 weeks
    const successRates = latest.map(week => {
      const successes = week.filter(e => e.data?.success).length;
      return week.length > 0 ? successes / week.length : 0;
    });
    
    return {
      currentSuccessRate: successRates[successRates.length - 1] || 0,
      trend: successRates.length > 1 ? 
        (successRates[successRates.length - 1] > successRates[0] ? 'improving' : 'declining') : 
        'stable'
    };
  }

  generateTrendPredictions() {
    return [
      'Memory usage will continue growing - plan for optimization',
      'Pattern recognition will improve with more data',
      'Quality trends appear stable'
    ];
  }

  findPeakPeriod(periodData) {
    let maxCount = 0;
    let peakPeriod = null;
    
    Object.entries(periodData).forEach(([period, entries]) => {
      if (entries.length > maxCount) {
        maxCount = entries.length;
        peakPeriod = period;
      }
    });
    
    return { period: peakPeriod, count: maxCount };
  }

  calculateGrowthRate(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 0;
    
    const first = monthlyData[months[0]].length;
    const last = monthlyData[months[months.length - 1]].length;
    
    return first > 0 ? (last - first) / first : 0;
  }

  identifyTopQualityPatterns() {
    const patterns = this.patterns.recognized || [];
    return patterns
      .filter(p => p.confidence > 0.8)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  identifyQualityIssues() {
    const patterns = this.patterns.recognized || [];
    return patterns
      .filter(p => p.actionable && p.type === 'error')
      .sort((a, b) => b.frequency - a.frequency);
  }

  generateAdvancedId() {
    return `mem-v2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCapabilities() {
    return [
      ...super.getCapabilities(),
      'advanced-pattern-recognition',
      'multi-dimensional-search',
      'continuous-learning',
      'intelligent-retrieval',
      'performance-analysis',
      'quality-assessment',
      'trend-analysis',
      'memory-optimization'
    ];
  }
}

module.exports = EnhancedMemoryAgent;