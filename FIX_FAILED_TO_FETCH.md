# ✅ Fix "Failed to Fetch" Error - SOLUTION

**Problem:** Frontend shows "failed to fetch" when trying to login or signup

**Root Cause:** API server is not running on port 4000

---

## 🔧 Quick Fix (3 Steps)

### Step 1: Start API Server

**Open a NEW terminal window** and run:

```powershell
cd apps/api
pnpm run dev
```

**Expected Output:**
```
🚀 HenryMo AI API Server
Server running on: http://localhost:4000
```

**Keep this terminal open!** The API server must keep running.

---

### Step 2: Verify API is Running

**In another terminal or browser, test:**

```powershell
curl http://localhost:4000/api/health
```

**Or open in browser:** http://localhost:4000/api/health

**Expected:** JSON response with status "healthy"

---

### Step 3: Test Frontend Login

1. Make sure frontend is running: `cd apps/hub/hub && pnpm dev`
2. Open browser: http://localhost:3000/login
3. Try logging in again

**It should work now!** ✅

---

## 🔍 What Was Wrong?

The "failed to fetch" error happens when:
- ❌ Frontend tries to call API at `http://localhost:4000`
- ❌ But nothing is running on port 4000
- ❌ Browser can't connect → "failed to fetch"

**Solution:** Start the API server! ✅

---

## 📋 Complete Setup Checklist

### Terminal 1: API Server
```powershell
cd apps/api
pnpm run dev
```
✅ Should show: "Server running on: http://localhost:4000"

### Terminal 2: Frontend Server  
```powershell
cd apps/hub/hub
pnpm dev
```
✅ Should show: "Local: http://localhost:3000"

### Terminal 3: Database (if not already running)
```powershell
docker-compose up -d postgres
```

---

## 🧪 Test Login

1. **Open browser:** http://localhost:3000/login
2. **Enter credentials:**
   - Email: `ugochukwuhenry16@gmail.com`
   - Password: `1995Mobuchi@.`
3. **Click "Log in"**

**Expected:** ✅ Success, redirects to dashboard

---

## 🐛 Still Having Issues?

### Check Browser Console (F12)

1. Open DevTools (F12)
2. Go to **Console** tab
3. Try to login
4. Look for error messages

### Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Find the failed request
5. Check:
   - Request URL (should be `http://localhost:4000/api/auth/login`)
   - Status code
   - Error message

### Common Issues:

**Issue: "CORS policy" error**
- ✅ Fixed: API server has CORS configured for `http://localhost:3000`
- 💡 If still appears: Restart API server

**Issue: "Network error"**
- Check API server is actually running
- Check port 4000 is not blocked by firewall
- Try accessing http://localhost:4000/api/health directly

**Issue: "Connection refused"**
- API server is not running
- Start it: `cd apps/api && pnpm run dev`

---

## ✅ Success Indicators

When everything is working:

1. ✅ API health check works: http://localhost:4000/api/health
2. ✅ Frontend loads: http://localhost:3000/login
3. ✅ Login form submits successfully
4. ✅ No "failed to fetch" error
5. ✅ Dashboard loads after login
6. ✅ User information displays

---

## 📚 Files to Check

**API Server Configuration:**
- `apps/api/.env` - Should have `FRONTEND_URL=http://localhost:3000`
- `apps/api/src/server.js` - CORS configured

**Frontend Configuration:**
- `apps/hub/hub/.env.local` - Should have `NEXT_PUBLIC_API_URL=http://localhost:4000`

---

## 🚀 Quick Command Summary

```powershell
# Terminal 1: API Server (REQUIRED!)
cd apps/api
pnpm run dev

# Terminal 2: Frontend Server
cd apps/hub/hub
pnpm dev

# Terminal 3: Database (if needed)
docker-compose up -d postgres
```

**All three need to be running for the app to work!**

---

**Most Important:** Make sure the API server is running in a separate terminal! 🚀


