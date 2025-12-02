# Deployment Guide

**HenryMo AI - Production Deployment Instructions**

---

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (managed database)
- AWS Account (for S3)
- Railway account (for API) or alternative
- Vercel account (for frontend) or alternative

---

## 🚀 Deployment Steps

### 1. Environment Setup

#### API Server Environment Variables

Set these in your hosting platform (Railway, Render, etc.):

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com

DATABASE_URL=postgresql://user:password@host:5432/henmo_ai
JWT_SECRET=your-production-secret-key-here

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=henmo-ai-files

PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=henmo-ai-memories

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@henrymo-ai.com

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend Hub Environment Variables

Set in Vercel or your hosting platform:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

---

### 2. Database Setup

#### Create Production Database

1. Create PostgreSQL database on your provider
2. Get connection string
3. Update `DATABASE_URL` in environment variables

#### Run Migrations

```bash
# From your deployment platform or CI/CD
cd apps/api
pnpm run migrate
```

Or manually:
```bash
cd packages/database
node scripts/migrate.js schema
```

---

### 3. API Server Deployment

#### Railway Deployment

1. Connect GitHub repository
2. Set Root Directory: `apps/api`
3. Add environment variables
4. Deploy

#### Build Command

```bash
pnpm install
cd apps/api
pnpm run build
```

#### Start Command

```bash
cd apps/api
pnpm run start
```

---

### 4. Frontend Hub Deployment

#### Vercel Deployment

1. Connect GitHub repository
2. Set Root Directory: `apps/hub/hub`
3. Add environment variables
4. Deploy

#### Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `pnpm run build`
- **Output Directory:** `.next`

---

### 5. Post-Deployment

#### Verify Deployment

1. **API Health Check:**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Frontend Access:**
   - Visit: `https://your-frontend-domain.com`
   - Verify it loads correctly

3. **Database Connection:**
   - Check API health endpoint
   - Verify database status is "healthy"

---

## 🔒 Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled
- [ ] Security headers are active
- [ ] Error messages don't expose sensitive info

---

## 📊 Monitoring

### Recommended Services

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Frontend analytics
- **Custom logging** - Application logs

---

## 🔄 Updates & Maintenance

### Updating Application

1. Pull latest changes
2. Update dependencies: `pnpm install`
3. Run migrations if needed
4. Rebuild and redeploy

### Database Migrations

```bash
cd packages/database
node scripts/migrate.js migrate
```

---

## 🆘 Troubleshooting

### API Won't Start

- Check environment variables
- Verify database connection
- Check logs for errors

### Database Connection Fails

- Verify DATABASE_URL is correct
- Check database is accessible
- Verify network/firewall settings

### Frontend Can't Connect to API

- Check CORS configuration
- Verify NEXT_PUBLIC_API_URL
- Check API is running

---

## 📚 Additional Resources

- [Development Setup](./DEVELOPMENT_SETUP.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [API Documentation](./API_DOCUMENTATION.md)

---

**Created by:** Henry Maobughichi Ugochukwu (Super Admin)

