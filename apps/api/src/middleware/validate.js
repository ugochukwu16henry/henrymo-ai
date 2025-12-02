/**
 * Input Validation Middleware
 * Validates request data using Zod schemas
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { z } = require('zod');
const logger = require('../utils/logger');

/**
 * Create validation middleware from Zod schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and params
      const data = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      };

      // Validate against schema
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', {
          errors: error.errors,
          path: req.originalUrl,
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  pagination: z.object({
    query: z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
  }),
};

module.exports = {
  validate,
  commonSchemas,
};

