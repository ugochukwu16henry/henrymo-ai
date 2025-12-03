# HenryMo AI API - Complete Endpoints Documentation
**Version:** 1.0.0  
**Base URL:** `http://localhost:4000/api`  
**Last Updated:** December 3, 2024

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [AI & Chat](#ai--chat)
4. [Conversations](#conversations)
5. [Memory](#memory)
6. [Code Analysis](#code-analysis)
7. [Debugging](#debugging)
8. [File Upload](#file-upload)
9. [Media Generation](#media-generation)
10. [Streets Platform](#streets-platform)
11. [Contributions](#contributions)
12. [Verifications](#verifications)
13. [Admin](#admin)
14. [Payment](#payment)
15. [Financial](#financial)
16. [Analytics](#analytics)
17. [Email](#email)
18. [Social Media](#social-media)
19. [API Keys](#api-keys)
20. [Stage 8 - Advanced Features](#stage-8---advanced-features)

---

## Authentication

**Base Path:** `/api/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and get JWT token |
| GET | `/auth/me` | ✅ | Get current user info |
| POST | `/auth/refresh` | ✅ | Refresh JWT token |
| POST | `/auth/logout` | ✅ | Logout (client-side token removal) |

---

## Users

**Base Path:** `/api/users`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/users/me` | ✅ | Get current user profile |
| GET | `/users/:id` | ✅ | Get user by ID |
| PUT | `/users/:id` | ✅ | Update user profile |
| POST | `/users/:id/change-password` | ✅ | Change password |
| DELETE | `/users/:id` | ✅ | Delete user account |
| GET | `/users` | ✅ Admin | List all users (admin only) |
| PUT | `/users/:id/role` | ✅ Admin | Update user role (admin only) |
| PUT | `/users/:id/subscription` | ✅ Admin | Update subscription tier (admin only) |
| PUT | `/users/:id/suspend` | ✅ Admin | Suspend/unsuspend user (admin only) |

---

## AI & Chat

**Base Path:** `/api/ai`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/ai/providers` | ✅ | Get available AI providers |
| POST | `/ai/chat/stream` | ✅ | Stream AI chat response (SSE) |
| GET | `/ai/usage` | ✅ | Get AI usage statistics |

**Stream Chat Request Body:**
```json
{
  "provider": "anthropic" | "openai",
  "model": "claude-3-opus-20240229" | "gpt-4",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "options": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "system": "You are a helpful assistant"
  },
  "conversationId": "uuid" // optional
}
```

---

## Conversations

**Base Path:** `/api/conversations`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/conversations` | ✅ | List user's conversations |
| POST | `/conversations` | ✅ | Create new conversation |
| GET | `/conversations/:id` | ✅ | Get conversation by ID |
| PUT | `/conversations/:id` | ✅ | Update conversation |
| DELETE | `/conversations/:id` | ✅ | Delete conversation |
| GET | `/conversations/:id/messages` | ✅ | Get messages in conversation |
| POST | `/conversations/:id/messages` | ✅ | Add message to conversation |
| DELETE | `/conversations/:id/messages/:messageId` | ✅ | Delete message |

---

## Memory

**Base Path:** `/api/memory`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/memory` | ✅ | List user's memories |
| POST | `/memory` | ✅ | Create new memory |
| GET | `/memory/:id` | ✅ | Get memory by ID |
| PUT | `/memory/:id` | ✅ | Update memory |
| DELETE | `/memory/:id` | ✅ | Delete memory |
| POST | `/memory/:id/pin` | ✅ | Toggle pin status |
| GET | `/memory/search` | ✅ | Search memories (text) |
| GET | `/memory/semantic-search` | ✅ | Semantic search memories |
| GET | `/memory/tags` | ✅ | Get all user's tags |

---

## Code Analysis

**Base Path:** `/api/ai-capabilities/analyze`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/ai-capabilities/analyze` | ✅ | Analyze code |
| POST | `/ai-capabilities/analyze/security` | ✅ | Security scan |
| POST | `/ai-capabilities/analyze/performance` | ✅ | Performance analysis |
| GET | `/ai-capabilities/analyze/history` | ✅ | Get analysis history |

**Analysis Request Body:**
```json
{
  "code": "function test() { return 1; }",
  "language": "javascript",
  "analysisType": "full" | "security" | "performance"
}
```

---

## Debugging

**Base Path:** `/api/ai-capabilities/debug`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/ai-capabilities/debug` | ✅ | Debug error |
| POST | `/ai-capabilities/debug/analyze` | ✅ | Analyze error details |
| GET | `/ai-capabilities/debug/history` | ✅ | Get debugging history |

**Debug Request Body:**
```json
{
  "error": "Error message",
  "stackTrace": "Stack trace...",
  "code": "Related code",
  "context": {}
}
```

---

## File Upload

**Base Path:** `/api/upload`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/upload` | ✅ | Upload file (multipart/form-data) |
| GET | `/upload/:id` | ✅ | Get file metadata |
| GET | `/upload/:id/download` | ✅ | Get signed download URL |
| DELETE | `/upload/:id` | ✅ | Delete file |

---

## Media Generation

### Image Generation
**Base Path:** `/api/media/image`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/media/image/generate` | ✅ | Generate image with DALL-E 3 |
| GET | `/media/image/:id` | ✅ | Get generated image |
| GET | `/media/image` | ✅ | List user's generated images |
| DELETE | `/media/image/:id` | ✅ | Delete generated image |

**Image Generation Request:**
```json
{
  "prompt": "A beautiful sunset",
  "style": "vivid" | "natural",
  "size": "1024x1024" | "1024x1792" | "1792x1024",
  "quality": "standard" | "hd"
}
```

### Video Generation
**Base Path:** `/api/media/video`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/media/video/generate` | ✅ | Generate video from images |
| GET | `/media/video/:id` | ✅ | Get generated video |
| GET | `/media/video` | ✅ | List user's generated videos |
| DELETE | `/media/video/:id` | ✅ | Delete generated video |

**Video Generation Request:**
```json
{
  "imageUrls": ["url1", "url2"],
  "duration": 5,
  "fps": 30,
  "resolution": "1920x1080",
  "transition": "fade" | "slide" | "none"
}
```

---

## Streets Platform

**Base Path:** `/api/content/streets`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/content/streets/countries` | ❌ | Get all countries |
| GET | `/content/streets/states/:countryId` | ❌ | Get states by country |
| GET | `/content/streets/cities/:stateId` | ❌ | Get cities by state |
| GET | `/content/streets` | ❌ | Search streets |
| POST | `/content/streets` | ✅ | Create street |
| GET | `/content/streets/:id` | ❌ | Get street by ID |
| PUT | `/content/streets/:id` | ✅ | Update street |
| DELETE | `/content/streets/:id` | ✅ Admin | Delete street |

**Search Parameters:**
- `q` - Search query
- `countryId` - Filter by country
- `stateId` - Filter by state
- `cityId` - Filter by city
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

---

## Contributions

**Base Path:** `/api/content/contributions`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/content/contributions` | ✅ | Upload street contribution |
| GET | `/content/contributions` | ✅ | List contributions |
| GET | `/content/contributions/:id` | ✅ | Get contribution by ID |
| PUT | `/content/contributions/:id` | ✅ | Update contribution |
| POST | `/content/contributions/:id/verify` | ✅ Verifier | Verify contribution |

**Contribution Upload:**
- `multipart/form-data`
- Fields: `images[]`, `latitude`, `longitude`, `streetName`, `notes`, `countryId`, `stateId`, `cityId`

---

## Verifications

**Base Path:** `/api/content`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/content/verifications` | ✅ Verifier | List verifications |
| GET | `/content/verifications/:id` | ✅ Verifier | Get verification by ID |

---

## Admin

**Base Path:** `/api/admin`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/users` | ✅ Admin | List all users |
| PUT | `/admin/users/:id/role` | ✅ Admin | Update user role |
| POST | `/admin/invitations` | ✅ Admin | Create admin invitation |
| GET | `/admin/invitations` | ✅ Admin | List invitations |
| POST | `/admin/invitations/:token/accept` | ✅ | Accept invitation |
| GET | `/admin/analytics` | ✅ Admin | Get platform analytics |
| GET | `/admin/audit-logs` | ✅ Admin | Get audit logs |

---

## Payment

**Base Path:** `/api/payment`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/payment/create-checkout` | ✅ | Create Stripe checkout session |
| POST | `/payment/webhook` | ❌ | Stripe webhook handler |
| POST | `/payment/subscribe` | ✅ | Create subscription |
| POST | `/payment/cancel-subscription` | ✅ | Cancel subscription |

---

## Financial

**Base Path:** `/api/financial`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/financial/dashboard` | ✅ | Get financial dashboard |
| GET | `/financial/invoices` | ✅ | List invoices |
| GET | `/financial/invoices/:id` | ✅ | Get invoice by ID |
| POST | `/financial/payout-request` | ✅ | Request payout |

---

## Analytics

**Base Path:** `/api/analytics`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/analytics/overview` | ✅ | Get overview statistics |
| GET | `/analytics/usage` | ✅ | Get usage statistics |
| GET | `/analytics/costs` | ✅ | Get cost analysis |
| GET | `/analytics/providers` | ✅ | Get provider usage stats |
| GET | `/analytics/trends` | ✅ | Get daily cost trends |

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `groupBy` - Group by: `day`, `week`, `month`

---

## Email

**Base Path:** `/api/email`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/email/send` | ✅ Admin | Send custom email |
| GET | `/email/verify-config` | ✅ Admin | Verify email configuration |

---

## Social Media

**Base Path:** `/api/social-media`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/social-media/accounts/connect` | ✅ | Connect social media account |
| GET | `/social-media/accounts` | ✅ | List connected accounts |
| DELETE | `/social-media/accounts/:id` | ✅ | Disconnect account |
| POST | `/social-media/posts/schedule` | ✅ | Schedule post |
| GET | `/social-media/posts` | ✅ | List scheduled posts |
| GET | `/social-media/analytics` | ✅ | Get analytics |
| GET | `/social-media/inbox` | ✅ | Get unified inbox |
| GET | `/social-media/mentions` | ✅ | Get mentions |

---

## API Keys

**Base Path:** `/api/api-keys`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api-keys/keys` | ✅ | Create API key |
| GET | `/api-keys/keys` | ✅ | List user's API keys |
| DELETE | `/api-keys/keys/:id` | ✅ | Revoke API key |
| GET | `/api-keys/keys/:id/usage` | ✅ | Get API key usage stats |
| GET | `/api-keys/plans` | ✅ | Get API plans |
| GET | `/api-keys/subscription` | ✅ | Get user's API subscription |

---

## Stage 8 - Advanced Features

### Central Motherboard
**Base Path:** `/api/motherboard`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/motherboard/modules` | ✅ Super Admin | List registered modules |
| GET | `/motherboard/health` | ✅ Super Admin | Get system health |
| POST | `/motherboard/modules/register` | ✅ Super Admin | Register module |

### Self-Improvement
**Base Path:** `/api/self-improvement`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/self-improvement/analyze` | ✅ Super Admin | Analyze codebase |
| GET | `/self-improvement/proposals` | ✅ Super Admin | Get update proposals |
| POST | `/self-improvement/proposals/:id/apply` | ✅ Super Admin | Apply update |

### Super Admin Control
**Base Path:** `/api/super-admin`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/super-admin/proposals` | ✅ Super Admin | List proposals |
| POST | `/super-admin/proposals/:id/approve` | ✅ Super Admin | Approve proposal |
| POST | `/super-admin/proposals/:id/reject` | ✅ Super Admin | Reject proposal |
| POST | `/super-admin/modules/:id/freeze` | ✅ Super Admin | Freeze module |
| POST | `/super-admin/modules/:id/unfreeze` | ✅ Super Admin | Unfreeze module |

### Sandbox
**Base Path:** `/api/sandbox`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/sandbox/environments` | ✅ Super Admin | Create sandbox environment |
| GET | `/sandbox/environments` | ✅ Super Admin | List environments |
| POST | `/sandbox/environments/:id/test` | ✅ Super Admin | Run tests |
| DELETE | `/sandbox/environments/:id` | ✅ Super Admin | Delete environment |

### Training
**Base Path:** `/api/training`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/training/sessions` | ✅ Super Admin | Create training session |
| GET | `/training/sessions` | ✅ Super Admin | List sessions |
| GET | `/training/sessions/:id` | ✅ Super Admin | Get session details |
| POST | `/training/sessions/:id/upload` | ✅ Super Admin | Upload dataset |

### Monitoring
**Base Path:** `/api/monitoring`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/monitoring/metrics` | ✅ Super Admin | Get system metrics |
| GET | `/monitoring/diagnostics` | ✅ Super Admin | Get diagnostics |
| GET | `/monitoring/optimization` | ✅ Super Admin | Get optimization suggestions |

### Developer Console
**Base Path:** `/api/console`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/console/execute` | ✅ Super Admin | Execute console command |
| GET | `/console/logs` | ✅ Super Admin | Get system logs |
| GET | `/console/history` | ✅ Super Admin | Get command history |

---

## System Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/info` | ❌ | API information |
| GET | `/api/` | ❌ | Root endpoint with route listing |

---

## Authentication

All endpoints marked with ✅ require authentication via JWT token:

```
Authorization: Bearer <token>
```

### Role-Based Access

- **User** - Basic access
- **Contributor** - Can upload contributions
- **Verifier** - Can verify contributions
- **Moderator** - Can moderate content
- **Admin** - Full admin access
- **Super Admin** - Full system control

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- API Keys: Configurable per key (default: 60/minute, 10,000/day)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Pagination

List endpoints support pagination:

```
GET /api/endpoint?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

**Total Endpoints:** 120+  
**Last Verified:** December 3, 2024

