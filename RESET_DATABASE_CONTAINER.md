# Reset Database Container - Complete Fix

## Problem
Database password authentication is failing. The simplest solution is to recreate the container with fresh credentials.

## Solution: Recreate Container

This will:
1. Stop and remove the old container
2. Remove the volume (⚠️ This deletes all data!)
3. Recreate everything fresh
4. Run schema again
5. Test connection

## Steps

### Option 1: Quick Reset (Keeps Data)

```powershell
# Just restart and reset password
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
docker-compose restart postgres
```

### Option 2: Complete Reset (Fresh Start)

```powershell
# Stop and remove container
docker-compose down postgres

# Remove volume (WARNING: Deletes all data!)
docker volume rm henrymo-ai_postgres_data

# Recreate container
docker-compose up -d postgres

# Wait for it to start
Start-Sleep -Seconds 5

# Run schema
cd packages/database
node scripts/migrate.js schema

# Test connection
cd ../../apps/api
node test-db-individual.js
```

## Recommended: Use Known Working Connection

Since the connection works from inside the container, we could also:
1. Use the database connection through Docker network
2. Or fix the password once and for all

Let me try a simpler approach - just ensure the password is correctly set.

