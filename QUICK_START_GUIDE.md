# HenryMo AI - Quick Start Guide

**Get up and running in minutes!**

---

## 🚀 Prerequisites

- Node.js 18+ and pnpm installed
- Docker Desktop installed
- PostgreSQL client (optional, for direct DB access)

---

## 📦 Step 1: Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies (if needed)
cd apps/hub/hub
pnpm add @radix-ui/react-tabs @radix-ui/react-progress
cd ../../..
```

---

## 🗄️ Step 2: Start Database

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Wait for database to be ready (about 10 seconds)
```

---

## 🔧 Step 3: Setup Environment Variables

### Backend (`apps/api/.env`)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/henmo_ai_dev
DB_HOST=localhost
DB_PORT=5433
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Providers
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (optional, for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pinecone (optional, for vector search)
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=henrymo-ai-memories
```

### Frontend (`apps/hub/hub/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🗄️ Step 4: Run Database Migrations

```bash
cd packages/database

# Run full schema (if first time)
node scripts/migrate.js schema

# Or run Stage 8 tables only
psql -U postgres -d henmo_ai_dev -h localhost -p 5433 -f scripts/add-stage8-tables.sql
```

---

## 🚀 Step 5: Start Development Servers

### Terminal 1: API Server
```bash
cd apps/api
pnpm dev
```

API will run on: `http://localhost:4000`

### Terminal 2: Frontend Server
```bash
cd apps/hub/hub
pnpm dev
```

Frontend will run on: `http://localhost:3000`

---

## 👤 Step 6: Create Super Admin Account

### Option 1: Using PowerShell Script
```powershell
pwsh -File CREATE_SUPER_ADMIN.ps1
```

### Option 2: Using SQL
```sql
-- Connect to database
psql -U postgres -d henmo_ai_dev -h localhost -p 5433

-- Insert super admin (password: 1995Mobuchi@.)
-- Use CREATE_SUPER_ADMIN.ps1 to generate correct password hash
```

---

## 🎯 Step 7: Access the Platform

1. **Frontend:** Open `http://localhost:3000`
2. **Login:** Use super admin credentials
3. **API:** Test at `http://localhost:4000/api/health`

---

## 📋 Step 8: Initialize Stage 8 Modules

After logging in as super admin:

1. Navigate to `/dashboard/admin/modules`
2. Or use the API to register modules:
```bash
POST http://localhost:4000/api/motherboard/modules
{
  "name": "authentication",
  "version": "1.0.0",
  "dependencies": [],
  "metadata": {
    "description": "User authentication and authorization",
    "category": "core"
  }
}
```

---

## ✅ Verification Checklist

- [ ] Database is running (`docker ps`)
- [ ] API server is running (`http://localhost:4000/api/health`)
- [ ] Frontend is running (`http://localhost:3000`)
- [ ] Can login as super admin
- [ ] Can access admin dashboard
- [ ] Can access control panel
- [ ] Database tables created (check with `\dt` in psql)

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps

# Check port
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Windows: Find process using port 4000
netstat -ano | findstr :4000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Module Not Found Errors
```bash
# Reinstall dependencies
pnpm install

# Clear cache
pnpm store prune
```

### Frontend Build Errors
```bash
cd apps/hub/hub
pnpm install
pnpm build
```

---

## 📚 Next Steps

1. **Explore Features:**
   - ChatBoss AI Assistant
   - Media Studio
   - Streets Platform
   - Admin Dashboard

2. **Test Stage 8 Features:**
   - Control Panel
   - Module Management
   - Training Dashboard
   - Monitoring Dashboard
   - Developer Console

3. **Read Documentation:**
   - `HENRYMO_AI_DOCUMENTATION.md`
   - `28_DAY_ROADMAP.md`
   - `STAGE_8_ADVANCED_FEATURES.md`

---

## 🎉 You're Ready!

The platform is now running and ready for development and testing!

**Happy Coding! 🚀**

---

**Created by:** Henry Maobughichi Ugochukwu  
**Last Updated:** December 3, 2024

