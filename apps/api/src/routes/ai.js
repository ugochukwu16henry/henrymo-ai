/**
 * AI Routes
 * Endpoints for AI provider management and testing
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/ai/ai-service');
const costTrackingService = require('../services/ai/cost-tracking-service');
const semanticSearchService = require('../services/semanticSearchService');
const logger = require('../utils/logger');
const { z } = require('zod');
const { validate } = require('../middleware/validate');

/**
 * GET /api/ai/providers
 * Get available AI providers
 */
router.get('/providers', authenticate, async (req, res, next) => {
  try {
    const providers = aiService.getAvailableProviders();
    
    res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    logger.error('Error getting providers', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

/**
 * POST /api/ai/chat
 * Generate chat completion
 */
router.post(
  '/chat',
  authenticate,
  validate(
    z.object({
      body: z.object({
        provider: z.string().optional(),
        model: z.string().optional(),
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
        options: z
          .object({
            temperature: z.number().min(0).max(2).optional(),
            max_tokens: z.number().positive().optional(),
            system: z.string().optional(),
          })
          .optional(),
        conversationId: z.string().uuid().optional(),
        useFallback: z.boolean().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        provider,
        model,
        messages,
        options = {},
        conversationId,
        useFallback = false,
      } = req.body;

      let response;

      if (useFallback) {
        response = await aiService.chatWithFallback({
          provider,
          model,
          messages,
          options,
        });
      } else {
        response = await aiService.chat({
          provider,
          model,
          messages,
          options,
        });
      }

      // Track usage and cost
      if (response.usage) {
        await costTrackingService.trackUsage({
          userId: req.user.id,
          conversationId,
          provider: response.provider,
          model: response.model,
          inputTokens: response.usage.inputTokens || 0,
          outputTokens: response.usage.outputTokens || 0,
        });
      }

      res.json({
        success: true,
        data: {
          content: response.content,
          provider: response.provider,
          model: response.model,
          usage: response.usage,
          finishReason: response.finishReason,
        },
      });
    } catch (error) {
      logger.error('AI chat error', {
        error: error.message,
        userId: req.user?.id,
        provider: req.body.provider,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate chat completion',
      });
    }
  }
);

/**
 * POST /api/ai/chat/stream
 * Generate streaming chat completion
 */
router.post(
  '/chat/stream',
  authenticate,
  validate(
    z.object({
      body: z.object({
        provider: z.string().optional(),
        model: z.string().optional(),
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        ),
        options: z
          .object({
            temperature: z.number().min(0).max(2).optional(),
            max_tokens: z.number().positive().optional(),
            system: z.string().optional(),
          })
          .optional(),
        conversationId: z.string().uuid().optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const {
        provider,
        model,
        messages,
        options = {},
        conversationId,
      } = req.body;

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullContent = '';
      let finalUsage = null;

      const onChunk = (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      };

      try {
        // Get relevant memories for context
        let enhancedMessages = [...messages];
        let relevantMemories = [];

        try {
          // Build context from recent messages
          const recentMessages = messages.slice(-3); // Last 3 messages
          const contextText = recentMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

          // Get relevant memories
          relevantMemories = await semanticSearchService.getRelevantMemoriesForContext(
            req.user.id,
            contextText,
            {
              maxMemories: 5,
              minScore: 0.75,
            }
          );

          // Inject memories into system message if available
          if (relevantMemories.length > 0) {
            const memoryContext = relevantMemories
              .map((mem, idx) => `Memory ${idx + 1}: ${mem.title}\n${mem.content}`)
              .join('\n\n');

            const systemMessage = {
              role: 'system',
              content: `You have access to the following relevant memories from the user:\n\n${memoryContext}\n\nUse these memories to provide more personalized and context-aware responses.`,
            };

            // Add system message at the beginning
            enhancedMessages = [systemMessage, ...messages];
          }
        } catch (error) {
          // If memory retrieval fails, continue without it
          logger.warn('Failed to retrieve memories for chat', {
            error: error.message,
            userId: req.user.id,
          });
        }

        const response = await aiService.streamChat(
          {
            provider,
            model,
            messages: enhancedMessages,
            options,
          },
          onChunk
        );

        fullContent = response.content;
        finalUsage = response.usage;

        // Track usage
        if (finalUsage) {
          await costTrackingService.trackUsage({
            userId: req.user.id,
            conversationId,
            provider: response.provider,
            model: response.model,
            inputTokens: finalUsage.inputTokens || 0,
            outputTokens: finalUsage.outputTokens || 0,
          });
        }

        // Send final message with memory context
        res.write(
          `data: ${JSON.stringify({
            type: 'done',
            usage: finalUsage,
            provider: response.provider,
            model: response.model,
            memoriesUsed: relevantMemories.length,
          })}\n\n`
        );
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            error: error.message,
          })}\n\n`
        );
      } finally {
        res.end();
      }
    } catch (error) {
      logger.error('AI stream error', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/ai/usage
 * Get user's AI usage statistics
 */
router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await costTrackingService.getUserUsageStats(
      req.user.id,
      startDate || null,
      endDate || null
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting usage stats', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
});

module.exports = router;

