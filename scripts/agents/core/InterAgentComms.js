#!/usr/bin/env node

/**
 * Inter-Agent Communication System
 * Handles message passing, coordination, and data sharing between agents
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

class InterAgentComms extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.messageQueue = [];
    this.messageHistory = [];
    this.activeSubscriptions = new Map();
    
    // Configuration
    this.config = {
      maxQueueSize: options.maxQueueSize || 1000,
      maxHistorySize: options.maxHistorySize || 500,
      messageTimeout: options.messageTimeout || 30000, // 30 seconds
      persistMessages: options.persistMessages || false,
      messagePersistPath: options.messagePersistPath || path.join(__dirname, '../memory/messages.json')
    };
    
    // Message types
    this.MESSAGE_TYPES = {
      REQUEST: 'request',
      RESPONSE: 'response', 
      NOTIFICATION: 'notification',
      BROADCAST: 'broadcast',
      ERROR: 'error'
    };
    
    // Priority levels
    this.PRIORITY_LEVELS = {
      CRITICAL: 1,
      HIGH: 2,
      NORMAL: 3,
      LOW: 4,
      BACKGROUND: 5
    };
    
    // Load persisted messages if enabled
    if (this.config.persistMessages) {
      this.loadPersistedMessages();
    }
    
    console.log('📡 Inter-Agent Communication System initialized');
  }

  /**
   * Send message between agents
   * @param {Object} message - Message object
   * @returns {Promise<string>} - Message ID
   */
  async sendMessage(message) {
    const enrichedMessage = this.enrichMessage(message);
    
    // Validate message
    if (!this.validateMessage(enrichedMessage)) {
      throw new Error('Invalid message format');
    }
    
    // Add to queue
    this.addToQueue(enrichedMessage);
    
    // Emit message event
    this.emit('messageQueued', enrichedMessage);
    
    // If it's a broadcast, handle immediately
    if (enrichedMessage.type === this.MESSAGE_TYPES.BROADCAST) {
      this.handleBroadcast(enrichedMessage);
    }
    
    // Process queue
    this.processQueue();
    
    return enrichedMessage.id;
  }

  /**
   * Subscribe to messages for a specific agent
   * @param {string} agentName - Name of the subscribing agent
   * @param {Function} callback - Callback function for received messages
   * @param {Object} filters - Message filters
   */
  subscribe(agentName, callback, filters = {}) {
    const subscriptionId = this.generateSubscriptionId(agentName);
    
    const subscription = {
      id: subscriptionId,
      agentName,
      callback,
      filters,
      createdAt: new Date().toISOString(),
      messageCount: 0
    };
    
    this.activeSubscriptions.set(subscriptionId, subscription);
    
    console.log(`📨 Agent ${agentName} subscribed to messages (${subscriptionId})`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from messages
   * @param {string} subscriptionId - Subscription ID to remove
   */
  unsubscribe(subscriptionId) {
    const subscription = this.activeSubscriptions.get(subscriptionId);
    if (subscription) {
      this.activeSubscriptions.delete(subscriptionId);
      console.log(`📭 Agent ${subscription.agentName} unsubscribed (${subscriptionId})`);
      return true;
    }
    return false;
  }

  /**
   * Send a request and wait for response
   * @param {Object} requestMessage - Request message
   * @param {number} timeout - Response timeout in ms
   * @returns {Promise<Object>} - Response message
   */
  async sendRequest(requestMessage, timeout = null) {
    const requestTimeout = timeout || this.config.messageTimeout;
    const messageId = await this.sendMessage({
      ...requestMessage,
      type: this.MESSAGE_TYPES.REQUEST
    });
    
    return new Promise((resolve, reject) => {
      const responseTimeout = setTimeout(() => {
        this.removeAllListeners(`response:${messageId}`);
        reject(new Error(`Request timeout: ${messageId}`));
      }, requestTimeout);
      
      this.once(`response:${messageId}`, (response) => {
        clearTimeout(responseTimeout);
        resolve(response);
      });
    });
  }

  /**
   * Send response to a request
   * @param {Object} originalMessage - Original request message
   * @param {Object} responseData - Response data
   */
  async sendResponse(originalMessage, responseData) {
    const responseMessage = {
      type: this.MESSAGE_TYPES.RESPONSE,
      from: responseData.from || 'unknown',
      to: originalMessage.from,
      requestId: originalMessage.id,
      payload: responseData,
      priority: originalMessage.priority || this.PRIORITY_LEVELS.NORMAL
    };
    
    await this.sendMessage(responseMessage);
    this.emit(`response:${originalMessage.id}`, responseMessage);
  }

  /**
   * Broadcast message to all subscribed agents
   * @param {Object} broadcastData - Broadcast data
   */
  async broadcast(broadcastData) {
    const broadcastMessage = {
      type: this.MESSAGE_TYPES.BROADCAST,
      from: broadcastData.from || 'system',
      to: 'all',
      payload: broadcastData,
      priority: broadcastData.priority || this.PRIORITY_LEVELS.NORMAL
    };
    
    await this.sendMessage(broadcastMessage);
  }

  /**
   * Get messages for a specific agent
   * @param {string} agentName - Agent name
   * @param {Object} filters - Message filters
   * @returns {Array} - Filtered messages
   */
  getMessagesForAgent(agentName, filters = {}) {
    return this.messageHistory.filter(message => {
      // Basic recipient check
      if (message.to !== agentName && message.to !== 'all') {
        return false;
      }
      
      // Apply filters
      if (filters.type && message.type !== filters.type) {
        return false;
      }
      
      if (filters.from && message.from !== filters.from) {
        return false;
      }
      
      if (filters.priority && message.priority > filters.priority) {
        return false;
      }
      
      if (filters.since) {
        const messageTime = new Date(message.timestamp).getTime();
        const sinceTime = new Date(filters.since).getTime();
        if (messageTime < sinceTime) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get communication statistics
   * @returns {Object} - Communication stats
   */
  getStats() {
    const totalMessages = this.messageHistory.length;
    const queuedMessages = this.messageQueue.length;
    const activeSubscriptions = this.activeSubscriptions.size;
    
    // Message type breakdown
    const messageTypes = {};
    this.messageHistory.forEach(msg => {
      messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
    });
    
    // Agent activity
    const agentActivity = {};
    this.messageHistory.forEach(msg => {
      agentActivity[msg.from] = (agentActivity[msg.from] || 0) + 1;
    });
    
    return {
      totalMessages,
      queuedMessages,
      activeSubscriptions,
      messageTypes,
      agentActivity,
      queueHealth: this.getQueueHealth(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Private methods
   */

  enrichMessage(message) {
    return {
      id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
      type: message.type || this.MESSAGE_TYPES.NOTIFICATION,
      priority: message.priority || this.PRIORITY_LEVELS.NORMAL,
      ttl: message.ttl || this.config.messageTimeout,
      ...message
    };
  }

  validateMessage(message) {
    // Required fields
    if (!message.id || !message.from || !message.to) {
      return false;
    }
    
    // Valid message type
    if (!Object.values(this.MESSAGE_TYPES).includes(message.type)) {
      return false;
    }
    
    // Valid priority
    if (!Object.values(this.PRIORITY_LEVELS).includes(message.priority)) {
      return false;
    }
    
    return true;
  }

  addToQueue(message) {
    // Remove expired messages
    this.cleanExpiredMessages();
    
    // Check queue size
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      // Remove oldest low-priority messages
      this.messageQueue = this.messageQueue
        .filter(msg => msg.priority <= this.PRIORITY_LEVELS.NORMAL)
        .slice(-(this.config.maxQueueSize - 1));
    }
    
    // Insert message based on priority
    let inserted = false;
    for (let i = 0; i < this.messageQueue.length; i++) {
      if (message.priority < this.messageQueue[i].priority) {
        this.messageQueue.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      this.messageQueue.push(message);
    }
  }

  processQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      
      // Check if message has expired
      if (this.isMessageExpired(message)) {
        console.warn(`⚠️  Message expired: ${message.id}`);
        continue;
      }
      
      this.deliverMessage(message);
      this.addToHistory(message);
    }
  }

  deliverMessage(message) {
    // Deliver to subscribed agents
    this.activeSubscriptions.forEach((subscription, subscriptionId) => {
      if (this.messageMatchesSubscription(message, subscription)) {
        try {
          subscription.callback(message);
          subscription.messageCount++;
        } catch (error) {
          console.error(`❌ Error delivering message to ${subscription.agentName}:`, error.message);
        }
      }
    });
    
    // Emit general message event
    this.emit('messageDelivered', message);
  }

  handleBroadcast(message) {
    this.emit('broadcast', message);
  }

  messageMatchesSubscription(message, subscription) {
    // Check agent targeting
    if (message.to !== subscription.agentName && message.to !== 'all') {
      return false;
    }
    
    // Check filters
    const filters = subscription.filters;
    
    if (filters.type && message.type !== filters.type) {
      return false;
    }
    
    if (filters.from && message.from !== filters.from) {
      return false;
    }
    
    if (filters.priority && message.priority > filters.priority) {
      return false;
    }
    
    return true;
  }

  addToHistory(message) {
    this.messageHistory.push(message);
    
    // Trim history if too large
    if (this.messageHistory.length > this.config.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.config.maxHistorySize);
    }
    
    // Persist if enabled
    if (this.config.persistMessages) {
      this.persistMessages();
    }
  }

  isMessageExpired(message) {
    const now = Date.now();
    const messageTime = new Date(message.timestamp).getTime();
    return (now - messageTime) > message.ttl;
  }

  cleanExpiredMessages() {
    const now = Date.now();
    this.messageQueue = this.messageQueue.filter(message => {
      const messageTime = new Date(message.timestamp).getTime();
      return (now - messageTime) <= message.ttl;
    });
  }

  getQueueHealth() {
    const totalMessages = this.messageQueue.length;
    const criticalMessages = this.messageQueue.filter(m => m.priority === this.PRIORITY_LEVELS.CRITICAL).length;
    const expiredMessages = this.messageQueue.filter(m => this.isMessageExpired(m)).length;
    
    let status = 'healthy';
    if (totalMessages > this.config.maxQueueSize * 0.8) {
      status = 'warning';
    }
    if (totalMessages >= this.config.maxQueueSize || criticalMessages > 10) {
      status = 'critical';
    }
    
    return {
      status,
      totalMessages,
      criticalMessages,
      expiredMessages,
      utilizationPercent: Math.round((totalMessages / this.config.maxQueueSize) * 100)
    };
  }

  persistMessages() {
    try {
      const dataToSave = {
        history: this.messageHistory.slice(-100), // Save last 100 messages
        timestamp: new Date().toISOString()
      };
      
      const dir = path.dirname(this.config.messagePersistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.config.messagePersistPath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('❌ Failed to persist messages:', error.message);
    }
  }

  loadPersistedMessages() {
    try {
      if (fs.existsSync(this.config.messagePersistPath)) {
        const data = JSON.parse(fs.readFileSync(this.config.messagePersistPath, 'utf8'));
        this.messageHistory = data.history || [];
        console.log(`📂 Loaded ${this.messageHistory.length} persisted messages`);
      }
    } catch (error) {
      console.warn('⚠️  Could not load persisted messages:', error.message);
    }
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubscriptionId(agentName) {
    return `sub-${agentName}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  async shutdown() {
    console.log('🛑 Shutting down Inter-Agent Communication System...');
    
    // Persist current state if enabled
    if (this.config.persistMessages) {
      this.persistMessages();
    }
    
    // Clear subscriptions
    this.activeSubscriptions.clear();
    
    // Clear queues
    this.messageQueue = [];
    
    // Remove all listeners
    this.removeAllListeners();
    
    console.log('👋 Inter-Agent Communication System shutdown complete');
  }
}

module.exports = InterAgentComms;