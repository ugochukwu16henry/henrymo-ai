/**
 * Pinecone Service
 * Manages vector storage and retrieval in Pinecone
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const config = require('../config');
const logger = require('../utils/logger');

// Conditionally require Pinecone (graceful degradation)
let Pinecone = null;
try {
  const pineconeModule = require('@pinecone-database/pinecone');
  Pinecone = pineconeModule.Pinecone;
} catch (error) {
  logger.warn('Pinecone package not installed. Semantic search will be disabled.');
}

class PineconeService {
  constructor() {
    this.client = null;
    this.index = null;
    this.initialized = false;
  }

  async initialize() {
    if (!Pinecone) {
      logger.warn('Pinecone package not installed. Semantic search will be disabled.');
      return;
    }

    if (!config.pinecone.apiKey) {
      logger.warn('Pinecone API key not configured. Semantic search will be disabled.');
      return;
    }

    try {
      this.client = new Pinecone({
        apiKey: config.pinecone.apiKey,
      });

      // Get or create index
      const indexName = config.pinecone.indexName;
      
      try {
        // Try to get existing index
        const indexList = await this.client.listIndexes();
        const indexExists = indexList.indexes?.some(idx => idx.name === indexName);
        
        if (!indexExists) {
          logger.info(`Creating Pinecone index: ${indexName}`);
          try {
            await this.client.createIndex({
              name: indexName,
              dimension: 1536, // text-embedding-3-small dimension
              metric: 'cosine',
              spec: {
                serverless: {
                  cloud: 'aws',
                  region: 'us-east-1',
                },
              },
            });
            
            // Wait for index to be ready
            logger.info('Waiting for index to be ready...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          } catch (createError) {
            // If creation fails, try without spec (for older Pinecone accounts)
            logger.warn('Failed to create index with serverless spec, trying without spec', {
              error: createError.message,
            });
            try {
              await this.client.createIndex({
                name: indexName,
                dimension: 1536,
                metric: 'cosine',
              });
              await new Promise(resolve => setTimeout(resolve, 10000));
            } catch (retryError) {
              logger.error('Failed to create Pinecone index', {
                error: retryError.message,
              });
              // Continue anyway - index might already exist or be created manually
            }
          }
        }

        this.index = this.client.index(indexName);
        this.initialized = true;
        logger.info('Pinecone initialized successfully');
      } catch (error) {
        logger.error('Error setting up Pinecone index', {
          error: error.message,
        });
        // Don't throw - allow app to run without Pinecone
      }
    } catch (error) {
      logger.error('Error initializing Pinecone', {
        error: error.message,
      });
      // Don't throw - allow app to run without Pinecone
    }
  }

  /**
   * Check if Pinecone is available
   */
  isAvailable() {
    return this.initialized && this.index !== null;
  }

  /**
   * Upsert vector to Pinecone
   * @param {string} id - Vector ID (memory ID)
   * @param {number[]} embedding - Embedding vector
   * @param {Object} metadata - Metadata to store
   */
  async upsertVector(id, embedding, metadata = {}) {
    if (!this.isAvailable()) {
      throw new Error('Pinecone is not configured');
    }

    try {
      await this.index.upsert([
        {
          id,
          values: embedding,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        },
      ]);

      logger.info('Vector upserted to Pinecone', { id });
    } catch (error) {
      logger.error('Error upserting vector', {
        error: error.message,
        id,
      });
      throw error;
    }
  }

  /**
   * Delete vector from Pinecone
   * @param {string} id - Vector ID
   */
  async deleteVector(id) {
    if (!this.isAvailable()) {
      return; // Silently fail if not configured
    }

    try {
      await this.index.deleteOne(id);
      logger.info('Vector deleted from Pinecone', { id });
    } catch (error) {
      logger.error('Error deleting vector', {
        error: error.message,
        id,
      });
      // Don't throw - deletion is not critical
    }
  }

  /**
   * Query similar vectors
   * @param {number[]} queryEmbedding - Query embedding vector
   * @param {Object} options - Query options
   * @param {number} options.topK - Number of results
   * @param {Object} options.filter - Metadata filter
   * @param {number} options.minScore - Minimum similarity score
   * @returns {Promise<Array>} Similar vectors with scores
   */
  async querySimilar(queryEmbedding, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Pinecone is not configured');
    }

    const {
      topK = 10,
      filter = {},
      minScore = 0.7,
    } = options;

    try {
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      // Filter by minimum score and format results
      const results = queryResponse.matches
        .filter(match => match.score >= minScore)
        .map(match => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata || {},
        }));

      return results;
    } catch (error) {
      logger.error('Error querying Pinecone', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Query similar vectors for a user
   * @param {number[]} queryEmbedding - Query embedding vector
   * @param {string} userId - User ID to filter by
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Similar memories for user
   */
  async querySimilarForUser(queryEmbedding, userId, options = {}) {
    return await this.querySimilar(queryEmbedding, {
      ...options,
      filter: {
        userId,
        ...options.filter,
      },
    });
  }
}

// Initialize on module load (async)
const pineconeService = new PineconeService();
pineconeService.initialize().catch(err => {
  logger.error('Failed to initialize Pinecone', { error: err.message });
});

module.exports = pineconeService;
