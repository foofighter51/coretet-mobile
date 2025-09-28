#!/usr/bin/env node

/**
 * Validator Agent - Quality Assurance and Code Validation
 * Performs comprehensive code validation including syntax, patterns, and security
 */

const BaseAgent = require('../core/BaseAgent');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

class ValidatorAgent extends BaseAgent {
  constructor(options = {}) {
    super('validator', {
      type: 'quality-assurance',
      version: '1.0.0',
      description: 'Quality assurance and code validation agent',
      priority: 1,
      timeout: 120000, // 2 minutes
      retryAttempts: 2,
      dependencies: [
        'command:tsc',
        'command:eslint',
        'file:tsconfig.json',
        'file:package.json',
        'env:GEMINI_API_KEY'
      ],
      ...options
    });

    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    // Load templates
    this.promptTemplate = this.loadPromptTemplate();
    
    // Validation configuration
    this.validationConfig = {
      typescript: true,
      eslint: true,
      prettier: true,
      tests: true,
      performance: true,
      security: true,
      thresholds: {
        testCoverage: 80,
        complexity: 10,
        duplicateLines: 5
      },
      exclusions: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**'
      ]
    };

    console.log('🔍 Validator Agent initialized');
  }

  async execute(context) {
    const { codeContent, fileName, changeType, relatedFiles = [] } = context;
    
    if (!codeContent && !fileName) {
      throw new Error('Validator Agent requires either codeContent or fileName');
    }

    console.log(`🔍 Validating: ${fileName || 'provided code'}`);

    const validationResults = {
      fileName,
      changeType,
      timestamp: new Date().toISOString(),
      validations: {},
      summary: {},
      issues: [],
      suggestions: [],
      rating: 'pending'
    };

    try {
      // Run validation checks in parallel
      const checks = await Promise.allSettled([
        this.validateTypeScript(fileName, codeContent),
        this.validateESLint(fileName, codeContent),
        this.validatePrettier(fileName, codeContent),
        this.validateSecurity(codeContent, fileName),
        this.validatePerformance(codeContent, fileName),
        this.validatePatterns(codeContent, fileName)
      ]);

      // Process results
      validationResults.validations.typescript = this.processCheckResult(checks[0], 'TypeScript');
      validationResults.validations.eslint = this.processCheckResult(checks[1], 'ESLint');
      validationResults.validations.prettier = this.processCheckResult(checks[2], 'Prettier');
      validationResults.validations.security = this.processCheckResult(checks[3], 'Security');
      validationResults.validations.performance = this.processCheckResult(checks[4], 'Performance');
      validationResults.validations.patterns = this.processCheckResult(checks[5], 'Patterns');

      // Generate AI-powered comprehensive analysis
      if (codeContent) {
        const aiAnalysis = await this.generateAIAnalysis(codeContent, fileName, validationResults);
        validationResults.aiAnalysis = aiAnalysis;
      }

      // Generate final summary and rating
      this.generateSummary(validationResults);

      console.log(`✅ Validation complete: ${fileName} - ${validationResults.rating}`);

      return validationResults;

    } catch (error) {
      console.error(`❌ Validation failed for ${fileName}:`, error.message);
      
      validationResults.error = error.message;
      validationResults.rating = '🔴 Failed';
      
      return validationResults;
    }
  }

  async validateTypeScript(fileName, codeContent) {
    if (!fileName || !fileName.match(/\.(ts|tsx)$/)) {
      return { skipped: true, reason: 'Not a TypeScript file' };
    }

    try {
      // Check if we can compile the specific file
      const { stdout, stderr } = await execAsync(`npx tsc --noEmit --skipLibCheck ${fileName}`, {
        cwd: process.cwd(),
        timeout: 30000
      });

      return {
        success: true,
        stdout,
        stderr,
        issues: stderr ? this.parseTypeScriptErrors(stderr) : []
      };

    } catch (error) {
      const issues = this.parseTypeScriptErrors(error.stderr || error.message);
      return {
        success: false,
        error: error.message,
        issues
      };
    }
  }

  async validateESLint(fileName, codeContent) {
    if (!fileName || !fileName.match(/\.(js|jsx|ts|tsx)$/)) {
      return { skipped: true, reason: 'Not a lintable file' };
    }

    try {
      const { stdout, stderr } = await execAsync(`npx eslint ${fileName} --format json`, {
        cwd: process.cwd(),
        timeout: 30000
      });

      const results = JSON.parse(stdout || '[]');
      const issues = results.length > 0 ? results[0].messages || [] : [];

      return {
        success: issues.length === 0,
        issues: issues.map(issue => ({
          line: issue.line,
          column: issue.column,
          message: issue.message,
          rule: issue.ruleId,
          severity: issue.severity === 2 ? 'error' : 'warning'
        })),
        errorCount: issues.filter(i => i.severity === 2).length,
        warningCount: issues.filter(i => i.severity === 1).length
      };

    } catch (error) {
      // ESLint returns non-zero exit code for errors, parse the output
      try {
        const results = JSON.parse(error.stdout || '[]');
        const issues = results.length > 0 ? results[0].messages || [] : [];
        
        return {
          success: issues.filter(i => i.severity === 2).length === 0,
          issues: issues.map(issue => ({
            line: issue.line,
            column: issue.column,
            message: issue.message,
            rule: issue.ruleId,
            severity: issue.severity === 2 ? 'error' : 'warning'
          })),
          errorCount: issues.filter(i => i.severity === 2).length,
          warningCount: issues.filter(i => i.severity === 1).length
        };
      } catch (parseError) {
        return {
          success: false,
          error: error.message,
          issues: []
        };
      }
    }
  }

  async validatePrettier(fileName, codeContent) {
    if (!fileName || !fileName.match(/\.(js|jsx|ts|tsx|json|md)$/)) {
      return { skipped: true, reason: 'Not a formattable file' };
    }

    try {
      const { stdout } = await execAsync(`npx prettier --check ${fileName}`, {
        cwd: process.cwd(),
        timeout: 15000
      });

      return {
        success: true,
        message: 'Code is properly formatted'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Code formatting issues detected',
        suggestion: `Run: npx prettier --write ${fileName}`
      };
    }
  }

  async validateSecurity(codeContent, fileName) {
    if (!codeContent) {
      return { skipped: true, reason: 'No code content provided' };
    }

    const securityIssues = [];
    
    // Basic security pattern checks
    const securityPatterns = [
      {
        pattern: /console\.log\([^)]*password[^)]*\)/gi,
        message: 'Potential password logging detected',
        severity: 'high'
      },
      {
        pattern: /eval\s*\(/gi,
        message: 'Use of eval() detected - security risk',
        severity: 'high'
      },
      {
        pattern: /innerHTML\s*=/gi,
        message: 'Use of innerHTML - potential XSS risk',
        severity: 'medium'
      },
      {
        pattern: /document\.write\s*\(/gi,
        message: 'Use of document.write() - security risk',
        severity: 'medium'
      },
      {
        pattern: /dangerouslySetInnerHTML/gi,
        message: 'Use of dangerouslySetInnerHTML - ensure content is sanitized',
        severity: 'medium'
      },
      {
        pattern: /process\.env\.[A-Z_]+(?!.*PUBLIC)/gi,
        message: 'Potential server-side environment variable exposure',
        severity: 'medium'
      }
    ];

    // Audio/file upload specific patterns for CoreTet
    const audioSecurityPatterns = [
      {
        pattern: /\.(exe|bat|sh|cmd)\b/gi,
        message: 'Executable file extension detected in file handling',
        severity: 'high'
      },
      {
        pattern: /accept=["'][^"']*\*[^"']*["']/gi,
        message: 'Overly permissive file upload accept pattern',
        severity: 'medium'
      }
    ];

    // Check all patterns
    [...securityPatterns, ...audioSecurityPatterns].forEach(({ pattern, message, severity }) => {
      const matches = codeContent.match(pattern);
      if (matches) {
        securityIssues.push({
          pattern: pattern.source,
          message,
          severity,
          occurrences: matches.length,
          examples: matches.slice(0, 3) // First 3 examples
        });
      }
    });

    return {
      success: securityIssues.filter(i => i.severity === 'high').length === 0,
      issues: securityIssues,
      highSeverityCount: securityIssues.filter(i => i.severity === 'high').length,
      mediumSeverityCount: securityIssues.filter(i => i.severity === 'medium').length
    };
  }

  async validatePerformance(codeContent, fileName) {
    if (!codeContent) {
      return { skipped: true, reason: 'No code content provided' };
    }

    const performanceIssues = [];
    
    // React/Next.js performance patterns
    const performancePatterns = [
      {
        pattern: /useEffect\s*\(\s*[^,]+\s*\)/g, // useEffect without deps
        message: 'useEffect without dependency array - may cause infinite re-renders',
        severity: 'medium',
        suggestion: 'Add dependency array to useEffect'
      },
      {
        pattern: /useState\(\s*\[[\s\S]*?\]\s*\)/g, // Large initial state
        message: 'Large object/array in useState initial value',
        severity: 'low',
        suggestion: 'Consider using useMemo for complex initial state'
      },
      {
        pattern: /\.map\([^)]*=>\s*<[^>]*key=\{.*?index.*?\}/g,
        message: 'Using array index as React key',
        severity: 'medium',
        suggestion: 'Use stable unique identifiers as keys'
      },
      {
        pattern: /new Date\(\)/g,
        message: 'Direct Date instantiation in render',
        severity: 'low',
        suggestion: 'Consider memoizing date values'
      }
    ];

    // Audio-specific performance patterns for CoreTet
    const audioPerformancePatterns = [
      {
        pattern: /new AudioContext\(\)/g,
        message: 'Multiple AudioContext creation detected',
        severity: 'high',
        suggestion: 'Reuse AudioContext instances'
      },
      {
        pattern: /\.decode.*audio.*data/gi,
        message: 'Audio decoding without proper cleanup',
        severity: 'medium',
        suggestion: 'Ensure proper memory cleanup after audio processing'
      }
    ];

    // Check all patterns
    [...performancePatterns, ...audioPerformancePatterns].forEach(({ pattern, message, severity, suggestion }) => {
      const matches = codeContent.match(pattern);
      if (matches) {
        performanceIssues.push({
          pattern: pattern.source,
          message,
          severity,
          suggestion,
          occurrences: matches.length
        });
      }
    });

    return {
      success: performanceIssues.filter(i => i.severity === 'high').length === 0,
      issues: performanceIssues,
      highSeverityCount: performanceIssues.filter(i => i.severity === 'high').length,
      mediumSeverityCount: performanceIssues.filter(i => i.severity === 'medium').length
    };
  }

  async validatePatterns(codeContent, fileName) {
    if (!codeContent) {
      return { skipped: true, reason: 'No code content provided' };
    }

    const patternIssues = [];
    
    // React/Next.js pattern validations for CoreTet
    const patterns = [
      {
        pattern: /class\s+\w+\s+extends\s+(React\.)?Component/g,
        message: 'Class component detected - prefer functional components',
        severity: 'low',
        suggestion: 'Convert to functional component with hooks'
      },
      {
        pattern: /import.*from\s+['"]\.\.\/\.\.\/\.\./g,
        message: 'Deep relative imports detected',
        severity: 'medium',
        suggestion: 'Consider using absolute imports or barrel exports'
      },
      {
        pattern: /fetch\s*\(/g,
        message: 'Direct fetch usage - consider using API wrapper',
        severity: 'low',
        suggestion: 'Use centralized API client for consistency'
      },
      {
        pattern: /supabase\.from\([^)]*\)\.select\(/g,
        message: 'Direct Supabase query in component',
        severity: 'medium',
        suggestion: 'Move database queries to API routes or custom hooks'
      }
    ];

    // Check patterns
    patterns.forEach(({ pattern, message, severity, suggestion }) => {
      const matches = codeContent.match(pattern);
      if (matches) {
        patternIssues.push({
          pattern: pattern.source,
          message,
          severity,
          suggestion,
          occurrences: matches.length
        });
      }
    });

    // File naming validation
    if (fileName) {
      const filePatternIssues = this.validateFileNaming(fileName);
      patternIssues.push(...filePatternIssues);
    }

    return {
      success: patternIssues.filter(i => i.severity === 'high').length === 0,
      issues: patternIssues,
      highSeverityCount: patternIssues.filter(i => i.severity === 'high').length,
      mediumSeverityCount: patternIssues.filter(i => i.severity === 'medium').length
    };
  }

  validateFileNaming(fileName) {
    const issues = [];
    const baseName = path.basename(fileName);
    
    // Component file naming
    if (fileName.includes('/components/') && fileName.match(/\.(tsx|jsx)$/)) {
      if (!/^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/.test(baseName)) {
        issues.push({
          message: 'Component files should use PascalCase naming',
          severity: 'low',
          suggestion: `Rename to follow PascalCase convention`
        });
      }
    }
    
    // Hook file naming
    if (fileName.includes('/hooks/') || baseName.startsWith('use')) {
      if (!/^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/.test(baseName)) {
        issues.push({
          message: 'Hook files should start with "use" and use camelCase',
          severity: 'low',
          suggestion: 'Follow hook naming convention: useFeatureName'
        });
      }
    }

    // API route naming
    if (fileName.includes('/api/')) {
      if (!/^[a-z0-9\-\[\]]*\.ts$/.test(baseName)) {
        issues.push({
          message: 'API routes should use lowercase with hyphens',
          severity: 'low',
          suggestion: 'Use lowercase naming for API routes'
        });
      }
    }

    return issues;
  }

  async generateAIAnalysis(codeContent, fileName, validationResults) {
    try {
      const prompt = this.buildPrompt(codeContent, fileName, validationResults);
      
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

  buildPrompt(codeContent, fileName, validationResults) {
    const context = {
      codeContent: codeContent.substring(0, 8000), // Limit for token constraints
      fileName: fileName || 'unknown',
      fileType: fileName ? path.extname(fileName) : 'unknown',
      changeType: 'validation',
      validationResults: JSON.stringify(validationResults, null, 2)
    };

    let prompt = this.promptTemplate.basePrompt;
    
    // Replace context variables
    Object.entries(context).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return prompt + `

**Code to analyze:**
\`\`\`${context.fileType}
${context.codeContent}
\`\`\`

**Existing validation results:**
${context.validationResults}

Please provide your analysis focusing on code quality, maintainability, and CoreTet-specific considerations.`;
  }

  parseAIResponse(response) {
    try {
      // Extract sections from AI response
      const sections = {
        rating: this.extractSection(response, 'Rating'),
        summary: this.extractSection(response, 'Summary'),
        issues: this.extractSection(response, 'Issues'),
        suggestions: this.extractSection(response, 'Suggestions'),
        securityNotes: this.extractSection(response, 'Security Notes'),
        performanceNotes: this.extractSection(response, 'Performance Notes')
      };

      return sections;
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

  generateSummary(validationResults) {
    const { validations } = validationResults;
    
    // Count issues by severity
    let totalIssues = 0;
    let highSeverityIssues = 0;
    let mediumSeverityIssues = 0;
    let errors = 0;
    let warnings = 0;

    Object.values(validations).forEach(validation => {
      if (validation && validation.issues) {
        totalIssues += validation.issues.length;
        
        if (validation.errorCount) errors += validation.errorCount;
        if (validation.warningCount) warnings += validation.warningCount;
        if (validation.highSeverityCount) highSeverityIssues += validation.highSeverityCount;
        if (validation.mediumSeverityCount) mediumSeverityIssues += validation.mediumSeverityCount;
      }
    });

    // Determine overall rating
    let rating = '🟢 Good';
    if (errors > 0 || highSeverityIssues > 0) {
      rating = '🔴 Needs Major Changes';
    } else if (warnings > 5 || mediumSeverityIssues > 3 || totalIssues > 10) {
      rating = '🟡 Needs Minor Changes';
    }

    validationResults.rating = rating;
    validationResults.summary = {
      totalIssues,
      errors,
      warnings,
      highSeverityIssues,
      mediumSeverityIssues,
      validationsRun: Object.keys(validations).length,
      validationsPassed: Object.values(validations).filter(v => v && v.success).length
    };

    // Collect all issues
    validationResults.issues = [];
    validationResults.suggestions = [];

    Object.entries(validations).forEach(([type, validation]) => {
      if (validation && validation.issues) {
        validation.issues.forEach(issue => {
          validationResults.issues.push({
            type,
            ...issue
          });
        });
      }
    });
  }

  processCheckResult(promiseResult, checkType) {
    if (promiseResult.status === 'fulfilled') {
      return promiseResult.value;
    } else {
      return {
        success: false,
        error: promiseResult.reason?.message || `${checkType} check failed`,
        issues: []
      };
    }
  }

  parseTypeScriptErrors(stderr) {
    if (!stderr) return [];
    
    const lines = stderr.split('\n');
    const errors = [];
    
    for (const line of lines) {
      const match = line.match(/(.+?)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5],
          severity: 'error'
        });
      }
    }
    
    return errors;
  }

  loadPromptTemplate() {
    try {
      const templatesPath = path.join(__dirname, '../config/prompt-templates.json');
      const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
      return templates.templates.validator;
    } catch (error) {
      console.warn('⚠️  Could not load prompt template:', error.message);
      return {
        basePrompt: `You are a code validator. Analyze the provided code for quality, security, and performance issues.

Provide your response in this format:
**Rating:** [🟢 Good | 🟡 Needs Minor Changes | 🔴 Needs Major Changes]
**Summary:** [brief summary]
**Issues:** [numbered list if any]
**Suggestions:** [numbered list if any]`
      };
    }
  }

  getCapabilities() {
    return [
      ...super.getCapabilities(),
      'typescript-validation',
      'eslint-validation',
      'prettier-validation',
      'security-analysis',
      'performance-analysis',
      'pattern-validation',
      'ai-powered-analysis'
    ];
  }
}

module.exports = ValidatorAgent;