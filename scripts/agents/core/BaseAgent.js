#!/usr/bin/env node

/**
 * BaseAgent - Foundation class for all AI agents
 * Provides common functionality, communication protocols, and execution patterns
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

class BaseAgent extends EventEmitter {
  constructor(name, options = {}) {
    super();
    
    if (!name) {
      throw new Error('Agent name is required');
    }
    
    this.name = name;
    this.type = options.type || 'generic';
    this.version = options.version || '1.0.0';
    this.description = options.description || `AI Agent: ${name}`;
    
    // Agent configuration
    this.config = {
      timeout: options.timeout || 60000, // 1 minute default
      retryAttempts: options.retryAttempts || 2,
      priority: options.priority || 5, // 1-10 scale
      dependencies: options.dependencies || [],
      ...options.config
    };
    
    // State management
    this.state = {
      status: 'idle', // idle, running, completed, failed
      lastExecution: null,
      executionCount: 0,
      errorCount: 0
    };
    
    // Memory and context
    this.memory = {};
    this.context = {};
    
    console.log(`🤖 ${this.name} agent initialized (v${this.version})`);
  }

  /**
   * Main execution method - must be implemented by subclasses
   * @param {Object} context - Execution context from orchestrator
   * @returns {Promise<Object>} - Execution result
   */
  async execute(context = {}) {
    throw new Error(`${this.name} agent must implement execute() method`);
  }

  /**
   * Pre-execution validation and setup
   * @param {Object} context - Execution context
   * @returns {Promise<boolean>} - Validation success
   */
  async preExecute(context) {
    this.setState('running');
    this.context = { ...this.context, ...context };
    
    // Validate dependencies
    if (this.config.dependencies.length > 0) {
      const missingDeps = await this.validateDependencies();
      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
    }
    
    this.emit('preExecute', { agent: this.name, context });
    return true;
  }

  /**
   * Post-execution cleanup and reporting
   * @param {Object} result - Execution result
   * @param {Error} error - Any error that occurred
   */
  async postExecute(result, error = null) {
    this.state.lastExecution = new Date().toISOString();
    this.state.executionCount++;
    
    if (error) {
      this.state.errorCount++;
      this.setState('failed');
      this.emit('executionFailed', { agent: this.name, error, context: this.context });
    } else {
      this.setState('completed');
      this.emit('executionCompleted', { agent: this.name, result, context: this.context });
    }
    
    // Store execution in memory
    this.storeExecution(result, error);
    
    return result;
  }

  /**
   * Safe execution wrapper with error handling and retries
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async safeExecute(context = {}) {
    let lastError = null;
    let attempt = 0;
    
    while (attempt <= this.config.retryAttempts) {
      try {
        await this.preExecute(context);
        
        // Execute with timeout
        const result = await Promise.race([
          this.execute(context),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Agent execution timeout')), this.config.timeout)
          )
        ]);
        
        await this.postExecute(result);
        return result;
        
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (attempt <= this.config.retryAttempts) {
          console.warn(`⚠️  ${this.name} agent failed, retrying (${attempt}/${this.config.retryAttempts})`);
          await this.wait(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    await this.postExecute(null, lastError);
    throw lastError;
  }

  /**
   * Validate agent dependencies
   * @returns {Promise<Array>} - Array of missing dependencies
   */
  async validateDependencies() {
    const missing = [];
    
    for (const dep of this.config.dependencies) {
      if (typeof dep === 'string') {
        // Simple dependency check (could be expanded)
        if (!await this.checkDependency(dep)) {
          missing.push(dep);
        }
      } else if (typeof dep === 'object' && dep.name) {
        if (!await this.checkDependency(dep.name, dep.options)) {
          missing.push(dep.name);
        }
      }
    }
    
    return missing;
  }

  /**
   * Check if a specific dependency is available
   * @param {string} depName - Dependency name
   * @param {Object} options - Dependency options
   * @returns {Promise<boolean>} - Dependency availability
   */
  async checkDependency(depName, options = {}) {
    // Basic implementation - can be extended by subclasses
    try {
      if (depName.startsWith('file:')) {
        const filePath = depName.replace('file:', '');
        return fs.existsSync(filePath);
      }
      
      if (depName.startsWith('command:')) {
        const command = depName.replace('command:', '');
        // Could implement command existence check
        return true; // Placeholder
      }
      
      if (depName.startsWith('env:')) {
        const envVar = depName.replace('env:', '');
        return process.env[envVar] !== undefined;
      }
      
      return true; // Default to available
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Send message to another agent via orchestrator
   * @param {string} targetAgent - Target agent name
   * @param {Object} message - Message payload
   * @returns {Promise<Object>} - Response from target agent
   */
  async sendMessage(targetAgent, message) {
    if (!this.context.orchestrator) {
      throw new Error('No orchestrator available for inter-agent communication');
    }
    
    const agentMessage = {
      id: this.generateMessageId(),
      from: this.name,
      to: targetAgent,
      type: 'request',
      timestamp: Date.now(),
      payload: message,
      priority: this.config.priority
    };
    
    this.emit('messageSent', agentMessage);
    
    // Implementation would depend on orchestrator's message handling
    // For now, return a placeholder
    return { received: true, timestamp: Date.now() };
  }

  /**
   * Store execution result in agent memory
   * @param {Object} result - Execution result
   * @param {Error} error - Any error that occurred
   */
  storeExecution(result, error = null) {
    const execution = {
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(this.context),
      result: this.sanitizeResult(result),
      error: error ? error.message : null,
      duration: Date.now() - (this.context.startTime || Date.now()),
      success: !error
    };
    
    if (!this.memory.executions) {
      this.memory.executions = [];
    }
    
    this.memory.executions.push(execution);
    
    // Keep only last 100 executions
    if (this.memory.executions.length > 100) {
      this.memory.executions = this.memory.executions.slice(-100);
    }
  }

  /**
   * Get agent performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    const executions = this.memory.executions || [];
    const totalExecutions = this.state.executionCount;
    const successRate = totalExecutions > 0 ? 
      ((totalExecutions - this.state.errorCount) / totalExecutions) * 100 : 0;
    
    const durations = executions
      .filter(e => e.duration && e.success)
      .map(e => e.duration);
    
    const avgDuration = durations.length > 0 ? 
      durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    
    return {
      agent: this.name,
      type: this.type,
      version: this.version,
      status: this.state.status,
      totalExecutions,
      successRate: Math.round(successRate * 100) / 100,
      errorCount: this.state.errorCount,
      averageDuration: Math.round(avgDuration),
      lastExecution: this.state.lastExecution,
      memorySize: this.getMemorySize()
    };
  }

  /**
   * Set agent state
   * @param {string} status - New status
   */
  setState(status) {
    const previousStatus = this.state.status;
    this.state.status = status;
    
    if (previousStatus !== status) {
      this.emit('stateChanged', { 
        agent: this.name, 
        from: previousStatus, 
        to: status,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean agent memory
   * @param {Object} options - Cleanup options
   */
  cleanMemory(options = {}) {
    const maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours
    const maxEntries = options.maxEntries || 50;
    
    if (this.memory.executions) {
      const cutoffTime = Date.now() - maxAge;
      
      this.memory.executions = this.memory.executions
        .filter(e => new Date(e.timestamp).getTime() > cutoffTime)
        .slice(-maxEntries);
    }
    
    this.emit('memoryCleanup', { 
      agent: this.name, 
      entriesRemaining: this.memory.executions?.length || 0 
    });
  }

  /**
   * Utility methods
   */
  
  generateMessageId() {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sanitizeContext(context) {
    // Remove sensitive data from context before storing
    const sanitized = { ...context };
    delete sanitized.orchestrator;
    delete sanitized.apiKey;
    delete sanitized.secrets;
    return sanitized;
  }

  sanitizeResult(result) {
    // Sanitize result data before storing
    if (!result) return result;
    
    if (typeof result === 'object' && result.sensitive) {
      return { ...result, sensitive: '[REDACTED]' };
    }
    
    return result;
  }

  getMemorySize() {
    return JSON.stringify(this.memory).length;
  }

  /**
   * Agent information
   */
  getInfo() {
    return {
      name: this.name,
      type: this.type,
      version: this.version,
      description: this.description,
      config: this.config,
      state: this.state,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Get agent capabilities - to be overridden by subclasses
   * @returns {Array} - Array of capability strings
   */
  getCapabilities() {
    return ['basic-execution', 'memory-storage', 'inter-agent-communication'];
  }

  /**
   * Shutdown agent gracefully
   */
  async shutdown() {
    console.log(`🛑 Shutting down ${this.name} agent...`);
    
    this.setState('idle');
    this.removeAllListeners();
    
    console.log(`👋 ${this.name} agent shutdown complete`);
  }
}

module.exports = BaseAgent;