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
      let streamError = null;

      const onChunk = (chunk) => {
        try {
          if (!res.closed) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
          }
        } catch (error) {
          logger.warn('Error writing chunk to stream', { error: error.message });
        }
      };

      try {
        // Get relevant memories for context (with timeout)
        let enhancedMessages = [...messages];
        let relevantMemories = [];

        try {
          // Build context from recent messages
          const recentMessages = messages.slice(-3); // Last 3 messages
          const contextText = recentMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

          // Get relevant memories with timeout
          const memoryPromise = semanticSearchService.getRelevantMemoriesForContext(
            req.user.id,
            contextText,
            {
              maxMemories: 5,
              minScore: 0.75,
            }
          );

          // 5 second timeout for memory retrieval
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Memory retrieval timeout')), 5000)
          );

          relevantMemories = await Promise.race([memoryPromise, timeoutPromise]);

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

        // Stream chat with timeout
        const streamPromise = aiService.streamChat(
          {
            provider,
            model,
            messages: enhancedMessages,
            options,
          },
          onChunk
        );

        // 60 second timeout for AI streaming
        const streamTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI streaming timeout')), 60000)
        );

        let response;
        try {
          response = await Promise.race([streamPromise, streamTimeoutPromise]);
        } catch (raceError) {
          // If timeout or other error, still try to send done event
          logger.error('Stream promise error', {
            error: raceError.message,
            userId: req.user?.id,
          });
          throw raceError;
        }

        fullContent = response?.content || '';
        finalUsage = response?.usage || { inputTokens: 0, outputTokens: 0 };

        // Track usage (don't wait for it)
        if (finalUsage && response) {
          costTrackingService.trackUsage({
            userId: req.user.id,
            conversationId,
            provider: response.provider,
            model: response.model,
            inputTokens: finalUsage.inputTokens || 0,
            outputTokens: finalUsage.outputTokens || 0,
          }).catch(err => {
            logger.warn('Failed to track usage', { error: err.message });
          });
        }

        // Always send final message with memory context
        if (!res.closed && response) {
          res.write(
            `data: ${JSON.stringify({
              type: 'done',
              usage: finalUsage,
              provider: response.provider,
              model: response.model,
              memoriesUsed: relevantMemories.length,
            })}\n\n`
          );
        } else if (!res.closed) {
          // If response is null/undefined, still send done with empty usage
          res.write(
            `data: ${JSON.stringify({
              type: 'done',
              usage: { inputTokens: 0, outputTokens: 0 },
              provider: provider || 'unknown',
              model: model || 'unknown',
              memoriesUsed: relevantMemories.length,
            })}\n\n`
          );
        }
      } catch (error) {
        streamError = error;
        logger.error('Error in AI stream', {
          error: error.message,
          userId: req.user?.id,
          stack: error.stack,
        });

        if (!res.closed) {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              error: error.message || 'Failed to generate response',
            })}\n\n`
          );
        }
      } finally {
        // Always close the stream
        if (!res.closed) {
          res.end();
        }
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

