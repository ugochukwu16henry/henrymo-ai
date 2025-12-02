# Fix Database Connection Issue

## Problem
Password authentication failed for user "postgres" when connecting from the API server.

## Root Cause
The PostgreSQL container might be configured with `md5` or `scram-sha-256` password authentication which requires specific connection string handling.

## Solution Options

### Option 1: Use Individual Connection Parameters (Recommended)

Instead of DATABASE_URL, use individual environment variables that might work better:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

Then modify the database config to not use connectionString when these are provided.

### Option 2: Update Connection String Format

Try different connection string formats:
- `postgresql://postgres:postgres@localhost:5432/henmo_ai_dev`
- `postgresql://postgres:postgres@127.0.0.1:5432/henmo_ai_dev`
- `postgres://postgres:postgres@localhost:5432/henmo_ai_dev`

### Option 3: Reset PostgreSQL Password

Reset the PostgreSQL password to match:
```bash
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Option 4: Update pg_hba.conf

The pg_hba.conf might need to allow password authentication from localhost.

Let me try Option 3 first - resetting the password, then Option 1 - using individual parameters.
