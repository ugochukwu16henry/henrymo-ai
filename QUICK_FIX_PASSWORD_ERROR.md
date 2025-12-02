# ⚡ Quick Fix: Password Authentication Error

**Error:** `password authentication failed for user "postgres"`

---

## 🔍 The Problem

The database container exists with an old password, or the connection string doesn't match.

---

## ✅ Solution 1: Reset Database (Fastest - if data loss is okay)

If you don't need existing data, reset everything:

```powershell
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Wait 15 seconds for initialization
Start-Sleep -Seconds 15

# Verify
docker-compose ps postgres
```

**Or use the automated script:**
```powershell
.\RESET_DATABASE_PASSWORD.ps1
```

---

## ✅ Solution 2: Verify Connection String

Check that `apps/api/.env` has:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

**Or use individual parameters:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## ✅ Solution 3: Check Database Volume

The existing database volume might have a different password.

**Reset volume only:**
```powershell
docker-compose stop postgres
docker volume rm henrymo-ai_postgres_data
docker-compose up -d postgres
```

Wait 15 seconds, then test again.

---

## 🧪 Test Connection

After fixing, test:

```powershell
cd apps/api
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ host: 'localhost', port: 5432, database: 'henmo_ai_dev', user: 'postgres', password: 'postgres' }); pool.query('SELECT NOW()').then(() => { console.log('✅ Success!'); process.exit(0); }).catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });"
```

---

## 📋 Complete Reset Steps

1. **Stop and remove everything:**
   ```powershell
   docker-compose down -v
   ```

2. **Start fresh database:**
   ```powershell
   docker-compose up -d postgres
   ```

3. **Wait for initialization:**
   ```powershell
   Start-Sleep -Seconds 15
   ```

4. **Verify .env file has correct password:**
   ```powershell
   cd apps/api
   # Check DATABASE_URL contains: postgres:postgres@
   ```

5. **Test connection:**
   ```powershell
   node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(() => console.log('✅ Success')).catch(e => console.error('❌', e.message));"
   ```

6. **Start API server:**
   ```powershell
   pnpm run dev
   ```

---

## 🎯 Most Likely Fix

**Just reset the database volume:**

```powershell
docker-compose down -v
docker-compose up -d postgres
```

Wait 15 seconds, then start API server!

---

**This will work!** 🚀

