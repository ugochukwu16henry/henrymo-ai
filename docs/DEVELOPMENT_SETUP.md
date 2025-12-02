# Development Setup Guide

**HenryMo AI - Complete Development Environment Setup**

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Client** (Optional, for direct database access)

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Start Docker services
- ✅ Set up database schema
- ✅ Seed initial data

### Option 2: Manual Setup

Follow the steps below for manual setup.

---

## 📦 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd henrymo-ai

# Install dependencies
pnpm install
```

### Step 2: Environment Configuration

**API Server:**
```bash
cd apps/api
cp env.example.txt .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Step 3: Start Docker Services

```bash
# From project root
docker-compose up -d postgres
```

Wait for PostgreSQL to be ready (check logs):
```bash
docker-compose logs postgres
```

### Step 4: Database Setup

```bash
# Run database schema
cd packages/database
node scripts/migrate.js schema

# Seed initial data
node scripts/seed.js
```

### Step 5: Start Development Servers

**API Server:**
```bash
cd apps/api
pnpm run dev
```

Server will start on: `http://localhost:4000`

**Frontend Hub (when ready):**
```bash
cd apps/hub/hub
pnpm run dev
```

Frontend will start on: `http://localhost:3000`

---

## 🛠️ Development Scripts

### Available Scripts

**Root Level:**
- `pnpm install` - Install all dependencies
- `pnpm dev` - Run all apps in development
- `pnpm build` - Build all apps
- `pnpm test` - Run all tests

**API (`apps/api/`):**
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run migrate` - Run database migrations
- `pnpm run test` - Run tests

**Database (`packages/database/`):**
- `node scripts/migrate.js schema` - Apply database schema
- `node scripts/seed.js` - Seed initial data

### Utility Scripts

**Start Development Environment:**
```powershell
# Windows
.\scripts\dev.ps1

# Mac/Linux
./scripts/dev.sh
```

**Reset Database (⚠️ Deletes all data):**
```powershell
# Windows
.\scripts\reset-db.ps1

# Mac/Linux
./scripts/reset-db.sh
```

---

## 🗄️ Database Management

### Access Database

**Via Docker:**
```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

**Via Connection String:**
```bash
psql postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

### Common Database Operations

**List all tables:**
```sql
\dt
```

**View table structure:**
```sql
\d users
```

**Run SQL file:**
```bash
docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev < file.sql
```

---

## 🔧 Troubleshooting

### Issue: Docker not running

**Solution:**
- Start Docker Desktop
- Wait for it to fully start
- Verify: `docker ps`

### Issue: Port already in use

**Solution:**
- Check what's using the port: `netstat -ano | findstr :4000` (Windows)
- Stop the conflicting service
- Or change the port in `.env` file

### Issue: Database connection fails

**Solution:**
- Verify Docker container is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify DATABASE_URL in `.env` file
- Try restarting: `docker-compose restart postgres`

### Issue: Dependencies not installing

**Solution:**
- Clear cache: `pnpm store prune`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `pnpm install`

---

## 📚 Next Steps

After setup:
1. ✅ Verify API server: `http://localhost:4000/api/health`
2. ✅ Check database: `docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"`
3. ✅ Continue with development

---

## 🆘 Need Help?

- Check documentation in `docs/` folder
- Review `README.md` for overview
- See `28_DAY_ROADMAP.md` for development plan

---

**Created by:** Henry Maobughichi Ugochukwu (Super Admin)

