# Environment Variables Guide

Complete reference for all environment variables used in HenryMo AI platform.

---

## 📁 File Locations

- **API Server:** `apps/api/.env`
- **Frontend Hub:** `apps/hub/hub/.env.local`
- **Templates:** `apps/api/env.example.txt`

---

## 🔧 API Server Environment Variables

### Server Configuration

```env
# Server
NODE_ENV=development          # development | production | test
PORT=4000                     # API server port
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
```

### Database Configuration

```env
# Option 1: Connection String (Recommended)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev

# Option 2: Individual Parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

**Note:** If both are provided, individual parameters take precedence.

### JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d             # Token expiration (7d, 24h, etc.)
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` in production! Use a strong, random string.

### AI Provider Configuration

```env
# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI GPT
OPENAI_API_KEY=sk-your-key-here
```

### AWS S3 Configuration

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=henmo-ai-files-dev
```

### Pinecone Configuration (Vector Database)

```env
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=henmo-ai-memories
```

### Email Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@henrymo-ai.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password as `SMTP_PASS`

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Logging Configuration

```env
LOG_LEVEL=info                # error | warn | info | debug
LOG_FILE=logs/app.log
```

---

## 🎨 Frontend Hub Environment Variables

### API Configuration

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser.

---

## 🔐 Security Best Practices

### Development

- ✅ Use `.env` files (not committed to git)
- ✅ Use example files as templates
- ✅ Never commit secrets

### Production

- ✅ Use environment variables from hosting platform
- ✅ Use strong, random secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment

---

## 📝 Environment Variable Validation

The API server validates required environment variables on startup:

**Required:**
- `DATABASE_URL` (or DB_* variables)
- `JWT_SECRET`

**Optional:**
- All other variables have defaults or are optional

---

## 🧪 Testing Environment

For testing, create `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_test
JWT_SECRET=test-secret-key
```

---

## 📚 Additional Resources

- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Created by:** Henry Maobughichi Ugochukwu (Super Admin)

