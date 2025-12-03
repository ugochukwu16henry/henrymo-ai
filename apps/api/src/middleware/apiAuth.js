/**
 * API Key Authentication Middleware
 * Validates API keys for API requests
 */

const apiKeyService = require('../services/apiKeyService');
const logger = require('../utils/logger');

/**
 * Authenticate request using API key
 */
async function authenticateApiKey(req, res, next) {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required. Provide it in X-API-Key header or Authorization: Bearer <key>',
      });
    }

    // Validate API key
    const validation = await apiKeyService.validateApiKey(apiKey);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired API key',
      });
    }

    // Attach user and key info to request
    req.apiKey = {
      id: validation.keyId,
      userId: validation.userId,
      scopes: validation.scopes,
      rateLimitPerMinute: validation.rateLimitPerMinute,
      rateLimitPerDay: validation.rateLimitPerDay,
    };
    req.user = validation.user;

    // Log API usage
    const startTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      apiKeyService.logUsage({
        apiKeyId: validation.keyId,
        userId: validation.userId,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs: responseTime,
        requestSizeBytes: JSON.stringify(req.body).length,
        responseSizeBytes: res.get('content-length') || 0,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    });

    next();
  } catch (error) {
    logger.error('API key authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Check if API key has required scope
 */
function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key authentication required',
      });
    }

    if (!req.apiKey.scopes.includes(scope) && !req.apiKey.scopes.includes('*')) {
      return res.status(403).json({
        success: false,
        error: `Required scope: ${scope}`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateApiKey,
  requireScope,
};

