/**
 * Middleware exports
 * Central export point for all middleware
 * 
 * @author Henry Maobughichi Ugochukwu
 */

module.exports = {
  // Error handling
  errorHandler: require('./errorHandler'),
  asyncHandler: require('./errorHandler').asyncHandler,
  
  // Logging
  requestLogger: require('./logging').requestLogger,
  
  // Rate limiting
  ...require('./rateLimiter'),
  
  // Security
  ...require('./security'),
  
  // Validation
  validate: require('./validate').validate,
  commonSchemas: require('./validate').commonSchemas,
  
  // Ownership
  ...require('./ownership'),
};

