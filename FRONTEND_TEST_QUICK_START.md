# 🚀 Frontend Login Testing - Quick Start

**Test the frontend authentication before Day 8**

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Create Environment File

```powershell
cd apps/hub/hub
Copy-Item env.example .env.local
```

Or create manually - create file `apps/hub/hub/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 2: Install Dependencies (if not already done)

```powershell
cd apps/hub/hub
pnpm install
```

---

### Step 3: Start Frontend Server

```powershell
cd apps/hub/hub
pnpm dev
```

**Expected Output:**
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
```

---

## 🧪 Test Login

### Open Browser
Go to: **http://localhost:3000/login**

### Login Credentials
- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`

### Expected Results
1. ✅ Login page loads
2. ✅ Enter credentials and click "Log in"
3. ✅ Success toast notification
4. ✅ Redirects to dashboard
5. ✅ Dashboard shows user info

---

## ✅ Success Checklist

- [ ] Environment file created (`.env.local`)
- [ ] Dependencies installed (`node_modules` exists)
- [ ] Frontend server running on port 3000
- [ ] Login page accessible
- [ ] Can log in with super admin credentials
- [ ] Dashboard loads after login
- [ ] Logout works

---

## 🐛 Troubleshooting

### Issue: Cannot connect to API
**Check:** API server running on port 4000
```powershell
# In another terminal
cd apps/api
pnpm run dev
```

### Issue: Port 3000 already in use
**Fix:** Kill process or use different port
```powershell
# Use port 3001 instead
cd apps/hub/hub
pnpm dev -- -p 3001
```

### Issue: Module not found errors
**Fix:** Install dependencies
```powershell
cd apps/hub/hub
pnpm install
```

### Issue: Login fails
**Check:**
1. API server is running
2. Database is running: `docker-compose ps postgres`
3. Super admin credentials are correct
4. Check browser console for errors

---

## 📚 Full Testing Guide

See `TEST_FRONTEND_LOGIN.md` for comprehensive testing instructions.

---

**Ready to test!** 🚀

