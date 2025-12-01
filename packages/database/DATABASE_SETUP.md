# Database Setup Guide

Quick reference for setting up and running the database.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL client tools (optional, for local connections)

## Quick Setup

### 1. Start PostgreSQL Container

```bash
# From project root
docker-compose up -d postgres
```

### 2. Wait for PostgreSQL to be Ready

```bash
# Check logs
docker-compose logs postgres

# Wait until you see: "database system is ready to accept connections"
```

### 3. Run Database Schema

**Option A: Using Migration Script (Recommended)**

```bash
# From project root
cd packages/database
node scripts/migrate.js schema
```

**Option B: Direct SQL from Host**

```bash
# Copy schema file into container and run
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

**Option C: Using Docker Exec**

```bash
# Run schema directly
docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev < packages/database/schema.sql
```

### 4. Seed Initial Data

```bash
cd packages/database
node scripts/seed.js
```

## Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** henmo_ai_dev
- **Username:** postgres
- **Password:** postgres
- **Connection String:** `postgresql://postgres:postgres@localhost:5432/henmo_ai_dev`

## Common Commands

### Connect to PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

### List All Tables

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
```

### Check Database Size

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\l+ henmo_ai_dev"
```

### Drop and Recreate Database (DANGER - Deletes all data)

```bash
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS henmo_ai_dev;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE henmo_ai_dev;"
```

### View Table Structure

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\d users"
```

### Run Custom Query

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT COUNT(*) FROM users;"
```

## Troubleshooting

### Issue: Role does not exist

**Problem:** Trying to connect as wrong user (e.g., "root" instead of "postgres")

**Solution:** Always use `-U postgres` flag:
```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

### Issue: Cannot find schema.sql file

**Problem:** File path not accessible from inside container

**Solution:** Use one of these methods:
1. Use migration script (runs from host)
2. Copy file into container first
3. Use stdin redirect from host

### Issue: Permission denied

**Problem:** Database user doesn't have required permissions

**Solution:** Ensure you're using the postgres superuser:
```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

### Issue: Connection refused

**Problem:** PostgreSQL container not running

**Solution:** Start the container:
```bash
docker-compose up -d postgres
```

Check status:
```bash
docker-compose ps
```

## Environment Variables

Make sure your `apps/api/.env` file has:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

Or individual components:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

## Next Steps

After setting up the database:
1. Verify tables were created: `\dt` in psql
2. Check super admin was created: `SELECT email FROM users WHERE role='super_admin';`
3. Test API connection: Start API server and check `/api/health` endpoint

