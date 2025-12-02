/**
 * Anthropic Claude Service
 * Integration with Anthropic Claude API
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const Anthropic = require('@anthropic-ai/sdk');
const config = require('../../../config');
const logger = require('../../../utils/logger');

/**
 * Anthropic pricing per 1M tokens (as of 2024)
 */
const PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 3.00,  // $3 per 1M input tokens
    output: 15.00, // $15 per 1M output tokens
  },
  'claude-3-5-haiku-20241022': {
    input: 1.00,
    output: 5.00,
  },
  'claude-3-opus-20240229': {
    input: 15.00,
    output: 75.00,
  },
  'claude-3-sonnet-20240229': {
    input: 3.00,
    output: 15.00,
  },
  'claude-3-haiku-20240307': {
    input: 0.25,
    output: 1.25,
  },
};

class AnthropicService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  initialize() {
    if (config.ai.anthropic.apiKey) {
      this.client = new Anthropic({
        apiKey: config.ai.anthropic.apiKey,
      });
    }
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return Object.keys(PRICING);
  }

  /**
   * Generate chat completion
   */
  async chat(options = {}) {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    const {
      model = 'claude-3-5-sonnet-20241022',
      messages = [],
      temperature = 1.0,
      max_tokens = 4096,
      system,
    } = options;

    try {
      // Convert messages format if needed
      const anthropicMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return null; // System messages are separate in Anthropic
        }
        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        };
      }).filter(Boolean);

      const requestOptions = {
        model,
        messages: anthropicMessages,
        temperature,
        max_tokens,
      };

      if (system) {
        requestOptions.system = system;
      }

      const response = await this.client.messages.create(requestOptions);

      // Extract usage information
      const usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };

      // Extract content
      const content = response.content
        .map(block => block.type === 'text' ? block.text : '')
        .join('');

      return {
        content,
        usage,
        finishReason: response.stop_reason,
        model: response.model,
      };
    } catch (error) {
      logger.error('Anthropic API error', {
        error: error.message,
        model,
        status: error.status,
      });
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Stream chat completion
   */
  async streamChat(options = {}, onChunk) {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    const {
      model = 'claude-3-5-sonnet-20241022',
      messages = [],
      temperature = 1.0,
      max_tokens = 4096,
      system,
    } = options;

    try {
      // Convert messages format
      const anthropicMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return null;
        }
        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        };
      }).filter(Boolean);

      const requestOptions = {
        model,
        messages: anthropicMessages,
        temperature,
        max_tokens,
        stream: true,
      };

      if (system) {
        requestOptions.system = system;
      }

      const stream = await this.client.messages.stream(requestOptions);
      
      let fullContent = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const event of stream) {
        if (event.type === 'message_start') {
          inputTokens = event.message.usage?.input_tokens || 0;
        } else if (event.type === 'content_block_delta') {
          const delta = event.delta?.text || '';
          fullContent += delta;
          if (onChunk) {
            onChunk(delta);
          }
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage?.output_tokens || 0;
        }
      }

      return {
        content: fullContent,
        usage: {
          inputTokens,
          outputTokens,
        },
        finishReason: 'stop',
        model,
      };
    } catch (error) {
      logger.error('Anthropic stream error', {
        error: error.message,
        model,
      });
      throw new Error(`Anthropic stream error: ${error.message}`);
    }
  }

  /**
   * Calculate cost
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = PRICING[model];
    if (!pricing) {
      return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    
    return inputCost + outputCost;
  }
}

module.exports = new AnthropicService();

