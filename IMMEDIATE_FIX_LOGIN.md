# ⚠️ IMMEDIATE FIX: "Failed to Fetch" Login Error

## 🔴 Problem
The API server is **NOT running**. That's why you're seeing "Failed to fetch".

## ✅ Solution: Start the API Server NOW

### **Option 1: Quick Start (Recommended)**

**Open a NEW terminal window** and run this command:

```powershell
cd C:\Users\user\Documents\henrymo-ai\apps\api
pnpm dev
```

**Keep that terminal window open!** You should see:
```
Server running on port 4000
Database connected successfully
```

### **Option 2: Use the Start Script**

From the project root, run:

```powershell
pwsh -File START_ALL_SERVERS.ps1
```

This will:
1. ✅ Start the database (already running)
2. ✅ Start the API server
3. ✅ Keep it running in that window

## 📋 Step-by-Step Instructions

1. **Open a NEW PowerShell/Terminal window**
   - Don't close your frontend terminal
   - You need BOTH running at the same time

2. **Navigate to API directory:**
   ```powershell
   cd C:\Users\user\Documents\henrymo-ai\apps\api
   ```

3. **Start the API server:**
   ```powershell
   pnpm dev
   ```

4. **Wait for this message:**
   ```
   Server running on port 4000
   Database connected successfully
   ```

5. **Go back to your browser** and try logging in again:
   - URL: `http://localhost:3000/login`
   - Email: `ugochukwuhenry16@gmail.com`
   - Password: `1995Mobuchi@.`

## ✅ What Should Be Running

You need **TWO terminals/windows**:

1. **Terminal 1:** Frontend (Next.js)
   - Running on port 3000
   - Command: `cd apps/hub/hub && pnpm dev`
   - Status: ✅ Should already be running

2. **Terminal 2:** Backend API (Express)
   - Running on port 4000
   - Command: `cd apps/api && pnpm dev`
   - Status: ❌ **NOT RUNNING** - **YOU NEED TO START THIS!**

## 🔍 Verify It's Working

After starting the API server, test it:

```powershell
curl http://localhost:4000/api/health
```

Should return: `{"status":"healthy",...}`

## 🚨 Common Issues

### Issue: "Cannot find module"
**Fix:** Install dependencies first:
```powershell
cd apps/api
pnpm install
pnpm dev
```

### Issue: "Port 4000 already in use"
**Fix:** Find and kill the process:
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F
```

### Issue: "Database connection failed"
**Fix:** Make sure database is running:
```powershell
docker-compose ps
docker-compose up -d
```

## 📝 Quick Checklist

- [ ] Database is running (✅ Already running)
- [ ] API server is running on port 4000 (❌ **START THIS NOW**)
- [ ] Frontend is running on port 3000 (✅ Should be running)
- [ ] Try login again

---

## 🎯 **ACTION REQUIRED:**

**Open a new terminal and run:**
```powershell
cd C:\Users\user\Documents\henrymo-ai\apps\api
pnpm dev
```

**Then try logging in again!**

