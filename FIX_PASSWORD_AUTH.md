# Fix: Password Authentication Error

## The Problem

Password authentication failed for user "postgres". This usually means:
1. The `.env` file doesn't have the correct DATABASE_URL
2. The password in the connection string is wrong
3. The environment variable isn't being loaded

## Solutions

### Solution 1: Update the .env File (Recommended)

I just created `apps/api/.env` from the example. Verify it has the correct DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

**Make sure:**
- Username: `postgres`
- Password: `postgres` (matches docker-compose.yml)
- Host: `localhost`
- Port: `5432`
- Database: `henmo_ai_dev`

### Solution 2: Use Direct Connection (No .env needed)

The migration script now has a fallback. You can also run it with environment variable directly:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/henmo_ai_dev"
cd packages/database
node scripts/migrate.js schema
```

### Solution 3: Test Connection First

Test if the connection works:

```powershell
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT version();"
```

If this works, the database is accessible. The issue is with the Node.js connection.

### Solution 4: Run Schema Directly via Docker

Bypass the Node.js connection entirely:

```powershell
# Copy schema into container
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql

# Run it directly
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

## Quick Fix Right Now

Try this command to verify the connection string:

```powershell
# Set environment variable and run
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/henmo_ai_dev"
cd packages/database
node scripts/migrate.js schema
```

## Verify Your Docker Container Settings

Check docker-compose.yml has:
- POSTGRES_USER: postgres
- POSTGRES_PASSWORD: postgres
- POSTGRES_DB: henmo_ai_dev

These should match your connection string!

