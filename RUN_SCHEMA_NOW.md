# Run Database Schema Now - Quick Commands

## Step-by-Step (Copy and paste these commands)

### Step 1: Install Database Package Dependencies

```powershell
cd packages/database
pnpm install
```

### Step 2: Make Sure Environment File Exists

Create `apps/api/.env` if it doesn't exist with:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

### Step 3: Run the Schema

```powershell
# From packages/database directory
node scripts/migrate.js schema
```

### Step 4: Verify Tables Were Created

```powershell
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
```

### Step 5: Seed Initial Data

```powershell
node scripts/seed.js
```

## Alternative: Direct SQL Method

If the script method doesn't work, use this:

```powershell
# Copy schema file into container
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql

# Run it
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

## What You Should See

After running the schema, when you list tables:
```
                 List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | users                 | table | postgres
 public | conversations         | table | postgres
 public | messages              | table | postgres
 public | ai_memory             | table | postgres
 public | countries             | table | postgres
 public | states                | table | postgres
 ... (and many more)
```

If you see tables listed, the schema was applied successfully! 🎉

