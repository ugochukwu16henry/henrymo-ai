# 🔧 Fix "password authentication failed for user 'postgres'"

**Error:** `password authentication failed for user "postgres"`

**Root Cause:** Database container is not running, or password mismatch

---

## ✅ Quick Fix

### Step 1: Start Database Container

```powershell
docker-compose up -d postgres
```

**Wait for:** Container to start (10-20 seconds)

**Verify it's running:**

```powershell
docker-compose ps postgres
```

**Expected output:** Should show STATUS as "Up"

---

### Step 2: Verify Database Connection Settings

**Check docker-compose.yml:**

- User: `postgres`
- Password: `postgres`
- Database: `henmo_ai_dev`

**Check apps/api/.env:**

- DATABASE_URL should be: `postgresql://postgres:postgres@localhost:5432/henmo_ai_dev`

---

### Step 3: Test Database Connection

```powershell
cd apps/api
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/henmo_ai_dev' }); pool.query('SELECT NOW()').then(r => { console.log('✅ Database connected!', r.rows[0]); process.exit(0); }).catch(e => { console.error('❌ Connection failed:', e.message); process.exit(1); });"
```

---

### Step 4: Start API Server

```powershell
cd apps/api
pnpm run dev
```

**Expected:** Should connect to database successfully!

---

## 🔍 Troubleshooting

### Issue: Database Container Won't Start

**Check Docker:**

```powershell
docker ps -a
```

**Check logs:**

```powershell
docker-compose logs postgres
```

**Common fixes:**

- Port 5432 already in use → Stop other PostgreSQL instances
- Volume corruption → Remove volume: `docker-compose down -v`

---

### Issue: Still Getting Password Error

**Option 1: Reset Database Container**

```powershell
docker-compose down postgres
docker volume rm henrymo-ai_postgres_data
docker-compose up -d postgres
```

**Option 2: Check .env File**

```powershell
cd apps/api
# Verify DATABASE_URL matches docker-compose.yml password
```

**Option 3: Use Individual DB Parameters**

Add to `apps/api/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## 📋 Complete Setup

1. **Database:**

   ```powershell
   docker-compose up -d postgres
   ```

2. **Verify database is running:**

   ```powershell
   docker-compose ps postgres
   ```

3. **API Server:**
   ```powershell
   cd apps/api
   pnpm run dev
   ```

---

## ✅ Success Indicators

- ✅ Database container shows STATUS: "Up"
- ✅ API server starts without password errors
- ✅ Health check: `curl http://localhost:4000/api/health`
- ✅ Database status in health check shows "healthy"

---

**Most likely fix:** Just start the database container! 🚀
