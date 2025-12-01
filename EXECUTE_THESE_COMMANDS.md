# Execute These Commands - Database Setup

## Your PostgreSQL is Running! ✅

Container is healthy and ready. Now run the schema.

## Commands to Run (in order):

### 1. Run Database Schema

```powershell
# Make sure you're in the project root first
cd C:\Users\user\Documents\henrymo-ai

# Go to database package
cd packages/database

# Run the schema
node scripts/migrate.js schema
```

**Expected output:** You should see messages like:
- "Running schema.sql..."
- "Schema applied successfully"

### 2. Verify Tables Were Created

```powershell
# From project root
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
```

You should see a list of 20+ tables (users, conversations, messages, etc.)

### 3. Seed Initial Data

```powershell
# Still in packages/database directory
node scripts/seed.js
```

**Expected output:**
- "Seeded X countries"
- "Super admin created successfully"
- "Database seeding completed successfully"

### 4. Verify Super Admin Was Created

```powershell
# From project root
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT email, role, name FROM users WHERE role='super_admin';"
```

You should see:
```
email                  | role        | name
-----------------------+-------------+--------------------------------
admin@henrymo-ai.com   | super_admin | Henry Maobughichi Ugochukwu
```

## Important Notes

1. **Always use `-U postgres`** when connecting to database
2. The password is `postgres` (from docker-compose.yml)
3. Super admin default password is `admin123!` - **CHANGE IT IMMEDIATELY!**

## Troubleshooting

### If migration script fails:

**Option A: Run schema directly via Docker**

```powershell
# Copy schema into container
docker cp packages/database/schema.sql henmo-ai-postgres:/tmp/schema.sql

# Run it
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /tmp/schema.sql
```

**Option B: Pipe schema directly**

```powershell
Get-Content packages/database/schema.sql | docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev
```

## Success Indicators

✅ Schema script runs without errors
✅ You see 20+ tables when running `\dt`
✅ Super admin user exists in database
✅ Countries table has data

## Next Steps After Database Setup

1. Create `apps/api/.env` file if not exists
2. Add: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev`
3. Test API server connection
4. Change super admin password!

