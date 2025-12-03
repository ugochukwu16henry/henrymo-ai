/**
 * Semantic Search Service
 * Provides semantic search functionality for memories
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const embeddingService = require('./embeddingService');
const pineconeService = require('./pineconeService');
const memoryService = require('./memoryService');
const logger = require('../utils/logger');

class SemanticSearchService {
  /**
   * Search memories semantically
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Relevant memories with similarity scores
   */
  async searchMemories(userId, query, options = {}) {
    const {
      topK = 10,
      minScore = 0.7,
      contentType = null,
    } = options;

    try {
      // Generate embedding for query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Query Pinecone for similar vectors
      const filter = {};
      if (contentType) {
        filter.contentType = contentType;
      }

      const similarVectors = await pineconeService.querySimilarForUser(
        queryEmbedding,
        userId,
        {
          topK,
          minScore,
          filter,
        }
      );

      // Fetch full memory details from database
      const memoryIds = similarVectors.map(v => v.id);
      const memories = [];

      for (const vector of similarVectors) {
        try {
          const memory = await memoryService.getMemoryById(vector.id, userId);
          memories.push({
            ...memory,
            similarityScore: vector.score,
          });
        } catch (error) {
          // Memory might have been deleted, skip it
          logger.warn('Memory not found for vector', {
            memoryId: vector.id,
            userId,
          });
        }
      }

      return memories;
    } catch (error) {
      logger.error('Error in semantic search', {
        error: error.message,
        userId,
        query,
      });
      
      // Fallback to text search if semantic search fails
      if (error.message.includes('not configured')) {
        return await memoryService.searchMemories(userId, query, options);
      }
      
      throw error;
    }
  }

  /**
   * Get relevant memories for chat context
   * @param {string} userId - User ID
   * @param {string} conversationContext - Current conversation context
   * @param {Object} options - Options
   * @returns {Promise<Array>} Relevant memories for context
   */
  async getRelevantMemoriesForContext(userId, conversationContext, options = {}) {
    const {
      maxMemories = 5,
      minScore = 0.75,
    } = options;

    try {
      // Generate embedding for conversation context
      const contextEmbedding = await embeddingService.generateEmbedding(conversationContext);

      // Query for similar memories
      const similarVectors = await pineconeService.querySimilarForUser(
        contextEmbedding,
        userId,
        {
          topK: maxMemories,
          minScore,
        }
      );

      // Fetch memory details
      const memories = [];
      for (const vector of similarVectors) {
        try {
          const memory = await memoryService.getMemoryById(vector.id, userId);
          memories.push({
            ...memory,
            similarityScore: vector.score,
          });
        } catch (error) {
          // Skip deleted memories
          continue;
        }
      }

      return memories;
    } catch (error) {
      logger.error('Error getting relevant memories', {
        error: error.message,
        userId,
      });
      
      // Return empty array if semantic search not available
      if (error.message.includes('not configured')) {
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Index a memory (generate embedding and store in Pinecone)
   * @param {string} memoryId - Memory ID
   * @param {string} userId - User ID
   * @param {string} title - Memory title
   * @param {string} content - Memory content
   * @param {string} contentType - Content type
   */
  async indexMemory(memoryId, userId, title, content, contentType = 'note') {
    if (!pineconeService.isAvailable()) {
      logger.warn('Pinecone not available, skipping indexing');
      return;
    }

    try {
      // Combine title and content for embedding
      const textToEmbed = `${title}\n\n${content}`;
      
      // Generate embedding
      const embedding = await embeddingService.generateEmbedding(textToEmbed);

      // Store in Pinecone
      await pineconeService.upsertVector(memoryId, embedding, {
        userId,
        title,
        contentType,
      });

      // Update memory with vector ID
      await memoryService.updateMemory(memoryId, userId, {
        embeddingVectorId: memoryId,
      });

      logger.info('Memory indexed successfully', { memoryId });
    } catch (error) {
      logger.error('Error indexing memory', {
        error: error.message,
        memoryId,
        userId,
      });
      // Don't throw - indexing failure shouldn't break memory creation
    }
  }

  /**
   * Update memory index (regenerate embedding)
   */
  async updateMemoryIndex(memoryId, userId, title, content, contentType) {
    // Delete old vector and create new one
    await this.deleteMemoryIndex(memoryId);
    await this.indexMemory(memoryId, userId, title, content, contentType);
  }

  /**
   * Delete memory index
   */
  async deleteMemoryIndex(memoryId) {
    if (!pineconeService.isAvailable()) {
      return;
    }

    try {
      await pineconeService.deleteVector(memoryId);
    } catch (error) {
      logger.error('Error deleting memory index', {
        error: error.message,
        memoryId,
      });
    }
  }
}

module.exports = new SemanticSearchService();

