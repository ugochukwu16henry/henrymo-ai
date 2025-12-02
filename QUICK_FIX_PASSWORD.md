# Quick Fix for Database Password Authentication Error

## The Problem
PostgreSQL password authentication is failing even though the password is set correctly.

## Solution

The issue is likely related to password encryption method or pg_hba.conf configuration. Here's the quickest fix:

### Option 1: Use Trust Authentication (Development Only)

1. **Modify pg_hba.conf temporarily**:
```powershell
# Connect to container
docker exec -it henmo-ai-postgres sh

# Edit pg_hba.conf
vi /var/lib/postgresql/data/pg_hba.conf

# Change this line:
# host    all             all             all                 md5
# To:
# host    all             all             all                 trust

# Reload config
psql -U postgres -c "SELECT pg_reload_conf();"
```

**⚠️ WARNING: This disables password authentication. Only for development!**

### Option 2: Reset Everything (Recommended)

Run this script:

```powershell
.\FIX_PASSWORD_FINAL.ps1
```

### Option 3: Manual Reset

1. **Stop and remove everything**:
```powershell
docker stop henmo-ai-postgres
docker rm henmo-ai-postgres
docker volume rm henrymo-ai_postgres_data
```

2. **Start fresh**:
```powershell
docker-compose up -d postgres
```

3. **Wait 15 seconds, then test**:
```powershell
cd apps/api
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5432,database:'henmo_ai_dev',user:'postgres',password:'postgres'});p.query('SELECT NOW()',(e,r)=>{if(e)console.error(e.message);else console.log('SUCCESS');p.end();process.exit(e?1:0);});"
```

### Option 4: Check for Local PostgreSQL

If you have PostgreSQL installed locally, it might be interfering:

```powershell
# Check if local PostgreSQL is running
Get-Service -Name postgresql* -ErrorAction SilentlyContinue

# If running, stop it or use different port in docker-compose.yml
```

### Option 5: Use Different Password

Try setting a different password:

1. **In docker-compose.yml**, change:
```yaml
POSTGRES_PASSWORD: yournewpassword
```

2. **In apps/api/.env**, update:
```
DB_PASSWORD=yournewpassword
DATABASE_URL=postgresql://postgres:yournewpassword@localhost:5432/henmo_ai_dev
```

3. **Restart database**:
```powershell
docker-compose down
docker-compose up -d postgres
```

## Current Configuration

- **User**: postgres
- **Password**: postgres  
- **Database**: henmo_ai_dev
- **Port**: 5432
- **Host**: localhost

## Verification

Test connection:
```powershell
cd apps/api
node test-db-connection.js
```

Or use psql:
```powershell
docker exec -it henmo-ai-postgres psql -U postgres -d henmo_ai_dev
```

## If Nothing Works

Try connecting from inside the container (uses trust auth):
```powershell
docker exec -it henmo-ai-postgres psql -U postgres -d henmo_ai_dev
```

If that works, the issue is with external connections. Check:
- pg_hba.conf authentication method
- Firewall settings
- Port forwarding

