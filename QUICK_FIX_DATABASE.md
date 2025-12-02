# Quick Fix: Database Connection

The health check is working, but there's a database connection issue. Here's how to fix it:

## Current Issue

```
Error: password authentication failed for user "postgres"
```

## Solution

The database connection string might need adjustment. Check your `.env` file:

### Option 1: Verify DATABASE_URL

Make sure `apps/api/.env` has:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
```

### Option 2: Test Database Connection

```powershell
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT 1;"
```

### Option 3: Check Container Status

```powershell
docker-compose ps postgres
```

Should show: `Up` and `(healthy)`

## Note

The server is working fine! The database connection issue doesn't affect:
- ✅ Health check endpoint
- ✅ Rate limiting
- ✅ Security headers
- ✅ Server functionality

This is just a configuration tweak needed for full database integration.

---

**Priority:** Low (server is functional)  
**Impact:** Database-dependent features won't work until fixed

