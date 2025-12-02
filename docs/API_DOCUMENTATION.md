# API Documentation

**HenryMo AI - Backend API Reference**

**Base URL:** `http://localhost:4000/api` (development)  
**Version:** 1.0.0

---

## 🔐 Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### Health & Info

#### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0",
  "requestId": "req-1234567890-1",
  "database": {
    "status": "healthy",
    "database": "henmo_ai_dev"
  }
}
```

#### `GET /api/info`

API information endpoint.

**Response:**
```json
{
  "name": "HenryMo AI API",
  "version": "1.0.0",
  "description": "Enterprise AI Development Platform API",
  "author": "Henry Maobughichi Ugochukwu",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "conversations": "/api/conversations",
    "memory": "/api/memory",
    "admin": "/api/admin"
  }
}
```

---

## 🔄 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details (development only)
  }
}
```

---

## 🚦 Rate Limiting

API endpoints are rate limited:

- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes
- **Password reset:** 3 requests per hour
- **Registration:** 3 requests per hour

Rate limit headers:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time

---

## 🔒 Security Headers

All responses include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Request-ID` - Unique request identifier

---

## 📚 More Endpoints

Additional endpoints will be documented as they are implemented:

- Authentication endpoints (Stage 2)
- Conversation endpoints (Stage 3)
- Memory endpoints (Stage 4)
- Admin endpoints (Stage 7)

---

## 🧪 Testing

Use tools like:
- **Postman** - API testing
- **curl** - Command line testing
- **Thunder Client** - VS Code extension

**Example:**
```bash
curl http://localhost:4000/api/health
```

---

## 📖 Additional Resources

- [Development Setup](./DEVELOPMENT_SETUP.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [28-Day Roadmap](../28_DAY_ROADMAP.md)

---

**Created by:** Henry Maobughichi Ugochukwu (Super Admin)  
**Last Updated:** December 2025

