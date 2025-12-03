# Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Production database configured
- [ ] Environment variables set
- [ ] API keys configured
- [ ] SSL certificates ready
- [ ] Domain names configured

### Code Preparation
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Dependencies updated
- [ ] Build scripts tested
- [ ] Migration scripts ready

### Security
- [ ] Secrets management configured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Security headers set

---

## Production Environment Variables

### API Server (.env)

```env
# Server
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/henmo_ai_prod
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=henmo_ai_prod
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# AI Providers
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=henmo-ai-files-prod

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourdomain.com

# Pinecone (Optional)
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-pinecone-env
PINECONE_INDEX_NAME=henmo-ai-index
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Database Migration

### 1. Backup Existing Database

```powershell
pg_dump -U postgres -d henmo_ai_dev > backup.sql
```

### 2. Create Production Database

```sql
CREATE DATABASE henmo_ai_prod;
CREATE USER henmo_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE henmo_ai_prod TO henmo_user;
```

### 3. Run Migrations

```powershell
cd packages/database
$env:DATABASE_URL='postgresql://user:password@host:5432/henmo_ai_prod'
node scripts/migrate.js schema
```

### 4. Seed Initial Data (Optional)

```powershell
node scripts/seed.js
```

---

## Building for Production

### API Server

```powershell
cd apps/api
pnpm install --production
pnpm build
```

### Frontend

```powershell
cd apps/hub/hub
pnpm install --production
pnpm build
```

---

## Deployment Options

### Option 1: Docker Deployment

#### Dockerfile for API

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

#### Dockerfile for Frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose for Production

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: henmo_ai_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/henmo_ai_prod
      NODE_ENV: production
    ports:
      - "4000:4000"
    depends_on:
      - postgres

  frontend:
    build: ./apps/hub/hub
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Option 2: Cloud Platform Deployment

#### Vercel (Frontend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

#### Railway/Render (API)
1. Connect GitHub repository
2. Set environment variables
3. Configure database
4. Deploy

#### AWS/GCP/Azure
1. Set up compute instances
2. Configure load balancer
3. Set up database
4. Deploy applications
5. Configure DNS

---

## Post-Deployment

### 1. Verify Deployment

```powershell
# Check API health
curl https://api.yourdomain.com/api/health

# Check frontend
curl https://yourdomain.com
```

### 2. Monitor Logs

```powershell
# API logs
docker logs -f api-container

# Database logs
docker logs -f postgres-container
```

### 3. Test Critical Paths

- [ ] Login works
- [ ] API responds
- [ ] Database connected
- [ ] File uploads work
- [ ] Email sending works

### 4. Set Up Monitoring

- [ ] Application monitoring (e.g., Sentry)
- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Log aggregation (e.g., Loggly)

---

## Backup Procedures

### Database Backup

```powershell
# Daily backup script
pg_dump -U postgres -d henmo_ai_prod | gzip > backup_$(date +%Y%m%d).sql.gz
```

### File Storage Backup

- Configure S3 versioning
- Set up cross-region replication
- Regular backup verification

---

## Rollback Procedures

### If Deployment Fails

1. **Stop new deployment**
   ```powershell
   docker-compose down
   ```

2. **Restore previous version**
   ```powershell
   git checkout previous-stable-tag
   docker-compose up -d
   ```

3. **Restore database** (if needed)
   ```powershell
   psql -U postgres -d henmo_ai_prod < backup.sql
   ```

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer
- Multiple API instances
- Database read replicas
- CDN for static assets

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching
- Use connection pooling

---

## Security Hardening

### Server Security

- [ ] Firewall configured
- [ ] SSH key-only access
- [ ] Regular security updates
- [ ] Intrusion detection

### Application Security

- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

### Database Security

- [ ] Encrypted connections
- [ ] Strong passwords
- [ ] Limited user permissions
- [ ] Regular backups
- [ ] Access logging

---

## Maintenance

### Regular Tasks

- [ ] Monitor error logs
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Security patches
- [ ] Database optimization
- [ ] Backup verification

### Update Procedures

1. Test in staging
2. Backup production
3. Deploy updates
4. Verify functionality
5. Monitor for issues

---

**Last Updated:** December 3, 2025  
**Created by:** Henry Maobughichi Ugochukwu (Super Admin)

