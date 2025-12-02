/**
 * Conversation Routes
 * Endpoints for conversation management
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');
const logger = require('../utils/logger');
const {
  createConversationSchema,
  updateConversationSchema,
  listConversationsQuerySchema,
  uuidParamSchema,
  createMessageSchema,
  updateMessageSchema,
  getMessagesQuerySchema,
} = require('../validators/conversationValidators');

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post(
  '/',
  authenticate,
  validate(z.object({ body: createConversationSchema })),
  async (req, res, next) => {
    try {
      const conversation = await conversationService.createConversation(
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      });
    } catch (error) {
      logger.error('Error creating conversation', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/conversations
 * List user conversations
 */
router.get(
  '/',
  authenticate,
  validate(z.object({ query: listConversationsQuerySchema })),
  async (req, res, next) => {
    try {
      const conversations = await conversationService.listConversations(
        req.user.id,
        req.query
      );

      res.json({
        success: true,
        data: conversations,
        count: conversations.length,
      });
    } catch (error) {
      logger.error('Error listing conversations', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/conversations/:id
 * Get conversation by ID
 */
router.get(
  '/:id',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      const conversation = await conversationService.getConversationById(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      logger.error('Error getting conversation', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * PUT /api/conversations/:id
 * Update conversation
 */
router.put(
  '/:id',
  authenticate,
  validate(
    z.object({
      params: uuidParamSchema,
      body: updateConversationSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const conversation = await conversationService.updateConversation(
        req.params.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Conversation updated successfully',
        data: conversation,
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      logger.error('Error updating conversation', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/conversations/:id
 * Delete conversation
 */
router.delete(
  '/:id',
  authenticate,
  validate(z.object({ params: uuidParamSchema })),
  async (req, res, next) => {
    try {
      await conversationService.deleteConversation(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      logger.error('Error deleting conversation', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * GET /api/conversations/:id/messages
 * Get messages for a conversation
 */
router.get(
  '/:id/messages',
  authenticate,
  validate(
    z.object({
      params: uuidParamSchema,
      query: getMessagesQuerySchema,
    })
  ),
  async (req, res, next) => {
    try {
      const messages = await messageService.getConversationMessages(
        req.params.id,
        req.user.id,
        req.query
      );

      res.json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      logger.error('Error getting conversation messages', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * POST /api/conversations/:id/messages
 * Create a message in a conversation
 */
router.post(
  '/:id/messages',
  authenticate,
  validate(
    z.object({
      params: uuidParamSchema,
      body: createMessageSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const message = await messageService.createMessage(
        req.params.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: message,
      });
    } catch (error) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found',
        });
      }

      logger.error('Error creating message', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * PUT /api/conversations/:id/messages/:messageId
 * Update a message
 */
router.put(
  '/:id/messages/:messageId',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
        messageId: z.string().uuid(),
      }),
      body: updateMessageSchema,
    })
  ),
  async (req, res, next) => {
    try {
      const message = await messageService.updateMessage(
        req.params.messageId,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error) {
      if (error.message === 'Message not found') {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      logger.error('Error updating message', {
        error: error.message,
        messageId: req.params.messageId,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/conversations/:id/messages/:messageId
 * Delete a message
 */
router.delete(
  '/:id/messages/:messageId',
  authenticate,
  validate(
    z.object({
      params: z.object({
        id: z.string().uuid(),
        messageId: z.string().uuid(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      await messageService.deleteMessage(req.params.messageId, req.user.id);

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Message not found') {
        return res.status(404).json({
          success: false,
          error: 'Message not found',
        });
      }

      logger.error('Error deleting message', {
        error: error.message,
        messageId: req.params.messageId,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

module.exports = router;

