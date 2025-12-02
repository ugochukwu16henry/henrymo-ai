# ⚡ Quick Fix: "Failed to Fetch" Error

## 🔴 Problem
Frontend shows "failed to fetch" when trying to login or signup.

## ✅ Solution
**API server is not running!**

---

## 🚀 Fix (2 Minutes)

### Step 1: Start API Server

**Open a NEW terminal** and run:

```powershell
cd apps/api
pnpm run dev
```

**Wait for:** `Server running on: http://localhost:4000`

**Keep this terminal open!** ⚠️

---

### Step 2: Test Login Again

Go back to your browser at http://localhost:3000/login and try logging in.

**It should work now!** ✅

---

## 📋 All Servers Must Be Running

You need **3 things running** at the same time:

1. ✅ **Database** (Docker)
   - Check: `docker-compose ps postgres`
   - Start: `docker-compose up -d postgres`

2. ✅ **API Server** (Terminal 1) ← **THIS IS MISSING!**
   - Check: http://localhost:4000/api/health
   - Start: `cd apps/api && pnpm run dev`

3. ✅ **Frontend Server** (Terminal 2)
   - Check: http://localhost:3000
   - Start: `cd apps/hub/hub && pnpm dev`

---

## 🧪 Quick Test

After starting API server, test it:

```powershell
curl http://localhost:4000/api/health
```

**Expected:** JSON with `"status": "healthy"`

If this works, your login should work too!

---

## 🎯 Login Credentials

- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`

---

**That's it! Just start the API server and you're good to go!** 🚀


