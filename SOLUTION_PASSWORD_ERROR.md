# ✅ Solution: Password Authentication Failed for User "postgres"

## 🔍 Root Cause

The database container is running, but the existing database volume has authentication settings that prevent connections from the host machine (your Windows PC).

**The connection works inside the container** but fails when connecting from your host machine to `localhost:5432`.

---

## ✅ Quick Fix (Recommended)

### Option 1: Automated Script (Easiest)

Run the automated fix script:

```powershell
.\FIX_PASSWORD_AUTH.ps1
```

This will:
1. ✅ Stop the database container
2. ✅ Remove the old database volume (clears authentication issues)
3. ✅ Start a fresh database with correct settings
4. ✅ Test the connection automatically

**Note:** This will delete all existing data in the database. If you have important data, see Option 2 below.

---

### Option 2: Manual Reset

```powershell
# 1. Stop and remove database
docker-compose down -v

# 2. Start fresh database
docker-compose up -d postgres

# 3. Wait 20 seconds for initialization
Start-Sleep -Seconds 20

# 4. Verify it's running
docker-compose ps postgres

# 5. Test connection
cd apps/api
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ host: 'localhost', port: 5432, database: 'henmo_ai_dev', user: 'postgres', password: 'postgres' }); pool.query('SELECT NOW()').then(() => { console.log('✅ Success!'); process.exit(0); }).catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });"
```

---

## 🔧 Alternative: Fix Without Data Loss

If you need to keep existing data, you can update the password directly:

```powershell
# Connect inside container and reset password
docker exec -it henmo-ai-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Update pg_hba.conf to allow host connections
docker exec henmo-ai-postgres sh -c "echo 'host all all 0.0.0.0/0 md5' >> /var/lib/postgresql/data/pg_hba.conf"

# Reload PostgreSQL config
docker exec henmo-ai-postgres pg_ctl reload -D /var/lib/postgresql/data
```

However, this is more complex and may not work if the volume has restricted permissions.

---

## 📋 After Fixing - Complete Setup

Once the password error is fixed:

### 1. Run Database Migrations

```powershell
cd packages/database
pnpm run migrate
```

This creates all the database tables.

### 2. Seed Initial Data (Optional)

```powershell
cd packages/database
pnpm run seed
```

This creates the super admin user and initial data.

### 3. Start API Server

```powershell
cd apps/api
pnpm run dev
```

The API server should now connect successfully!

### 4. Start Frontend (if not already running)

```powershell
cd apps/hub/hub
pnpm dev
```

---

## ✅ Verify Everything Works

1. **Database is running:**
   ```powershell
   docker-compose ps postgres
   ```
   Should show STATUS: "Up"

2. **API server connects:**
   ```powershell
   curl http://localhost:4000/api/health
   ```
   Should return JSON with database status "healthy"

3. **Frontend can login:**
   - Go to http://localhost:3000/login
   - Login with super admin credentials
   - Should work without "failed to fetch" error

---

## 🎯 Most Likely Solution

**Just run the automated script:**

```powershell
.\FIX_PASSWORD_AUTH.ps1
```

Then start your API server:

```powershell
cd apps/api
pnpm run dev
```

**That's it!** The password error will be resolved. 🚀

---

## 📚 Related Files

- `FIX_PASSWORD_AUTH.ps1` - Automated fix script
- `QUICK_FIX_PASSWORD_ERROR.md` - Quick reference
- `docker-compose.yml` - Database configuration

---

**The fix is simple: reset the database volume to clear authentication issues!** ✅

