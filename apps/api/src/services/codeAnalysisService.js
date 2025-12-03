/**
 * Code Analysis Service
 * Provides AI-powered code analysis, security scanning, and performance analysis
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const aiService = require('./ai/ai-service');
const logger = require('../utils/logger');

class CodeAnalysisService {
  /**
   * Analyze code for various issues
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCode(code, language, options = {}) {
    const {
      includeSecurity = true,
      includePerformance = true,
      includeBugs = true,
      includeBestPractices = true,
    } = options;

    try {
      const analysisPrompt = this.buildAnalysisPrompt(
        code,
        language,
        {
          includeSecurity,
          includePerformance,
          includeBugs,
          includeBestPractices,
        }
      );

      const response = await aiService.chat({
        provider: 'anthropic', // Use Anthropic for better analysis
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and security analyst. Provide detailed, actionable feedback on code quality, security, performance, and best practices. Always format your response as JSON.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        options: {
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 4000,
        },
      });

      // Parse the JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(response.content);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse analysis result');
        }
      }

      return this.formatAnalysisResult(analysisResult, language);
    } catch (error) {
      logger.error('Error analyzing code', {
        error: error.message,
        language,
      });
      throw error;
    }
  }

  /**
   * Security scan (SAST)
   * @param {string} code - Code to scan
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Security scan results
   */
  async securityScan(code, language) {
    try {
      const securityPrompt = this.buildSecurityPrompt(code, language);

      const response = await aiService.chat({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a security expert specializing in static application security testing (SAST). Identify security vulnerabilities, secrets, and insecure patterns. Format your response as JSON.',
          },
          {
            role: 'user',
            content: securityPrompt,
          },
        ],
        options: {
          temperature: 0.2,
          max_tokens: 3000,
        },
      });

      let scanResult;
      try {
        scanResult = JSON.parse(response.content);
      } catch (parseError) {
        const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          scanResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse security scan result');
        }
      }

      return this.formatSecurityResult(scanResult, language);
    } catch (error) {
      logger.error('Error in security scan', {
        error: error.message,
        language,
      });
      throw error;
    }
  }

  /**
   * Performance analysis
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Performance analysis results
   */
  async performanceAnalysis(code, language) {
    try {
      const performancePrompt = this.buildPerformancePrompt(code, language);

      const response = await aiService.chat({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a performance optimization expert. Analyze code for performance bottlenecks, inefficiencies, and optimization opportunities. Format your response as JSON.',
          },
          {
            role: 'user',
            content: performancePrompt,
          },
        ],
        options: {
          temperature: 0.3,
          max_tokens: 3000,
        },
      });

      let analysisResult;
      try {
        analysisResult = JSON.parse(response.content);
      } catch (parseError) {
        const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse performance analysis result');
        }
      }

      return this.formatPerformanceResult(analysisResult, language);
    } catch (error) {
      logger.error('Error in performance analysis', {
        error: error.message,
        language,
      });
      throw error;
    }
  }

  /**
   * Detect secrets in code
   * @param {string} code - Code to scan
   * @returns {Promise<Array>} Detected secrets
   */
  async detectSecrets(code) {
    // Common secret patterns
    const secretPatterns = [
      {
        name: 'API Key',
        pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
        severity: 'high',
      },
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/gi,
        severity: 'critical',
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
        severity: 'critical',
      },
      {
        name: 'Password',
        pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/gi,
        severity: 'high',
      },
      {
        name: 'Token',
        pattern: /(?:token|bearer)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{32,})['"]?/gi,
        severity: 'high',
      },
      {
        name: 'Secret',
        pattern: /(?:secret|secret[_-]?key)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
        severity: 'high',
      },
    ];

    const detectedSecrets = [];

    for (const pattern of secretPatterns) {
      const matches = [...code.matchAll(pattern.pattern)];
      for (const match of matches) {
        detectedSecrets.push({
          type: pattern.name,
          severity: pattern.severity,
          line: this.getLineNumber(code, match.index),
          snippet: this.getCodeSnippet(code, match.index, 50),
          recommendation: `Remove ${pattern.name.toLowerCase()} from code. Use environment variables or a secrets manager.`,
        });
      }
    }

    return detectedSecrets;
  }

  /**
   * Build analysis prompt
   */
  buildAnalysisPrompt(code, language, options) {
    const parts = [];

    parts.push(`Analyze the following ${language} code:`);
    parts.push('\n```' + language);
    parts.push(code);
    parts.push('```\n');

    parts.push('Provide a comprehensive analysis including:');

    if (options.includeSecurity) {
      parts.push('- Security vulnerabilities (SQL injection, XSS, etc.)');
    }
    if (options.includePerformance) {
      parts.push('- Performance issues and optimization opportunities');
    }
    if (options.includeBugs) {
      parts.push('- Potential bugs and logic errors');
    }
    if (options.includeBestPractices) {
      parts.push('- Best practices and code quality improvements');
    }

    parts.push('\nFormat your response as JSON with the following structure:');
    parts.push(JSON.stringify({
      summary: 'Brief summary of findings',
      security: [{ issue: '...', severity: 'high|medium|low', line: 1, recommendation: '...' }],
      performance: [{ issue: '...', severity: 'high|medium|low', line: 1, recommendation: '...' }],
      bugs: [{ issue: '...', severity: 'high|medium|low', line: 1, recommendation: '...' }],
      bestPractices: [{ issue: '...', severity: 'high|medium|low', line: 1, recommendation: '...' }],
      overallScore: 85, // 0-100
    }, null, 2));

    return parts.join('\n');
  }

  /**
   * Build security prompt
   */
  buildSecurityPrompt(code, language) {
    return `Perform a security scan on the following ${language} code. Look for:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Authentication/authorization issues
- Insecure data handling
- Secrets and credentials
- Insecure dependencies
- Input validation issues
- Cryptographic weaknesses

Code:
\`\`\`${language}
${code}
\`\`\`

Format your response as JSON:
{
  "summary": "Security assessment summary",
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "high",
      "line": 10,
      "description": "...",
      "recommendation": "...",
      "cwe": "CWE-89"
    }
  ],
  "secrets": [
    {
      "type": "API Key",
      "line": 5,
      "snippet": "...",
      "recommendation": "..."
    }
  ],
  "riskScore": 65,
  "overallSeverity": "high|medium|low"
}`;
  }

  /**
   * Build performance prompt
   */
  buildPerformancePrompt(code, language) {
    return `Analyze the following ${language} code for performance issues:
- Time complexity issues
- Space complexity issues
- Unnecessary computations
- Inefficient algorithms
- Memory leaks
- Database query optimization
- Network request optimization
- Caching opportunities

Code:
\`\`\`${language}
${code}
\`\`\`

Format your response as JSON:
{
  "summary": "Performance analysis summary",
  "issues": [
    {
      "type": "N+1 Query Problem",
      "severity": "high",
      "line": 15,
      "description": "...",
      "recommendation": "...",
      "impact": "High - causes multiple database queries"
    }
  ],
  "optimizations": [
    {
      "type": "Add caching",
      "line": 20,
      "description": "...",
      "expectedImprovement": "50% reduction in response time"
    }
  ],
  "performanceScore": 70
}`;
  }

  /**
   * Format analysis result
   */
  formatAnalysisResult(result, language) {
    return {
      language,
      summary: result.summary || 'Analysis completed',
      security: result.security || [],
      performance: result.performance || [],
      bugs: result.bugs || [],
      bestPractices: result.bestPractices || [],
      overallScore: result.overallScore || 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format security result
   */
  formatSecurityResult(result, language) {
    return {
      language,
      summary: result.summary || 'Security scan completed',
      vulnerabilities: result.vulnerabilities || [],
      secrets: result.secrets || [],
      riskScore: result.riskScore || 0,
      overallSeverity: result.overallSeverity || 'low',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format performance result
   */
  formatPerformanceResult(result, language) {
    return {
      language,
      summary: result.summary || 'Performance analysis completed',
      issues: result.issues || [],
      optimizations: result.optimizations || [],
      performanceScore: result.performanceScore || 0,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get line number from index
   */
  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Get code snippet around index
   */
  getCodeSnippet(code, index, context = 50) {
    const start = Math.max(0, index - context);
    const end = Math.min(code.length, index + context);
    return code.substring(start, end);
  }
}

module.exports = new CodeAnalysisService();

