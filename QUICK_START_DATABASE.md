# Quick Start: Database Setup

**For:** Henry Maobughichi Ugochukwu (Super Admin)

## Step-by-Step Database Setup

### Step 1: Start PostgreSQL

```bash
# From project root: C:\Users\user\Documents\henrymo-ai
docker-compose up -d postgres
```

Wait a few seconds, then verify it's running:
```bash
docker-compose ps
```

You should see `henmo-ai-postgres` with status "Up".

### Step 2: Run Database Schema

**Use the migration script (EASIEST):**

```bash
cd packages/database
node scripts/migrate.js schema
```

This will:
- Connect to the database
- Run the complete schema.sql
- Create all tables

### Step 3: Verify Tables Were Created

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
```

You should see a list of tables like: users, conversations, messages, etc.

### Step 4: Seed Initial Data

```bash
cd packages/database
node scripts/seed.js
```

This creates:
- Super admin user: `admin@henrymo-ai.com`
- Password: `admin123!` ⚠️ **Change immediately!**
- 20 countries

### Step 5: Verify Super Admin

```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT email, role, name FROM users WHERE role='super_admin';"
```

## Alternative: Direct SQL Execution

If the migration script doesn't work, you can run SQL directly:

```bash
# Copy schema into container
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql

# Run it
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

Or pipe it directly:

```bash
Get-Content packages/database/schema.sql | docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev
```

## Important Notes

1. **Always use `-U postgres`** - The container uses "postgres" user, not "root"
2. **Connection from inside container:** Use `docker-compose exec postgres psql...`
3. **Connection from host:** Use connection string: `postgresql://postgres:postgres@localhost:5432/henmo_ai_dev`

## Troubleshooting the Error You Saw

**Error:** `role "root" does not exist`

**Cause:** You tried to connect without specifying the user, so it defaulted to "root"

**Fix:** Always specify the user:
```bash
docker-compose exec postgres psql -U postgres -d henmo_ai_dev
```

Notice the `-U postgres` flag!

## Test Database Connection from API

After database is set up:

1. Make sure `apps/api/.env` has:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
   ```

2. Start API server:
   ```bash
   cd apps/api
   pnpm install
   pnpm run dev
   ```

3. Test health endpoint:
   ```bash
   curl http://localhost:4000/api/health
   ```

You should see database status in the response!

