#!/usr/bin/env node

/**
 * Guardian Agent - Architectural Enforcement and Business Rule Validation
 * Enforces Next.js/React patterns, CoreTet business rules, and prevents anti-patterns
 */

const BaseAgent = require('../core/BaseAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GuardianAgent extends BaseAgent {
  constructor(options = {}) {
    super('guardian', {
      type: 'architectural-enforcement',
      version: '1.0.0',
      description: 'Architectural enforcement and business rule validation agent',
      priority: 1,
      timeout: 90000, // 1.5 minutes
      retryAttempts: 1,
      dependencies: [
        'file:src/',
        'env:NEXT_PUBLIC_SUPABASE_URL',
        'env:GEMINI_API_KEY'
      ],
      ...options
    });

    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent enforcement
        maxOutputTokens: 4096,
      },
    });

    // Load templates and rules
    this.promptTemplate = this.loadPromptTemplate();
    this.architecturalRules = this.loadArchitecturalRules();
    this.businessRules = this.loadBusinessRules();
    this.securityRules = this.loadSecurityRules();

    console.log('🛡️  Guardian Agent initialized');
  }

  async execute(context) {
    const { codeContent, fileName, changeType, affectedComponents = [] } = context;
    
    if (!codeContent && !fileName) {
      throw new Error('Guardian Agent requires either codeContent or fileName');
    }

    console.log(`🛡️  Guarding: ${fileName || 'provided code'}`);

    const guardianResults = {
      fileName,
      changeType,
      timestamp: new Date().toISOString(),
      decision: 'PENDING',
      checks: {},
      violations: [],
      requiredChanges: [],
      businessImpact: [],
      summary: {}
    };

    try {
      // Read file content if only filename provided
      let fileContent = codeContent;
      if (!fileContent && fileName && fs.existsSync(fileName)) {
        fileContent = fs.readFileSync(fileName, 'utf8');
      }

      if (!fileContent) {
        throw new Error('No code content available for analysis');
      }

      // Run enforcement checks
      const checks = await Promise.allSettled([
        this.checkArchitecturalPatterns(fileContent, fileName),
        this.checkBusinessRules(fileContent, fileName),
        this.checkSecurityPatterns(fileContent, fileName),
        this.checkAntiPatterns(fileContent, fileName),
        this.checkFileStructure(fileName),
        this.checkImportPatterns(fileContent, fileName)
      ]);

      // Process results
      guardianResults.checks.architectural = this.processCheckResult(checks[0], 'Architectural Patterns');
      guardianResults.checks.business = this.processCheckResult(checks[1], 'Business Rules');
      guardianResults.checks.security = this.processCheckResult(checks[2], 'Security Patterns');
      guardianResults.checks.antiPatterns = this.processCheckResult(checks[3], 'Anti-Patterns');
      guardianResults.checks.fileStructure = this.processCheckResult(checks[4], 'File Structure');
      guardianResults.checks.imports = this.processCheckResult(checks[5], 'Import Patterns');

      // Generate AI-powered architectural analysis
      if (fileContent) {
        const aiAnalysis = await this.generateAIAnalysis(fileContent, fileName, guardianResults);
        guardianResults.aiAnalysis = aiAnalysis;
      }

      // Make final decision
      this.makeDecision(guardianResults);

      console.log(`✅ Guardian analysis complete: ${fileName} - ${guardianResults.decision}`);

      return guardianResults;

    } catch (error) {
      console.error(`❌ Guardian analysis failed for ${fileName}:`, error.message);
      
      guardianResults.error = error.message;
      guardianResults.decision = 'REJECT';
      guardianResults.violations.push({
        type: 'system-error',
        message: error.message,
        severity: 'critical'
      });
      
      return guardianResults;
    }
  }

  async checkArchitecturalPatterns(codeContent, fileName) {
    const violations = [];
    
    // Next.js App Router patterns
    if (fileName && fileName.includes('/app/')) {
      const appRouterViolations = this.validateAppRouterPatterns(codeContent, fileName);
      violations.push(...appRouterViolations);
    }

    // React component patterns
    if (fileName && fileName.match(/\.(tsx|jsx)$/) && fileName.includes('/components/')) {
      const componentViolations = this.validateComponentPatterns(codeContent, fileName);
      violations.push(...componentViolations);
    }

    // API route patterns
    if (fileName && fileName.includes('/api/') && fileName.endsWith('/route.ts')) {
      const apiViolations = this.validateAPIPatterns(codeContent, fileName);
      violations.push(...apiViolations);
    }

    // Custom hooks patterns
    if (fileName && (fileName.includes('/hooks/') || path.basename(fileName).startsWith('use'))) {
      const hookViolations = this.validateHookPatterns(codeContent, fileName);
      violations.push(...hookViolations);
    }

    return {
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length,
      warningCount: violations.filter(v => v.severity === 'warning').length
    };
  }

  validateAppRouterPatterns(codeContent, fileName) {
    const violations = [];

    // Check for proper page.tsx structure
    if (fileName.endsWith('/page.tsx')) {
      if (!codeContent.includes('export default')) {
        violations.push({
          type: 'app-router-pattern',
          message: 'Page components must have a default export',
          severity: 'critical',
          rule: 'next-app-router-page-export'
        });
      }

      // Check for client/server component clarity
      if (codeContent.includes('useState') || codeContent.includes('useEffect')) {
        if (!codeContent.includes("'use client'")) {
          violations.push({
            type: 'app-router-pattern',
            message: 'Components using client-side hooks must include "use client" directive',
            severity: 'critical',
            rule: 'next-client-directive'
          });
        }
      }
    }

    // Check for proper layout.tsx structure
    if (fileName.endsWith('/layout.tsx')) {
      if (!codeContent.includes('children')) {
        violations.push({
          type: 'app-router-pattern',
          message: 'Layout components must accept and render children prop',
          severity: 'critical',
          rule: 'next-layout-children'
        });
      }
    }

    return violations;
  }

  validateComponentPatterns(codeContent, fileName) {
    const violations = [];

    // No class components allowed
    if (codeContent.match(/class\s+\w+\s+extends\s+(React\.)?Component/)) {
      violations.push({
        type: 'component-pattern',
        message: 'Class components are not allowed - use functional components with hooks',
        severity: 'critical',
        rule: 'no-class-components'
      });
    }

    // Proper component naming
    const componentName = path.basename(fileName, path.extname(fileName));
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
      violations.push({
        type: 'component-pattern',
        message: 'Component files must use PascalCase naming',
        severity: 'warning',
        rule: 'component-naming'
      });
    }

    // Check for proper props typing
    if (codeContent.includes('function') || codeContent.includes('const')) {
      const hasPropsInterface = codeContent.match(/interface\s+\w*Props/);
      const hasPropsType = codeContent.match(/type\s+\w*Props/);
      const hasInlineProps = codeContent.match(/\{\s*\w+[:\s]/);
      
      if (!hasPropsInterface && !hasPropsType && !hasInlineProps && codeContent.includes('props')) {
        violations.push({
          type: 'component-pattern',
          message: 'Component props should be properly typed with TypeScript interfaces',
          severity: 'warning',
          rule: 'typed-props'
        });
      }
    }

    // Check for proper error boundaries in audio components
    if (fileName.includes('/audio/') && !codeContent.includes('try') && !codeContent.includes('catch')) {
      violations.push({
        type: 'component-pattern',
        message: 'Audio components should include error handling',
        severity: 'warning',
        rule: 'audio-error-handling'
      });
    }

    return violations;
  }

  validateAPIPatterns(codeContent, fileName) {
    const violations = [];

    // Check for proper HTTP method exports
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const exportedMethods = httpMethods.filter(method => 
      codeContent.includes(`export async function ${method}`)
    );

    if (exportedMethods.length === 0) {
      violations.push({
        type: 'api-pattern',
        message: 'API routes must export at least one HTTP method handler',
        severity: 'critical',
        rule: 'api-method-export'
      });
    }

    // Check for proper request/response handling
    exportedMethods.forEach(method => {
      const methodPattern = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)`);
      const match = codeContent.match(methodPattern);
      
      if (match && !match[0].includes('request') && !match[0].includes('Request')) {
        violations.push({
          type: 'api-pattern',
          message: `${method} handler should accept request parameter`,
          severity: 'warning',
          rule: 'api-request-param'
        });
      }
    });

    // Check for proper error handling in API routes
    if (!codeContent.includes('try') || !codeContent.includes('catch')) {
      violations.push({
        type: 'api-pattern',
        message: 'API routes must include proper error handling with try/catch',
        severity: 'critical',
        rule: 'api-error-handling'
      });
    }

    // Check for proper response status codes
    if (!codeContent.includes('Response.json') && !codeContent.includes('NextResponse')) {
      violations.push({
        type: 'api-pattern',
        message: 'API routes should use Response.json() or NextResponse for responses',
        severity: 'warning',
        rule: 'api-response-format'
      });
    }

    return violations;
  }

  validateHookPatterns(codeContent, fileName) {
    const violations = [];

    const hookName = path.basename(fileName, path.extname(fileName));
    
    // Hook naming validation
    if (!hookName.startsWith('use')) {
      violations.push({
        type: 'hook-pattern',
        message: 'Custom hook names must start with "use"',
        severity: 'critical',
        rule: 'hook-naming'
      });
    }

    // Check for proper hook rules compliance
    if (codeContent.includes('if') && (codeContent.includes('useState') || codeContent.includes('useEffect'))) {
      violations.push({
        type: 'hook-pattern',
        message: 'Hooks should not be called conditionally',
        severity: 'critical',
        rule: 'hook-conditional-call'
      });
    }

    return violations;
  }

  async checkBusinessRules(codeContent, fileName) {
    const violations = [];

    // Audio file handling rules for CoreTet
    if (codeContent.includes('audio') || codeContent.includes('track') || fileName.includes('audio')) {
      const audioViolations = this.validateAudioBusinessRules(codeContent, fileName);
      violations.push(...audioViolations);
    }

    // User authentication rules
    if (codeContent.includes('user') || codeContent.includes('auth') || fileName.includes('auth')) {
      const authViolations = this.validateAuthBusinessRules(codeContent, fileName);
      violations.push(...authViolations);
    }

    // Playlist management rules
    if (codeContent.includes('playlist') || fileName.includes('playlist')) {
      const playlistViolations = this.validatePlaylistBusinessRules(codeContent, fileName);
      violations.push(...playlistViolations);
    }

    // Database access rules
    if (codeContent.includes('supabase') || codeContent.includes('database')) {
      const dbViolations = this.validateDatabaseBusinessRules(codeContent, fileName);
      violations.push(...dbViolations);
    }

    return {
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length,
      warningCount: violations.filter(v => v.severity === 'warning').length
    };
  }

  validateAudioBusinessRules(codeContent, fileName) {
    const violations = [];

    // Audio upload validation
    if (codeContent.includes('upload') || codeContent.includes('file')) {
      if (!codeContent.includes('validate') && !codeContent.includes('check')) {
        violations.push({
          type: 'business-rule',
          message: 'Audio uploads must include validation checks',
          severity: 'critical',
          rule: 'audio-upload-validation',
          businessImpact: 'Security risk from unvalidated file uploads'
        });
      }

      // Check for file type validation
      if (!codeContent.match(/\.(mp3|wav|m4a|aac|ogg)/i) && !codeContent.includes('accept')) {
        violations.push({
          type: 'business-rule',
          message: 'Audio uploads should specify accepted file types',
          severity: 'warning',
          rule: 'audio-file-types',
          businessImpact: 'User experience - unclear upload requirements'
        });
      }
    }

    // Audio processing memory management
    if (codeContent.includes('AudioContext') || codeContent.includes('decode')) {
      if (!codeContent.includes('cleanup') && !codeContent.includes('dispose')) {
        violations.push({
          type: 'business-rule',
          message: 'Audio processing components must include cleanup logic',
          severity: 'warning',
          rule: 'audio-memory-management',
          businessImpact: 'Performance degradation from memory leaks'
        });
      }
    }

    return violations;
  }

  validateAuthBusinessRules(codeContent, fileName) {
    const violations = [];

    // Authentication requirement
    if (fileName.includes('/app/') && !fileName.includes('/auth/') && !fileName.includes('layout')) {
      if (!codeContent.includes('auth') && !codeContent.includes('user') && !codeContent.includes('session')) {
        violations.push({
          type: 'business-rule',
          message: 'Protected pages should implement authentication checks',
          severity: 'warning',
          rule: 'page-auth-check',
          businessImpact: 'Security risk from unprotected pages'
        });
      }
    }

    // User permission validation
    if (codeContent.includes('delete') || codeContent.includes('update') || codeContent.includes('modify')) {
      if (!codeContent.includes('permission') && !codeContent.includes('owner') && !codeContent.includes('canEdit')) {
        violations.push({
          type: 'business-rule',
          message: 'Destructive operations must check user permissions',
          severity: 'critical',
          rule: 'permission-check',
          businessImpact: 'Security risk from unauthorized operations'
        });
      }
    }

    return violations;
  }

  validatePlaylistBusinessRules(codeContent, fileName) {
    const violations = [];

    // Playlist ownership validation
    if (codeContent.includes('playlist') && (codeContent.includes('delete') || codeContent.includes('update'))) {
      if (!codeContent.includes('user_id') && !codeContent.includes('owner')) {
        violations.push({
          type: 'business-rule',
          message: 'Playlist operations must validate ownership',
          severity: 'critical',
          rule: 'playlist-ownership',
          businessImpact: 'Security risk from unauthorized playlist access'
        });
      }
    }

    // Collaboration permissions
    if (codeContent.includes('collaborator') || codeContent.includes('share')) {
      if (!codeContent.includes('permission') && !codeContent.includes('role')) {
        violations.push({
          type: 'business-rule',
          message: 'Playlist collaboration must implement proper permissions',
          severity: 'warning',
          rule: 'playlist-collaboration',
          businessImpact: 'Feature limitation - unclear collaboration rules'
        });
      }
    }

    return violations;
  }

  validateDatabaseBusinessRules(codeContent, fileName) {
    const violations = [];

    // No direct database queries in components
    if (fileName.includes('/components/') && codeContent.includes('supabase.from')) {
      violations.push({
        type: 'business-rule',
        message: 'Components should not make direct database queries - use API routes or custom hooks',
        severity: 'critical',
        rule: 'no-component-db-queries',
        businessImpact: 'Architecture violation - poor separation of concerns'
      });
    }

    // RLS policy compliance
    if (codeContent.includes('supabase') && fileName.includes('/api/')) {
      if (!codeContent.includes('user') && !codeContent.includes('auth')) {
        violations.push({
          type: 'business-rule',
          message: 'Database operations should consider Row Level Security policies',
          severity: 'warning',
          rule: 'rls-compliance',
          businessImpact: 'Security risk from bypassing data access controls'
        });
      }
    }

    return violations;
  }

  async checkSecurityPatterns(codeContent, fileName) {
    const violations = [];

    // Input validation
    if (fileName.includes('/api/') || codeContent.includes('request.')) {
      if (!codeContent.includes('validate') && !codeContent.includes('schema') && !codeContent.includes('zod')) {
        violations.push({
          type: 'security-pattern',
          message: 'API endpoints should validate input data',
          severity: 'critical',
          rule: 'input-validation'
        });
      }
    }

    // Environment variable exposure
    const envMatches = codeContent.match(/process\.env\.([A-Z_]+)/g);
    if (envMatches) {
      envMatches.forEach(match => {
        const varName = match.replace('process.env.', '');
        if (!varName.startsWith('NEXT_PUBLIC_') && fileName.includes('/app/')) {
          violations.push({
            type: 'security-pattern',
            message: `Server-side environment variable ${varName} exposed to client`,
            severity: 'critical',
            rule: 'env-var-exposure'
          });
        }
      });
    }

    // SQL injection prevention
    if (codeContent.includes('query') || codeContent.includes('sql')) {
      if (codeContent.includes('${') || codeContent.includes('" +')) {
        violations.push({
          type: 'security-pattern',
          message: 'Potential SQL injection vulnerability from string concatenation',
          severity: 'critical',
          rule: 'sql-injection-prevention'
        });
      }
    }

    return {
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length,
      warningCount: violations.filter(v => v.severity === 'warning').length
    };
  }

  async checkAntiPatterns(codeContent, fileName) {
    const violations = [];

    // React anti-patterns
    if (codeContent.includes('useEffect') && codeContent.includes('[]')) {
      if (codeContent.includes('setInterval') || codeContent.includes('setTimeout')) {
        violations.push({
          type: 'anti-pattern',
          message: 'Timers in useEffect without cleanup can cause memory leaks',
          severity: 'warning',
          rule: 'effect-cleanup'
        });
      }
    }

    // Performance anti-patterns
    if (codeContent.match(/new Date\(\)(?=.*return)/)) {
      violations.push({
        type: 'anti-pattern',
        message: 'Creating new Date() in render function impacts performance',
        severity: 'warning',
        rule: 'render-performance'
      });
    }

    // Accessibility anti-patterns
    if (codeContent.includes('<div') && codeContent.includes('onClick') && !codeContent.includes('role=')) {
      violations.push({
        type: 'anti-pattern',
        message: 'Clickable divs should have proper ARIA roles for accessibility',
        severity: 'warning',
        rule: 'accessibility-clickable'
      });
    }

    return {
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length,
      warningCount: violations.filter(v => v.severity === 'warning').length
    };
  }

  async checkFileStructure(fileName) {
    if (!fileName) return { passed: true, violations: [] };

    const violations = [];

    // Domain-based organization validation
    const allowedDomains = ['audio', 'tracks', 'playlists', 'auth', 'ui', 'upload', 'layout'];
    
    if (fileName.includes('/components/')) {
      const pathParts = fileName.split('/components/')[1].split('/');
      if (pathParts.length > 1) {
        const domain = pathParts[0];
        if (!allowedDomains.includes(domain)) {
          violations.push({
            type: 'file-structure',
            message: `Unknown domain "${domain}" - use established domain organization`,
            severity: 'warning',
            rule: 'domain-organization'
          });
        }
      }
    }

    // API route organization
    if (fileName.includes('/api/') && !fileName.endsWith('/route.ts')) {
      violations.push({
        type: 'file-structure',
        message: 'API routes should be named route.ts in Next.js app directory',
        severity: 'warning',
        rule: 'api-naming'
      });
    }

    return {
      passed: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length,
      warningCount: violations.filter(v => v.severity === 'warning').length
    };
  }

  async checkImportPatterns(codeContent, fileName) {
    const violations = [];

    // Relative import depth check
    const deepImports = codeContent.match(/from\s+['"]\.\.\/\.\.\//g);
    if (deepImports && deepImports.length > 0) {
      violations.push({
        type: 'import-pattern',
        message: 'Avoid deep relative imports - consider absolute imports or barrel exports',
        severity: 'warning',
        rule: 'deep-imports'
      });
    }

    // Unused imports (basic check)
    const importMatches = codeContent.match(/import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"][^'"]+['"]/g);
    if (importMatches) {
      importMatches.forEach(importStatement => {
        const namedImports = importStatement.match(/\{([^}]+)\}/);
        if (namedImports) {
          const imports = namedImports[1].split(',').map(s => s.trim());
          imports.forEach(imp => {
            const cleanImport = imp.replace(/\s+as\s+\w+/, '');
            if (!codeContent.includes(cleanImport) || codeContent.indexOf(cleanImport) === codeContent.indexOf(importStatement)) {
              violations.push({
                type: 'import-pattern',
                message: `Potentially unused import: ${cleanImport}`,
                severity: 'warning',
                rule: 'unused-imports'
              });
            }
          });
        }
      });
    }

    return {
      passed: true, // Import issues are warnings only
      violations,
      warningCount: violations.length
    };
  }

  async generateAIAnalysis(codeContent, fileName, guardianResults) {
    try {
      const prompt = this.buildPrompt(codeContent, fileName, guardianResults);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseAIResponse(text);

    } catch (error) {
      console.warn('⚠️  AI analysis failed:', error.message);
      return {
        error: error.message,
        fallback: true
      };
    }
  }

  buildPrompt(codeContent, fileName, guardianResults) {
    const context = {
      codeContent: codeContent.substring(0, 6000), // Limit for token constraints
      fileName: fileName || 'unknown',
      changeType: 'guardian-analysis',
      checksResults: JSON.stringify(guardianResults.checks, null, 2)
    };

    let prompt = this.promptTemplate.basePrompt || this.getDefaultPrompt();
    
    // Replace context variables
    Object.entries(context).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return prompt + `\n\n**Code to analyze:**\n\`\`\`typescript\n${context.codeContent}\n\`\`\`\n\n**Guardian check results:**\n${context.checksResults}\n\nPlease provide your architectural decision and reasoning.`;
  }

  parseAIResponse(response) {
    try {
      return {
        decision: this.extractSection(response, 'Decision'),
        reasoning: this.extractSection(response, 'Reasoning'),
        violations: this.extractSection(response, 'Violations'),
        requiredChanges: this.extractSection(response, 'Required Changes'),
        businessImpact: this.extractSection(response, 'Business Impact')
      };
    } catch (error) {
      return {
        rawResponse: response,
        parseError: error.message
      };
    }
  }

  extractSection(text, sectionName) {
    const regex = new RegExp(`\\*\\*${sectionName}:\\*\\*\\s*(.+?)(?=\\*\\*|$)`, 'is');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  makeDecision(guardianResults) {
    const { checks } = guardianResults;
    
    // Collect all violations
    let criticalViolations = 0;
    let totalWarnings = 0;
    
    Object.values(checks).forEach(check => {
      if (check && check.violations) {
        const criticals = check.violations.filter(v => v.severity === 'critical');
        const warnings = check.violations.filter(v => v.severity === 'warning');
        
        criticalViolations += criticals.length;
        totalWarnings += warnings.length;
        
        guardianResults.violations.push(...check.violations);
      }
    });

    // Extract required changes and business impacts
    guardianResults.violations.forEach(violation => {
      if (violation.severity === 'critical') {
        guardianResults.requiredChanges.push(`${violation.rule}: ${violation.message}`);
      }
      
      if (violation.businessImpact) {
        guardianResults.businessImpact.push(violation.businessImpact);
      }
    });

    // Make decision based on violations
    if (criticalViolations > 0) {
      guardianResults.decision = 'REJECT';
    } else if (totalWarnings > 5) {
      guardianResults.decision = 'CONDITIONAL';
    } else {
      guardianResults.decision = 'APPROVE';
    }

    // Generate summary
    guardianResults.summary = {
      criticalViolations,
      totalWarnings,
      totalViolations: criticalViolations + totalWarnings,
      checksPerformed: Object.keys(checks).length,
      checksPassed: Object.values(checks).filter(c => c && c.passed).length
    };
  }

  processCheckResult(promiseResult, checkType) {
    if (promiseResult.status === 'fulfilled') {
      return promiseResult.value;
    } else {
      return {
        passed: false,
        error: promiseResult.reason?.message || `${checkType} check failed`,
        violations: []
      };
    }
  }

  loadPromptTemplate() {
    try {
      const templatesPath = path.join(__dirname, '../config/prompt-templates.json');
      const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
      return templates.templates.guardian;
    } catch (error) {
      console.warn('⚠️  Could not load prompt template:', error.message);
      return { basePrompt: this.getDefaultPrompt() };
    }
  }

  getDefaultPrompt() {
    return "You are the Guardian Agent enforcing architectural integrity and business rules. Analyze the provided code and make a decision.\n\nFormat your response as:\n**Decision:** APPROVE | REJECT | CONDITIONAL\n**Reasoning:** [detailed explanation]\n**Violations:** [list any rule violations]\n**Required Changes:** [specific modifications needed]\n**Business Impact:** [impact assessment]";
  }

  loadArchitecturalRules() {
    // Could be loaded from config file - for now return defaults
    return {
      nextjs: ['app-router-patterns', 'client-server-separation'],
      react: ['functional-components', 'proper-hooks', 'typed-props'],
      structure: ['domain-organization', 'api-patterns']
    };
  }

  loadBusinessRules() {
    return {
      audio: ['upload-validation', 'memory-management'],
      auth: ['permission-checks', 'protected-routes'],
      playlists: ['ownership-validation', 'collaboration-rules'],
      database: ['no-component-queries', 'rls-compliance']
    };
  }

  loadSecurityRules() {
    return {
      input: ['validation-required', 'sanitization'],
      environment: ['no-server-vars-in-client'],
      database: ['sql-injection-prevention'],
      files: ['upload-security', 'type-validation']
    };
  }

  getCapabilities() {
    return [
      ...super.getCapabilities(),
      'architectural-enforcement',
      'business-rule-validation',
      'security-pattern-checking',
      'anti-pattern-detection',
      'file-structure-validation',
      'import-pattern-analysis'
    ];
  }
}

module.exports = GuardianAgent;