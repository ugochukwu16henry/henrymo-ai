# 🔧 Fix "Failed to Fetch" Error

**Issue:** Frontend shows "failed to fetch" when trying to login or signup

**Common Causes:**
1. API server is not running
2. Wrong API URL in frontend
3. CORS configuration issue
4. Network connectivity problem

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Verify API Server is Running

```powershell
# Test API health endpoint
curl http://localhost:4000/api/health

# Or use PowerShell
Invoke-RestMethod -Uri "http://localhost:4000/api/health"
```

**Expected:** Should return JSON with status "healthy"

**If it fails:**
- Start API server: `cd apps/api && pnpm run dev`
- Check if port 4000 is available

---

### Step 2: Check Frontend Environment Variable

Verify `.env.local` file exists in `apps/hub/hub/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To create/update:**
```powershell
cd apps/hub/hub
@"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -Encoding utf8 -FilePath ".env.local"
```

**Important:** Restart the Next.js dev server after creating/updating `.env.local`

---

### Step 3: Verify CORS Configuration

Check `apps/api/.env` has:
```env
FRONTEND_URL=http://localhost:3000
```

**If missing, add it and restart API server**

---

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for specific error messages

**Common errors:**
- `CORS policy: No 'Access-Control-Allow-Origin'` → CORS issue
- `Failed to fetch` → API server not reachable
- `NetworkError` → Network connectivity issue

---

## 🚀 Quick Fixes

### Fix 1: Ensure API Server is Running

```powershell
# Check if running
curl http://localhost:4000/api/health

# If not, start it
cd apps/api
pnpm run dev
```

---

### Fix 2: Update Environment Variables

**API Server (.env in apps/api/):**
```env
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Frontend (.env.local in apps/hub/hub/):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**After updating:**
- Restart API server
- Restart Next.js dev server (stop and start again)

---

### Fix 3: Check CORS Configuration

The API server should have CORS configured to allow `http://localhost:3000`.

**Verify in `apps/api/src/server.js`:**
```javascript
const corsOptions = {
  origin: config.frontendUrl, // Should be http://localhost:3000
  credentials: true,
  // ...
};
```

---

### Fix 4: Test API Endpoints Directly

**Test Login Endpoint:**
```powershell
$body = @{
    email = "ugochukwuhenry16@gmail.com"
    password = "1995Mobuchi@."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**If this works:** API is fine, issue is with frontend connection  
**If this fails:** Check API server logs for errors

---

### Fix 5: Restart Everything

1. **Stop all servers** (Ctrl+C)
2. **Restart API server:**
   ```powershell
   cd apps/api
   pnpm run dev
   ```
3. **Restart frontend server:**
   ```powershell
   cd apps/hub/hub
   pnpm dev
   ```
4. **Clear browser cache** or use incognito mode

---

## 🐛 Common Issues & Solutions

### Issue: API Server Not Starting

**Check:**
- Database is running: `docker-compose ps postgres`
- Environment variables are set in `apps/api/.env`
- Port 4000 is not in use

---

### Issue: CORS Errors

**Solution:**
1. Add `FRONTEND_URL=http://localhost:3000` to `apps/api/.env`
2. Restart API server
3. Clear browser cache

---

### Issue: Wrong API URL

**Check:**
- Frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Restart Next.js dev server after changing `.env.local`
- Check browser console for the actual URL being called

---

### Issue: Network Error

**Check:**
- Firewall blocking port 4000
- Antivirus interfering
- Try accessing `http://localhost:4000/api/health` directly in browser

---

## 📋 Checklist

- [ ] API server is running on port 4000
- [ ] Database is running and accessible
- [ ] `apps/api/.env` has `FRONTEND_URL=http://localhost:3000`
- [ ] `apps/hub/hub/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`
- [ ] Both servers restarted after env changes
- [ ] Browser console checked for specific errors
- [ ] API health endpoint accessible: `http://localhost:4000/api/health`
- [ ] Direct API call to login endpoint works

---

## 🎯 Expected Behavior

**After fixes:**
1. ✅ Frontend can connect to API
2. ✅ Login requests succeed
3. ✅ Registration requests succeed
4. ✅ No CORS errors in console
5. ✅ Network tab shows successful API calls

---

## 🔍 Debug Steps

1. **Open Browser DevTools (F12)**
2. **Go to Network tab**
3. **Try to login**
4. **Check the failed request:**
   - Status code
   - Request URL
   - Response (if any)
   - Error message

5. **Check Console tab for JavaScript errors**

---

**Most likely fix:** Ensure API server is running and `.env.local` has correct `NEXT_PUBLIC_API_URL`

