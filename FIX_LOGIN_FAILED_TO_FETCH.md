# Fix "Failed to Fetch" Login Error

## Problem
You're seeing "Failed to fetch" when trying to log in. This means the API server is not running or not accessible.

## Solution: Start the API Server

### Step 1: Start the API Server

Open a **new terminal window** and run:

```powershell
cd apps/api
pnpm dev
```

Or if you prefer npm:
```powershell
cd apps/api
npm run dev
```

You should see output like:
```
Server running on port 4000
Database connected successfully
```

### Step 2: Verify API Server is Running

In another terminal, test the API:
```powershell
curl http://localhost:4000/api/health
```

You should get a JSON response with `"status": "healthy"`

### Step 3: Try Logging In Again

1. Go to: `http://localhost:3000/login`
2. Use credentials:
   - **Email:** `ugochukwuhenry16@gmail.com`
   - **Password:** `1995Mobuchi@.`

## Quick Start Script

You can also use this PowerShell script to start both servers:

```powershell
# Start API Server
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/api; pnpm dev" -WindowStyle Normal

# Start Frontend (if not already running)
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/hub/hub; pnpm dev" -WindowStyle Normal
```

## Common Issues

### Issue 1: Port 4000 Already in Use
**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
1. Find the process using port 4000:
   ```powershell
   netstat -ano | findstr :4000
   ```
2. Kill the process (replace PID with the actual process ID):
   ```powershell
   taskkill /PID <PID> /F
   ```
3. Start the API server again

### Issue 2: Database Connection Error
**Error:** `password authentication failed` or `connection refused`

**Solution:**
1. Make sure Docker is running:
   ```powershell
   docker-compose up -d
   ```
2. Check database is accessible:
   ```powershell
   docker-compose ps
   ```

### Issue 3: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Check `apps/api/.env` has:
   ```
   FRONTEND_URL=http://localhost:3000
   ```
2. Restart the API server

### Issue 4: Wrong API URL
**Error:** Connection refused or timeout

**Solution:**
1. Check `apps/hub/hub/.env.local` (or `.env`) has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
2. Restart the frontend server

## Verification Checklist

- [ ] API server is running on port 4000
- [ ] Frontend is running on port 3000
- [ ] Database is running (Docker)
- [ ] API health check returns `200 OK`
- [ ] No CORS errors in browser console
- [ ] `.env` files are configured correctly

## Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check API server logs** for errors
3. **Verify database connection**:
   ```powershell
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT COUNT(*) FROM users;"
   ```
4. **Test API directly**:
   ```powershell
   curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"ugochukwuhenry16@gmail.com\",\"password\":\"1995Mobuchi@.\"}'
   ```

---

**Once the API server is running, try logging in again!**

