/**
 * AI Service Abstraction Layer
 * Provides unified interface for multiple AI providers
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const anthropicService = require('./providers/anthropic-service');
const openaiService = require('./providers/openai-service');
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * Supported AI providers
 */
const PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
};

/**
 * Default models per provider
 */
const DEFAULT_MODELS = {
  [PROVIDERS.ANTHROPIC]: 'claude-3-5-sonnet-20241022',
  [PROVIDERS.OPENAI]: 'gpt-4-turbo-preview',
};

/**
 * AI Service Class
 */
class AIService {
  constructor() {
    this.providers = {
      [PROVIDERS.ANTHROPIC]: anthropicService,
      [PROVIDERS.OPENAI]: openaiService,
    };
    this.defaultProvider = PROVIDERS.ANTHROPIC;
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const available = [];
    
    if (config.ai.anthropic.apiKey) {
      available.push({
        id: PROVIDERS.ANTHROPIC,
        name: 'Anthropic Claude',
        models: anthropicService.getAvailableModels(),
      });
    }
    
    if (config.ai.openai.apiKey) {
      available.push({
        id: PROVIDERS.OPENAI,
        name: 'OpenAI GPT',
        models: openaiService.getAvailableModels(),
      });
    }
    
    return available;
  }

  /**
   * Get default model for provider
   */
  getDefaultModel(provider) {
    return DEFAULT_MODELS[provider] || DEFAULT_MODELS[this.defaultProvider];
  }

  /**
   * Generate chat completion
   * @param {Object} options - Chat options
   * @param {string} options.provider - Provider to use
   * @param {string} options.model - Model to use
   * @param {Array} options.messages - Conversation messages
   * @param {Object} options.options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} Chat response
   */
  async chat(options = {}) {
    const {
      provider = this.defaultProvider,
      model,
      messages = [],
      options: chatOptions = {},
    } = options;

    // Validate provider
    if (!this.providers[provider]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Check if provider is configured
    const providerConfig = config.ai[provider];
    if (!providerConfig || !providerConfig.apiKey) {
      throw new Error(`Provider ${provider} is not configured. Please set API key.`);
    }

    // Use default model if not specified
    const modelToUse = model || this.getDefaultModel(provider);

    try {
      const startTime = Date.now();
      
      const response = await this.providers[provider].chat({
        model: modelToUse,
        messages,
        ...chatOptions,
      });

      const duration = Date.now() - startTime;

      // Log usage
      logger.info('AI chat completion', {
        provider,
        model: modelToUse,
        inputTokens: response.usage?.inputTokens || response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.outputTokens || response.usage?.completion_tokens || 0,
        duration,
      });

      return {
        ...response,
        provider,
        model: modelToUse,
        usage: response.usage || {},
        duration,
      };
    } catch (error) {
      logger.error('AI chat error', {
        provider,
        model: modelToUse,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate chat completion with fallback
   * Tries primary provider, falls back to secondary if it fails
   */
  async chatWithFallback(options = {}) {
    const { provider = this.defaultProvider, fallbackProvider } = options;
    
    try {
      return await this.chat(options);
    } catch (error) {
      // If fallback provider is specified and different, try it
      if (fallbackProvider && fallbackProvider !== provider) {
        logger.warn('Primary provider failed, trying fallback', {
          primary: provider,
          fallback: fallbackProvider,
          error: error.message,
        });
        
        return await this.chat({
          ...options,
          provider: fallbackProvider,
        });
      }
      
      // If no fallback specified, try the other available provider
      const availableProviders = this.getAvailableProviders();
      const otherProvider = availableProviders.find(p => p.id !== provider);
      
      if (otherProvider) {
        logger.warn('Primary provider failed, trying alternative', {
          primary: provider,
          alternative: otherProvider.id,
          error: error.message,
        });
        
        return await this.chat({
          ...options,
          provider: otherProvider.id,
        });
      }
      
      throw error;
    }
  }

  /**
   * Stream chat completion
   * @param {Object} options - Chat options
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} Final response
   */
  async streamChat(options = {}, onChunk) {
    const {
      provider = this.defaultProvider,
      model,
      messages = [],
      options: chatOptions = {},
    } = options;

    // Validate provider
    if (!this.providers[provider]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Check if provider is configured
    const providerConfig = config.ai[provider];
    if (!providerConfig || !providerConfig.apiKey) {
      throw new Error(`Provider ${provider} is not configured. Please set API key.`);
    }

    // Use default model if not specified
    const modelToUse = model || this.getDefaultModel(provider);

    try {
      const startTime = Date.now();
      
      const response = await this.providers[provider].streamChat({
        model: modelToUse,
        messages,
        ...chatOptions,
      }, onChunk);

      const duration = Date.now() - startTime;

      // Log usage
      logger.info('AI stream chat completion', {
        provider,
        model: modelToUse,
        inputTokens: response.usage?.inputTokens || response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.outputTokens || response.usage?.completion_tokens || 0,
        duration,
      });

      return {
        ...response,
        provider,
        model: modelToUse,
        usage: response.usage || {},
        duration,
      };
    } catch (error) {
      logger.error('AI stream chat error', {
        provider,
        model: modelToUse,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Calculate cost for tokens
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @param {number} inputTokens - Input tokens
   * @param {number} outputTokens - Output tokens
   * @returns {number} Cost in USD
   */
  calculateCost(provider, model, inputTokens, outputTokens) {
    if (!this.providers[provider]) {
      return 0;
    }

    return this.providers[provider].calculateCost(model, inputTokens, outputTokens);
  }
}

// Export singleton instance
module.exports = new AIService();
module.exports.PROVIDERS = PROVIDERS;
module.exports.DEFAULT_MODELS = DEFAULT_MODELS;

