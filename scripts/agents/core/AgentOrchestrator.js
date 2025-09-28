#!/usr/bin/env node

/**
 * Agent Orchestrator - Central coordination for AI agent team
 * Manages agent lifecycle, communication, and workflow execution
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class AgentOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.agents = new Map();
    this.activeWorkflows = new Map();
    this.config = this.loadConfig(options.configPath);
    this.memoryPath = options.memoryPath || path.join(__dirname, '../memory/orchestrator-memory.json');
    
    // Initialize memory
    this.memory = this.loadMemory();
    
    // Workflow states
    this.WORKFLOW_STATES = {
      PENDING: 'pending',
      RUNNING: 'running', 
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    };
    
    console.log('🎭 Agent Orchestrator initialized');
  }

  loadConfig(configPath) {
    const defaultConfigPath = path.join(__dirname, '../config/agent-config.json');
    const targetPath = configPath || defaultConfigPath;
    
    try {
      if (fs.existsSync(targetPath)) {
        return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load config, using defaults:', error.message);
    }
    
    // Default configuration
    return {
      agents: {
        validator: { enabled: true, priority: 1 },
        guardian: { enabled: true, priority: 1 },
        memory: { enabled: true, priority: 0 }
      },
      workflows: {
        codeReview: ['validator', 'guardian', 'memory'],
        qualityCheck: ['validator', 'memory'],
        architectureReview: ['guardian', 'memory']
      },
      execution: {
        timeout: 300000, // 5 minutes
        retryAttempts: 2,
        parallelExecution: true
      }
    };
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load memory, starting fresh:', error.message);
    }
    
    return {
      workflows: {},
      agentPerformance: {},
      learnings: [],
      lastExecution: null
    };
  }

  saveMemory() {
    try {
      const memoryDir = path.dirname(this.memoryPath);
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }
      
      fs.writeFileSync(this.memoryPath, JSON.stringify({
        ...this.memory,
        lastExecution: new Date().toISOString()
      }, null, 2));
    } catch (error) {
      console.error('❌ Failed to save memory:', error.message);
    }
  }

  registerAgent(agent) {
    if (!agent.name || !agent.execute) {
      throw new Error('Agent must have name and execute method');
    }
    
    this.agents.set(agent.name, agent);
    console.log(`🤖 Agent registered: ${agent.name}`);
    
    // Initialize performance tracking
    if (!this.memory.agentPerformance[agent.name]) {
      this.memory.agentPerformance[agent.name] = {
        executions: 0,
        successes: 0,
        failures: 0,
        averageExecutionTime: 0,
        lastExecution: null
      };
    }
  }

  async executeWorkflow(workflowName, context = {}) {
    const workflowId = `${workflowName}-${Date.now()}`;
    console.log(`🚀 Starting workflow: ${workflowName} (${workflowId})`);
    
    // Initialize workflow state
    const workflow = {
      id: workflowId,
      name: workflowName,
      state: this.WORKFLOW_STATES.PENDING,
      context,
      startTime: Date.now(),
      agents: [],
      results: {},
      errors: []
    };
    
    this.activeWorkflows.set(workflowId, workflow);
    
    try {
      // Get agents for this workflow
      const workflowConfig = this.config.workflows[workflowName];
      if (!workflowConfig) {
        throw new Error(`Workflow not found: ${workflowName}`);
      }
      
      const agentNames = workflowConfig.agents || workflowConfig;
      if (!Array.isArray(agentNames) || agentNames.length === 0) {
        throw new Error(`No agents configured for workflow: ${workflowName}`);
      }
      
      workflow.state = this.WORKFLOW_STATES.RUNNING;
      workflow.agents = agentNames;
      
      // Execute agents
      const results = await this.executeAgents(agentNames, context, workflowId, workflowConfig);
      
      workflow.results = results;
      workflow.state = this.WORKFLOW_STATES.COMPLETED;
      workflow.endTime = Date.now();
      workflow.duration = workflow.endTime - workflow.startTime;
      
      console.log(`✅ Workflow completed: ${workflowName} (${workflow.duration}ms)`);
      
      // Store in memory
      this.memory.workflows[workflowId] = {
        ...workflow,
        timestamp: new Date().toISOString()
      };
      
      this.saveMemory();
      this.emit('workflowCompleted', workflow);
      
      return {
        success: true,
        workflowId,
        results,
        duration: workflow.duration
      };
      
    } catch (error) {
      workflow.state = this.WORKFLOW_STATES.FAILED;
      workflow.error = error.message;
      workflow.endTime = Date.now();
      
      console.error(`❌ Workflow failed: ${workflowName}`, error.message);
      
      this.emit('workflowFailed', workflow, error);
      
      return {
        success: false,
        workflowId,
        error: error.message,
        workflow
      };
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  async executeAgents(agentNames, context, workflowId, workflowConfig = {}) {
    const results = {};
    const errors = [];
    
    // Check if agents exist
    const missingAgents = agentNames.filter(name => !this.agents.has(name));
    if (missingAgents.length > 0) {
      throw new Error(`Missing agents: ${missingAgents.join(', ')}`);
    }
    
    // Determine execution mode (workflow-specific overrides global)
    const parallelExecution = workflowConfig.parallel !== undefined 
      ? workflowConfig.parallel 
      : this.config.execution.parallelExecution;
    
    // Execute agents based on configuration
    if (parallelExecution) {
      // Parallel execution
      const promises = agentNames.map(agentName => this.executeAgent(agentName, context, workflowId, workflowConfig));
      const agentResults = await Promise.allSettled(promises);
      
      agentResults.forEach((result, index) => {
        const agentName = agentNames[index];
        if (result.status === 'fulfilled') {
          results[agentName] = result.value;
        } else {
          errors.push({ agent: agentName, error: result.reason.message });
          results[agentName] = { error: result.reason.message };
        }
      });
    } else {
      // Sequential execution with result accumulation
      let accumulatedResults = {};
      
      for (const agentName of agentNames) {
        try {
          // For memory agent, provide previous results
          const contextWithResults = agentName === 'memory' 
            ? { ...context, workflowResults: accumulatedResults }
            : context;
            
          results[agentName] = await this.executeAgent(agentName, contextWithResults, workflowId, workflowConfig);
          accumulatedResults[agentName] = results[agentName];
        } catch (error) {
          errors.push({ agent: agentName, error: error.message });
          results[agentName] = { error: error.message };
          
          // Continue on error in sequential mode for memory agent compatibility
          if (!this.config.execution.continueOnFailure) {
            break;
          }
        }
      }
    }
    
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} agent(s) failed during execution`);
    }
    
    return results;
  }

  async executeAgent(agentName, context, workflowId, workflowConfig = {}) {
    const agent = this.agents.get(agentName);
    const startTime = Date.now();
    
    console.log(`🔄 Executing agent: ${agentName}`);
    
    try {
      // Create agent context
      const agentContext = {
        ...context,
        workflowId,
        orchestrator: this,
        timestamp: new Date().toISOString()
      };
      
      // Execute with timeout (using workflow timeout or default)
      const timeout = workflowConfig?.timeout || this.config.execution.timeout || 300000;
      const result = await Promise.race([
        agent.execute(agentContext),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Agent execution timeout')), timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      // Update performance metrics
      const perf = this.memory.agentPerformance[agentName];
      perf.executions++;
      perf.successes++;
      perf.averageExecutionTime = (perf.averageExecutionTime * (perf.executions - 1) + duration) / perf.executions;
      perf.lastExecution = new Date().toISOString();
      
      console.log(`✅ Agent completed: ${agentName} (${duration}ms)`);
      
      return {
        success: true,
        data: result,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update performance metrics
      const perf = this.memory.agentPerformance[agentName];
      perf.executions++;
      perf.failures++;
      perf.lastExecution = new Date().toISOString();
      
      console.error(`❌ Agent failed: ${agentName} (${duration}ms)`, error.message);
      
      throw error;
    }
  }

  getWorkflowStatus(workflowId) {
    if (this.activeWorkflows.has(workflowId)) {
      return this.activeWorkflows.get(workflowId);
    }
    
    if (this.memory.workflows[workflowId]) {
      return this.memory.workflows[workflowId];
    }
    
    return null;
  }

  getAgentPerformance(agentName = null) {
    if (agentName) {
      return this.memory.agentPerformance[agentName] || null;
    }
    
    return this.memory.agentPerformance;
  }

  listAvailableWorkflows() {
    return Object.keys(this.config.workflows);
  }

  listRegisteredAgents() {
    return Array.from(this.agents.keys());
  }

  async shutdown() {
    console.log('🛑 Shutting down Agent Orchestrator...');
    
    // Cancel active workflows
    for (const [workflowId, workflow] of this.activeWorkflows) {
      workflow.state = this.WORKFLOW_STATES.CANCELLED;
      console.log(`🚫 Cancelled workflow: ${workflowId}`);
    }
    
    this.saveMemory();
    this.removeAllListeners();
    
    console.log('👋 Agent Orchestrator shutdown complete');
  }
}

module.exports = AgentOrchestrator;