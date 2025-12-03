/**
 * Embedding Service
 * Generates embeddings using OpenAI and stores in Pinecone
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

class EmbeddingService {
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
   * Generate embedding for text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} Embedding vector
   */
  async generateEmbedding(text) {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small', // or text-embedding-ada-002
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding', {
        error: error.message,
      });
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {string[]} texts - Array of texts to embed
   * @returns {Promise<number[][]>} Array of embedding vectors
   */
  async generateEmbeddings(texts) {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      logger.error('Error generating embeddings', {
        error: error.message,
      });
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }
}

module.exports = new EmbeddingService();

