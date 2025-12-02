/**
 * Security Middleware
 * Additional security headers and protections
 * 
 * @author Henry Maobughichi Ugochukwu
 */

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // X-Content-Type-Options: Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options: Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection: Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy: Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy: Restrict browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};

/**
 * Request ID middleware
 * Adds unique ID to each request for tracking
 */
let requestIdCounter = 0;
const requestId = (req, res, next) => {
  req.id = `req-${Date.now()}-${++requestIdCounter}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * IP address extraction middleware
 */
const extractIP = (req, res, next) => {
  req.realIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown';
  
  next();
};

module.exports = {
  securityHeaders,
  requestId,
  extractIP,
};

