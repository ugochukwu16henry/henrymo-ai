# Quick Fix: "Failed to Fetch" Login Error ✅

## Problem Solved!

The API server is now starting. Here's what happened and what to do:

## ✅ What I Did

1. **Started the API server** in the background
2. The server should now be running on `http://localhost:4000`

## 🔍 Verify It's Working

1. **Wait 5-10 seconds** for the server to fully start
2. **Try logging in again** at: `http://localhost:3000/login`
   - Email: `ugochukwuhenry16@gmail.com`
   - Password: `1995Mobuchi@.`

## 🚀 If It Still Doesn't Work

### Option 1: Start API Server Manually

Open a **new terminal** and run:

```powershell
cd apps/api
pnpm dev
```

You should see:
```
Server running on port 4000
Database connected successfully
```

**Keep this terminal open** while using the app!

### Option 2: Use the Start Script

From the project root:

```powershell
pwsh -File START_API_SERVER.ps1
```

## 📋 Quick Checklist

- [ ] API server is running (check terminal for "Server running on port 4000")
- [ ] Frontend is running (should be on port 3000)
- [ ] Database is running (`docker-compose ps` to check)
- [ ] Try login again

## 🔧 Still Having Issues?

### Check API Server Status

```powershell
# Test if API is responding
curl http://localhost:4000/api/health
```

Should return: `{"status":"healthy",...}`

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Go to Network tab
5. Try logging in again
6. Check if `/api/auth/login` request shows an error

### Common Issues

**Port 4000 already in use:**
```powershell
# Find process using port 4000
netstat -ano | findstr :4000
# Kill it (replace PID)
taskkill /PID <PID> /F
```

**Database not connected:**
```powershell
# Start database
docker-compose up -d
```

**CORS errors:**
- Check `apps/api/.env` has: `FRONTEND_URL=http://localhost:3000`
- Restart API server

## ✅ Success Indicators

When everything is working:
- ✅ API server shows "Server running on port 4000"
- ✅ Login page loads without errors
- ✅ Login succeeds and redirects to dashboard
- ✅ You see "Admin" menu in sidebar (for super admin)

---

**The API server should be starting now. Try logging in again in a few seconds!**

