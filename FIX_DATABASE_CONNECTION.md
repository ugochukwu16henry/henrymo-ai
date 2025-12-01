# Fix: Database Connection Error

## The Problem

You tried to connect to PostgreSQL without specifying the user, which defaulted to "root". The container uses "postgres" as the database user.

**Error you saw:**
```
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL:  role "root" does not exist
```

## The Solution

Always specify the user with `-U postgres` flag.

## Correct Commands

### Method 1: Use Migration Script (RECOMMENDED - Easiest)

From your project root:

```bash
cd packages/database
node scripts/migrate.js schema
```

This script:
- Connects from your host machine
- Uses the DATABASE_URL from your .env file
- Runs the complete schema automatically

**Make sure you have:**
1. Created `apps/api/.env` file with:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
   ```

2. Installed dependencies:
   ```bash
   cd packages/database
   pnpm install
   ```

### Method 2: Connect to PostgreSQL Correctly

If you want to connect directly:

```bash
# Connect to PostgreSQL (note the -U postgres flag!)
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

Then inside psql, you can run:
```sql
\i /tmp/schema.sql  -- But first you need to copy the file
```

### Method 3: Run Schema from Host

```bash
# Copy schema file into container
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql

# Run it
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

### Method 4: Pipe Schema Directly (PowerShell)

```powershell
Get-Content packages/database/schema.sql | docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev
```

## Quick Fix Right Now

Run these commands in order:

```bash
# 1. Make sure container is running
docker-compose up -d postgres

# 2. Wait a few seconds for it to start
# Check logs: docker-compose logs postgres

# 3. Use the migration script (easiest way)
cd packages/database
node scripts/migrate.js schema

# 4. Seed initial data
node scripts/seed.js
```

## Verify It Worked

```bash
# Check tables were created
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"

# Check super admin was created (after seeding)
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT email, role FROM users WHERE role='super_admin';"
```

## Remember

- ✅ Use `-U postgres` when connecting
- ✅ User is "postgres", not "root"
- ✅ Database is "henmo_ai_dev"
- ✅ Password is "postgres" (from docker-compose.yml)

## Still Having Issues?

Check:
1. Container is running: `docker-compose ps`
2. Container logs: `docker-compose logs postgres`
3. Database exists: `docker-compose exec postgres psql -U postgres -l | grep henmo_ai_dev`

