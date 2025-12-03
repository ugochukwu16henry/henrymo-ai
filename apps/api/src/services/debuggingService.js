/**
 * Debugging Service
 * Provides AI-powered error analysis, root cause identification, and fix suggestions
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const aiService = require('./ai/ai-service');
const logger = require('../utils/logger');

class DebuggingService {
  /**
   * Analyze and debug an error
   * @param {Object} errorData - Error information
   * @param {string} errorData.errorMessage - Error message
   * @param {string} errorData.stackTrace - Stack trace
   * @param {string} errorData.code - Related code (optional)
   * @param {string} errorData.language - Programming language
   * @param {Object} errorData.context - Additional context (optional)
   * @returns {Promise<Object>} Debugging analysis
   */
  async debugError(errorData) {
    const {
      errorMessage,
      stackTrace,
      code = null,
      language = 'javascript',
      context = {},
    } = errorData;

    try {
      const debugPrompt = this.buildDebugPrompt(
        errorMessage,
        stackTrace,
        code,
        language,
        context
      );

      const response = await aiService.chat({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are an expert debugging assistant. Analyze errors, identify root causes, and provide step-by-step debugging guidance with code fixes. Always format your response as JSON.',
          },
          {
            role: 'user',
            content: debugPrompt,
          },
        ],
        options: {
          temperature: 0.3,
          max_tokens: 4000,
        },
      });

      // Parse the JSON response
      let debugResult;
      try {
        debugResult = JSON.parse(response.content);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          debugResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse debugging result');
        }
      }

      return this.formatDebugResult(debugResult, errorMessage, stackTrace);
    } catch (error) {
      logger.error('Error in debugging service', {
        error: error.message,
        language,
      });
      throw error;
    }
  }

  /**
   * Analyze error without code context
   * @param {string} errorMessage - Error message
   * @param {string} stackTrace - Stack trace
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Error analysis
   */
  async analyzeError(errorMessage, stackTrace, language = 'javascript') {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(errorMessage, stackTrace, language);

      const response = await aiService.chat({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing error messages and stack traces. Explain what the error means, identify the root cause, and suggest fixes. Format your response as JSON.',
          },
          {
            role: 'user',
            content: analysisPrompt,
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
          throw new Error('Failed to parse analysis result');
        }
      }

      return this.formatAnalysisResult(analysisResult, errorMessage);
    } catch (error) {
      logger.error('Error analyzing error', {
        error: error.message,
        language,
      });
      throw error;
    }
  }

  /**
   * Parse stack trace
   * @param {string} stackTrace - Stack trace string
   * @returns {Array} Parsed stack trace entries
   */
  parseStackTrace(stackTrace) {
    if (!stackTrace) {
      return [];
    }

    const lines = stackTrace.split('\n');
    const entries = [];

    for (const line of lines) {
      // Match common stack trace patterns
      const patterns = [
        // JavaScript/Node.js: at functionName (file:line:column)
        /at\s+([^\s]+)\s+\(([^:]+):(\d+):(\d+)\)/,
        // JavaScript/Node.js: at file:line:column
        /at\s+([^:]+):(\d+):(\d+)/,
        // Python: File "file", line X, in function
        /File\s+"([^"]+)",\s+line\s+(\d+),\s+in\s+([^\s]+)/,
        // Java: at package.Class.method(File.java:line)
        /at\s+([^\s]+)\(([^:]+):(\d+)\)/,
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          entries.push({
            function: match[1] || match[3] || 'unknown',
            file: match[2] || match[1] || 'unknown',
            line: parseInt(match[3] || match[2] || match[2] || '0'),
            column: parseInt(match[4] || '0'),
            raw: line.trim(),
          });
          break;
        }
      }
    }

    return entries;
  }

  /**
   * Build debug prompt
   */
  buildDebugPrompt(errorMessage, stackTrace, code, language, context) {
    const parts = [];

    parts.push(`Debug the following ${language} error:`);
    parts.push(`\nError Message: ${errorMessage}`);

    if (stackTrace) {
      parts.push(`\nStack Trace:\n${stackTrace}`);
    }

    if (code) {
      parts.push(`\nRelated Code:\n\`\`\`${language}`);
      parts.push(code);
      parts.push('```');
    }

    if (Object.keys(context).length > 0) {
      parts.push(`\nAdditional Context: ${JSON.stringify(context, null, 2)}`);
    }

    parts.push('\nProvide a comprehensive debugging analysis including:');
    parts.push('- Error explanation');
    parts.push('- Root cause identification');
    parts.push('- Step-by-step debugging guide');
    parts.push('- Code fixes with explanations');
    parts.push('- Prevention suggestions');

    parts.push('\nFormat your response as JSON:');
    parts.push(JSON.stringify({
      explanation: 'What the error means',
      rootCause: 'The underlying cause',
      severity: 'high|medium|low',
      debuggingSteps: [
        {
          step: 1,
          action: 'Check...',
          explanation: '...'
        }
      ],
      fixes: [
        {
          description: 'Fix description',
          code: 'Fixed code here',
          explanation: 'Why this fixes the issue'
        }
      ],
      prevention: ['How to prevent this error in the future'],
      relatedErrors: ['Common related errors']
    }, null, 2));

    return parts.join('\n');
  }

  /**
   * Build analysis prompt
   */
  buildAnalysisPrompt(errorMessage, stackTrace, language) {
    return `Analyze this ${language} error:

Error Message: ${errorMessage}

Stack Trace:
${stackTrace}

Provide:
1. What the error means
2. Root cause
3. Common causes
4. How to fix it
5. Prevention tips

Format as JSON:
{
  "explanation": "...",
  "rootCause": "...",
  "commonCauses": ["..."],
  "fixes": ["..."],
  "prevention": ["..."],
  "severity": "high|medium|low"
}`;
  }

  /**
   * Format debug result
   */
  formatDebugResult(result, errorMessage, stackTrace) {
    return {
      errorMessage,
      stackTrace: this.parseStackTrace(stackTrace),
      explanation: result.explanation || 'Error analysis completed',
      rootCause: result.rootCause || 'Unknown',
      severity: result.severity || 'medium',
      debuggingSteps: result.debuggingSteps || [],
      fixes: result.fixes || [],
      prevention: result.prevention || [],
      relatedErrors: result.relatedErrors || [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format analysis result
   */
  formatAnalysisResult(result, errorMessage) {
    return {
      errorMessage,
      explanation: result.explanation || 'Error analysis completed',
      rootCause: result.rootCause || 'Unknown',
      commonCauses: result.commonCauses || [],
      fixes: result.fixes || [],
      prevention: result.prevention || [],
      severity: result.severity || 'medium',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new DebuggingService();

