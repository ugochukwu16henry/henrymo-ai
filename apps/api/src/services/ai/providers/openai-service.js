/**
 * OpenAI GPT Service
 * Integration with OpenAI GPT API
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const OpenAI = require('openai');
const config = require('../../../config');
const logger = require('../../../utils/logger');

/**
 * OpenAI pricing per 1M tokens (as of 2024)
 */
const PRICING = {
  'gpt-4-turbo-preview': {
    input: 10.00,  // $10 per 1M input tokens
    output: 30.00, // $30 per 1M output tokens
  },
  'gpt-4': {
    input: 30.00,
    output: 60.00,
  },
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
  },
  'gpt-4o': {
    input: 5.00,
    output: 15.00,
  },
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
  },
};

class OpenAIService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  initialize() {
    if (config.ai.openai.apiKey) {
      this.client = new OpenAI({
        apiKey: config.ai.openai.apiKey,
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
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-4-turbo-preview',
      messages = [],
      temperature = 1.0,
      max_tokens = 4096,
    } = options;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
      });

      const usage = {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
      };

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        usage,
        finishReason: response.choices[0]?.finish_reason || 'stop',
        model: response.model,
      };
    } catch (error) {
      logger.error('OpenAI API error', {
        error: error.message,
        model,
        status: error.status,
      });
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Stream chat completion
   */
  async streamChat(options = {}, onChunk) {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-4-turbo-preview',
      messages = [],
      temperature = 1.0,
      max_tokens = 4096,
    } = options;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
      });

      let fullContent = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          if (onChunk) {
            onChunk(delta);
          }
        }

        // Extract usage if available
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens || 0;
          outputTokens = chunk.usage.completion_tokens || 0;
        }
      }

      // If usage not in stream, estimate from content
      if (inputTokens === 0) {
        // Rough estimation (actual would need tokenizer)
        inputTokens = Math.ceil(
          messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 4
        );
        outputTokens = Math.ceil(fullContent.length / 4);
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
      logger.error('OpenAI stream error', {
        error: error.message,
        model,
      });
      throw new Error(`OpenAI stream error: ${error.message}`);
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

module.exports = new OpenAIService();

