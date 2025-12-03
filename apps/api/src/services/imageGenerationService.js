/**
 * Image Generation Service
 * Handles AI image generation using DALL-E
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const OpenAI = require('openai');
const config = require('../config');
const s3Service = require('./s3Service');
const logger = require('../utils/logger');

class ImageGenerationService {
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
   * Check if image generation is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Optimize prompt for better image generation
   * @param {string} prompt - User prompt
   * @param {string} style - Style preference
   * @returns {string} Optimized prompt
   */
  optimizePrompt(prompt, style = 'realistic') {
    const stylePrefixes = {
      realistic: 'A photorealistic image of',
      artistic: 'An artistic illustration of',
      cartoon: 'A cartoon-style image of',
      abstract: 'An abstract representation of',
      vintage: 'A vintage-style image of',
    };

    const prefix = stylePrefixes[style] || stylePrefixes.realistic;
    
    // Enhance prompt with quality descriptors
    const enhanced = `${prefix} ${prompt}, high quality, detailed, professional photography, 4k resolution`;
    
    return enhanced;
  }

  /**
   * Generate image using DALL-E
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      size = '1024x1024',
      style = 'realistic',
      quality = 'standard',
      n = 1,
    } = options;

    try {
      const optimizedPrompt = this.optimizePrompt(prompt, style);

      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        size: size,
        quality: quality,
        n: Math.min(n, 1), // DALL-E 3 only supports n=1
        response_format: 'url', // or 'b64_json'
      });

      const imageData = response.data[0];

      logger.info('Image generated', {
        prompt: prompt.substring(0, 50),
        size,
        style,
      });

      return {
        url: imageData.url,
        revisedPrompt: imageData.revised_prompt || optimizedPrompt,
        size,
        style,
      };
    } catch (error) {
      logger.error('Error generating image', {
        error: error.message,
        prompt: prompt.substring(0, 50),
      });
      throw error;
    }
  }

  /**
   * Generate image and store in S3
   * @param {string} userId - User ID
   * @param {string} prompt - Image prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Image record with S3 URL
   */
  async generateAndStoreImage(userId, prompt, options = {}) {
    try {
      // Generate image
      const imageResult = await this.generateImage(prompt, options);

      // Download image from OpenAI
      const https = require('https');
      const http = require('http');
      const url = require('url');
      
      const imageBuffer = await new Promise((resolve, reject) => {
        const parsedUrl = new URL(imageResult.url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        client.get(parsedUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download image: ${response.statusCode}`));
            return;
          }
          
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }).on('error', reject);
      });

      // Add watermark if needed
      let finalBuffer = imageBuffer;
      if (options.addWatermark !== false) {
        finalBuffer = await this.addWatermark(imageBuffer);
      }

      // Upload to S3
      const filename = `generated-${Date.now()}.png`;
      const s3Key = s3Service.generateKey(userId, filename, 'images/generated');
      
      const s3Result = await s3Service.uploadFile(
        finalBuffer,
        s3Key,
        'image/png',
        {
          userId,
          prompt: prompt.substring(0, 200),
          revisedPrompt: imageResult.revisedPrompt?.substring(0, 200),
          size: imageResult.size,
          style: imageResult.style,
          generatedAt: new Date().toISOString(),
        }
      );

      return {
        s3Key,
        s3Url: s3Result.url,
        originalUrl: imageResult.url,
        revisedPrompt: imageResult.revisedPrompt,
        size: imageResult.size,
        style: imageResult.style,
        buffer: finalBuffer,
      };
    } catch (error) {
      logger.error('Error generating and storing image', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Create image variations (using DALL-E 2 style approach)
   * Note: DALL-E 3 doesn't support variations, so we generate new images with modified prompts
   * @param {string} basePrompt - Base prompt
   * @param {number} count - Number of variations
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Array of generated images
   */
  async createVariations(basePrompt, count = 4, options = {}) {
    const variations = [];
    const variationModifiers = [
      'in a different style',
      'with different lighting',
      'from a different angle',
      'with different colors',
    ];

    for (let i = 0; i < count; i++) {
      const modifier = variationModifiers[i % variationModifiers.length];
      const variationPrompt = `${basePrompt}, ${modifier}`;
      
      try {
        const image = await this.generateImage(variationPrompt, options);
        variations.push({
          ...image,
          variationIndex: i + 1,
        });
      } catch (error) {
        logger.warn('Error generating variation', {
          error: error.message,
          index: i,
        });
        // Continue with other variations
      }
    }

    return variations;
  }

  /**
   * Add watermark to image
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Buffer>} Watermarked image buffer
   */
  async addWatermark(imageBuffer) {
    try {
      // For now, return original buffer
      // In production, use sharp or similar to add watermark
      // This is a placeholder - actual watermark implementation would require image processing
      return imageBuffer;
    } catch (error) {
      logger.warn('Error adding watermark, returning original', {
        error: error.message,
      });
      return imageBuffer;
    }
  }
}

module.exports = new ImageGenerationService();

