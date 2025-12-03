# HenryMo AI - Complete Testing & Deployment Guide

**Platform:** HenryMo AI - Enterprise AI Development Platform  
**Version:** 1.0.0  
**Created by:** Henry Maobughichi Ugochukwu  
**Last Updated:** December 3, 2024

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Testing Guide](#testing-guide)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup & Migrations](#database-setup--migrations)
7. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
8. [API Deployment (Railway/Render)](#api-deployment-railwayrender)
9. [Database Deployment](#database-deployment)
10. [Post-Deployment Verification](#post-deployment-verification)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Rollback Procedures](#rollback-procedures)
13. [Troubleshooting](#troubleshooting)
14. [Security Checklist](#security-checklist)
15. [Performance Optimization](#performance-optimization)

---

## Prerequisites

### Required Software

- **Node.js** - Version 18.x or higher
- **pnpm** - Version 8.x or higher
- **Docker** - Version 20.x or higher (for local database)
- **Docker Compose** - Version 2.x or higher
- **Git** - Version 2.x or higher
- **PostgreSQL** - Version 14.x or higher (or use Docker)

### Required Accounts

- **Vercel Account** - For frontend deployment
- **Railway/Render Account** - For API deployment
- **AWS Account** - For S3 storage
- **Pinecone Account** - For vector database
- **Stripe Account** - For payments (optional)
- **Email Service** - SMTP credentials (Gmail, SendGrid, etc.)

### Required API Keys

- **Anthropic API Key** - For Claude AI
- **OpenAI API Key** - For GPT models
- **AWS Access Keys** - For S3 access
- **Pinecone API Key** - For vector search
- **Stripe API Keys** - For payments (optional)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd henrymo-ai
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Or install for specific workspace
pnpm install --filter @henrymo-ai/api
pnpm install --filter @henrymo-ai/hub
```

### Step 3: Start Database (Docker)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify database is running
docker ps
```

### Step 4: Configure Environment Variables

#### API Environment (`apps/api/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/henmo_ai_dev
DB_HOST=localhost
DB_PORT=5433
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Providers
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=henrymo-ai-media

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=henrymo-ai-embeddings

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@henrymo.ai

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
```

#### Frontend Environment (`apps/hub/hub/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=HenryMo AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Initialize Database

```bash
# Navigate to database package
cd packages/database

# Run schema migration
node scripts/migrate.js schema

# Or using Docker
docker exec -i henmo-ai-postgres psql -U postgres -d henmo_ai_dev < schema.sql
```

### Step 6: Start Development Servers

#### Terminal 1: API Server

```bash
cd apps/api
pnpm dev
```

#### Terminal 2: Frontend Server

```bash
cd apps/hub/hub
pnpm dev
```

### Step 7: Verify Setup

1. **API Health Check**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Frontend Access**
   - Open browser: `http://localhost:3000`
   - Should see landing page

3. **Database Connection**
   ```bash
   docker exec -it henmo-ai-postgres psql -U postgres -d henmo_ai_dev -c "\dt"
   ```

---

## Testing Guide

### Unit Testing

#### API Tests

```bash
cd apps/api

# Run all tests
pnpm test

# Run specific test file
pnpm test auth.test.js

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

#### Frontend Tests

```bash
cd apps/hub/hub

# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Integration Testing

#### API Integration Tests

```bash
cd apps/api

# Run integration tests
pnpm test:integration

# Test specific endpoint
pnpm test:integration -- --grep "auth"
```

#### Database Tests

```bash
cd packages/database

# Test database connection
node scripts/test-connection.js

# Test migrations
node scripts/test-migrations.js
```

### End-to-End Testing

#### Setup Playwright/Cypress

```bash
# Install E2E testing tools
pnpm add -D @playwright/test

# Run E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui
```

### Manual Testing Checklist

#### Authentication Flow

- [ ] User registration
- [ ] Email verification
- [ ] User login
- [ ] Password reset
- [ ] JWT token refresh
- [ ] Logout

#### ChatBoss Features

- [ ] Create conversation
- [ ] Send message
- [ ] Receive streaming response
- [ ] Switch AI provider
- [ ] Change model
- [ ] Save conversation
- [ ] Delete conversation

#### Media Studio

- [ ] Generate image
- [ ] Generate video
- [ ] View media library
- [ ] Download media
- [ ] Delete media

#### Streets Platform

- [ ] Search streets
- [ ] Upload contribution
- [ ] View contributions
- [ ] Verify contribution (admin)

#### Social Media

- [ ] Connect account
- [ ] Schedule post
- [ ] View analytics
- [ ] Manage inbox

#### API Keys

- [ ] Create API key
- [ ] View API keys
- [ ] Revoke API key
- [ ] Use API key in request

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Code reviewed and approved
- [ ] Dependencies updated
- [ ] Security vulnerabilities checked

### Environment Variables

- [ ] All environment variables documented
- [ ] Production values configured
- [ ] Secrets stored securely
- [ ] No hardcoded credentials

### Database

- [ ] Schema migrations tested
- [ ] Backup strategy in place
- [ ] Indexes optimized
- [ ] Foreign keys verified

### Security

- [ ] JWT secret changed
- [ ] API keys rotated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Performance

- [ ] Database queries optimized
- [ ] Caching configured
- [ ] CDN configured (if applicable)
- [ ] Image optimization enabled
- [ ] Bundle size optimized

### Documentation

- [ ] API documentation updated
- [ ] README updated
- [ ] Deployment guide reviewed
- [ ] Changelog updated

---

## Environment Configuration

### Production Environment Variables

#### API Production (Railway/Render)

```env
NODE_ENV=production
PORT=4000
API_URL=https://api.henrymo.ai
FRONTEND_URL=https://henrymo.ai

DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
ANTHROPIC_API_KEY=<production-key>
OPENAI_API_KEY=<production-key>
AWS_ACCESS_KEY_ID=<production-key>
AWS_SECRET_ACCESS_KEY=<production-secret>
AWS_S3_BUCKET=henrymo-ai-production
PINECONE_API_KEY=<production-key>
SMTP_HOST=<production-smtp>
SMTP_USER=<production-email>
SMTP_PASSWORD=<production-password>
STRIPE_SECRET_KEY=<production-key>
```

#### Frontend Production (Vercel)

```env
NEXT_PUBLIC_API_URL=https://api.henrymo.ai
NEXT_PUBLIC_APP_NAME=HenryMo AI
NEXT_PUBLIC_APP_URL=https://henrymo.ai
```

### Staging Environment

Create a staging environment similar to production but with:
- Separate database
- Test API keys
- Staging URLs
- Test payment credentials

---

## Database Setup & Migrations

### Local Database Setup

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Create database
docker exec -it henmo-ai-postgres psql -U postgres -c "CREATE DATABASE henmo_ai_dev;"

# Run migrations
cd packages/database
node scripts/migrate.js schema
```

### Production Database Setup

#### Option 1: Railway PostgreSQL

1. Create PostgreSQL service in Railway
2. Copy connection string
3. Set `DATABASE_URL` environment variable
4. Run migrations:

```bash
# Connect to production database
psql <connection-string>

# Run migrations
\i schema.sql
```

#### Option 2: Managed PostgreSQL (Supabase/Neon)

1. Create database instance
2. Get connection string
3. Run migrations via their dashboard or CLI

### Migration Scripts

```bash
# Run all migrations
node scripts/migrate.js schema

# Run specific migration
node scripts/migrate.js <migration-file>

# Rollback migration
node scripts/rollback.js <migration-name>
```

### Database Backup

```bash
# Create backup
pg_dump -U postgres -d henmo_ai_dev > backup.sql

# Restore backup
psql -U postgres -d henmo_ai_dev < backup.sql
```

---

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

```bash
cd apps/hub/hub
vercel
```

### Step 4: Configure Build Settings

Create `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm install && cd apps/hub/hub && pnpm build",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.henrymo.ai",
    "NEXT_PUBLIC_APP_NAME": "HenryMo AI",
    "NEXT_PUBLIC_APP_URL": "https://henrymo.ai"
  }
}
```

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Configure Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables

### Step 7: Configure Custom Domain

1. Go to Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

---

## API Deployment (Railway/Render)

### Railway Deployment

#### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

#### Step 2: Login

```bash
railway login
```

#### Step 3: Initialize Project

```bash
cd apps/api
railway init
```

#### Step 4: Configure Railway

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../.. && pnpm install && cd apps/api && pnpm build"
  },
  "deploy": {
    "startCommand": "node src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Step 5: Add PostgreSQL Service

1. In Railway dashboard, click "New"
2. Select "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

#### Step 6: Set Environment Variables

1. Go to Variables tab
2. Add all required environment variables
3. Reference PostgreSQL variables automatically

#### Step 7: Deploy

```bash
railway up
```

### Render Deployment

#### Step 1: Create Web Service

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your repository

#### Step 2: Configure Build

- **Build Command:** `cd apps/api && pnpm install && pnpm build`
- **Start Command:** `node src/server.js`
- **Root Directory:** `apps/api`

#### Step 3: Add PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Render will set `DATABASE_URL` automatically

#### Step 4: Set Environment Variables

Add all required environment variables in the dashboard.

#### Step 5: Deploy

Click "Create Web Service" to deploy.

---

## Database Deployment

### Production Database Options

#### Option 1: Railway PostgreSQL

- Managed PostgreSQL
- Automatic backups
- Easy scaling
- Connection pooling

#### Option 2: Supabase

- Free tier available
- Built-in auth
- Real-time subscriptions
- Dashboard included

#### Option 3: Neon

- Serverless PostgreSQL
- Auto-scaling
- Branching support
- Free tier available

#### Option 4: AWS RDS

- Enterprise-grade
- High availability
- Automated backups
- Multi-AZ support

### Database Migration Strategy

```bash
# 1. Backup current database
pg_dump <connection-string> > backup-$(date +%Y%m%d).sql

# 2. Run migrations
psql <connection-string> < migrations/latest.sql

# 3. Verify migration
psql <connection-string> -c "\dt"

# 4. Test application
# Run test suite against production database (staging)
```

---

## Post-Deployment Verification

### Health Checks

#### API Health

```bash
curl https://api.henrymo.ai/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-03T12:00:00Z",
  "version": "1.0.0"
}
```

#### Frontend Health

```bash
curl https://henrymo.ai
```

Should return HTML page.

### Functional Tests

#### Test Authentication

```bash
# Register user
curl -X POST https://api.henrymo.ai/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST https://api.henrymo.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

#### Test API Endpoints

```bash
# Get API info
curl https://api.henrymo.ai/api

# Test AI endpoint (with auth token)
curl -X POST https://api.henrymo.ai/api/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### Performance Tests

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.henrymo.ai/api/health

# Or use k6
k6 run load-test.js
```

### Security Tests

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] Authentication required
- [ ] Input validation working
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## Monitoring & Maintenance

### Application Monitoring

#### Railway Monitoring

- Built-in metrics dashboard
- Logs viewer
- Error tracking
- Resource usage

#### Vercel Monitoring

- Analytics dashboard
- Performance metrics
- Error tracking
- Web vitals

### Logging

#### API Logs

```javascript
// Winston logger configured
logger.info('Application started');
logger.error('Error occurred', { error });
```

#### Frontend Logs

```javascript
// Sentry integration
Sentry.captureException(error);
```

### Error Tracking

#### Sentry Setup

1. Create Sentry account
2. Install SDK:
   ```bash
   pnpm add @sentry/nextjs @sentry/node
   ```
3. Configure in both API and frontend

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure checks for:
- API health endpoint
- Frontend homepage
- Database connectivity

### Backup Strategy

#### Database Backups

```bash
# Daily automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backup-$DATE.sql
aws s3 cp backup-$DATE.sql s3://henrymo-ai-backups/
```

#### File Backups

- S3 versioning enabled
- Cross-region replication
- Lifecycle policies

---

## Rollback Procedures

### Frontend Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

Or via dashboard:
1. Go to Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

### API Rollback (Railway)

```bash
# List deployments
railway logs

# Rollback via dashboard
1. Go to Deployments
2. Find previous deployment
3. Click "Redeploy"
```

### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup-20241202.sql

# Or rollback specific migration
node scripts/rollback.js <migration-name>
```

### Emergency Rollback

1. **Immediate Actions**
   - Revert code changes
   - Restore database backup
   - Update environment variables
   - Redeploy previous version

2. **Communication**
   - Notify team
   - Update status page
   - Document issue

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem:** Cannot connect to database

**Solutions:**
```bash
# Check database is running
docker ps | grep postgres

# Test connection
psql -h localhost -p 5433 -U postgres -d henmo_ai_dev

# Check environment variables
echo $DATABASE_URL

# Restart database
docker-compose restart postgres
```

#### API Not Starting

**Problem:** API server fails to start

**Solutions:**
```bash
# Check port availability
lsof -i :4000

# Check environment variables
cat apps/api/.env

# Check logs
cd apps/api && pnpm dev

# Verify dependencies
pnpm install
```

#### Frontend Build Errors

**Problem:** Frontend build fails

**Solutions:**
```bash
# Clear cache
rm -rf .next node_modules

# Reinstall dependencies
pnpm install

# Check TypeScript errors
pnpm type-check

# Check linting errors
pnpm lint
```

#### CORS Errors

**Problem:** CORS errors in browser

**Solutions:**
- Verify `FRONTEND_URL` in API `.env`
- Check CORS configuration in `apps/api/src/server.js`
- Ensure frontend URL matches exactly

#### Authentication Issues

**Problem:** Login not working

**Solutions:**
- Verify JWT_SECRET is set
- Check database user table
- Verify password hashing
- Check token expiration

### Debug Mode

#### Enable Debug Logging

```env
DEBUG=*
LOG_LEVEL=debug
```

#### API Debugging

```bash
# Run with debug
DEBUG=* node src/server.js

# Check specific module
DEBUG=api:* node src/server.js
```

#### Frontend Debugging

```bash
# Enable React DevTools
# Add to .env.local
NEXT_PUBLIC_DEBUG=true
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] JWT secret is strong and unique
- [ ] API keys rotated
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] Database credentials secure
- [ ] File upload restrictions
- [ ] Error messages don't leak information

### Security Headers

```javascript
// Add to API server
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Dependency Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Use Snyk for deeper scanning
npx snyk test
```

---

## Performance Optimization

### Frontend Optimization

#### Build Optimization

```javascript
// next.config.js
module.exports = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

#### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading images

#### Caching

- Static asset caching
- API response caching
- CDN caching

### API Optimization

#### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Optimize queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

#### Caching Strategy

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache API responses
app.get('/api/data', cache(3600), async (req, res) => {
  // ...
});
```

#### Connection Pooling

```javascript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Monitoring Performance

#### Metrics to Track

- Response times
- Error rates
- Database query times
- Memory usage
- CPU usage
- Request throughput

#### Tools

- New Relic
- Datadog
- Prometheus + Grafana
- Application Insights

---

## Deployment Checklist Summary

### Before Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security checklist completed
- [ ] Performance tested
- [ ] Documentation updated

### During Deployment

- [ ] Database backup created
- [ ] Deploy to staging first
- [ ] Verify staging deployment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor deployment

### After Deployment

- [ ] Health checks passing
- [ ] Functional tests passing
- [ ] Performance metrics normal
- [ ] Error rates normal
- [ ] User acceptance testing
- [ ] Monitor for 24 hours

---

## Quick Reference Commands

### Development

```bash
# Start all services
docker-compose up -d
cd apps/api && pnpm dev &
cd apps/hub/hub && pnpm dev

# Run tests
pnpm test
pnpm test:coverage

# Database migrations
cd packages/database
node scripts/migrate.js schema
```

### Deployment

```bash
# Frontend (Vercel)
cd apps/hub/hub
vercel --prod

# API (Railway)
cd apps/api
railway up

# Database backup
pg_dump $DATABASE_URL > backup.sql
```

### Monitoring

```bash
# Check API health
curl https://api.henrymo.ai/api/health

# View logs (Railway)
railway logs

# View logs (Vercel)
vercel logs
```

---

## Support & Resources

### Documentation

- API Documentation: `/api/docs`
- Feature Documentation: `HENRYMO_AI_FEATURES.md`
- Architecture Documentation: `HENRYMO_AI_DOCUMENTATION.md`

### Contact

- **Platform Creator:** Henry Maobughichi Ugochukwu
- **Version:** 1.0.0
- **Support:** support@henrymo.ai

---

**Last Updated:** December 3, 2024  
**Document Version:** 1.0.0

