# 🧪 Frontend Login Testing Guide

**Purpose:** Test the frontend authentication system before Day 8

---

## 📋 Prerequisites

1. ✅ API server is running (`cd apps/api && pnpm run dev`)
2. ✅ Database is running (`docker-compose ps postgres`)
3. ✅ Super admin credentials are updated
4. ✅ Frontend dependencies installed

---

## 🚀 Step 1: Install Frontend Dependencies

```powershell
cd apps/hub/hub
pnpm install
```

**Expected:** Dependencies should install successfully

---

## 🚀 Step 2: Setup Environment Variables

Create `.env.local` file:

```powershell
cd apps/hub/hub
Copy-Item env.example .env.local
```

Or create manually:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Step 3: Start Frontend Development Server

```powershell
cd apps/hub/hub
pnpm dev
```

**Expected Output:**
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

---

## 🧪 Step 4: Test Login Page

### 4.1 Navigate to Login Page

Open browser and go to: **http://localhost:3000/login**

**Expected:**
- ✅ Login page loads
- ✅ Email and Password input fields visible
- ✅ "Forgot password?" link present
- ✅ "Sign up" link present
- ✅ "Log in" button visible

---

### 4.2 Test with Super Admin Credentials

**Login Credentials:**
- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`

**Steps:**
1. Enter email address
2. Enter password
3. Click "Log in" button

**Expected Results:**
- ✅ Form validates correctly
- ✅ Loading indicator shows
- ✅ Success toast notification appears
- ✅ Redirects to `/dashboard`
- ✅ Dashboard shows user information
- ✅ Email displayed in header
- ✅ Logout button visible

---

### 4.3 Test Error Handling

**Test 1: Invalid Credentials**
- Email: `wrong@email.com`
- Password: `WrongPassword123!`

**Expected:**
- ❌ Error message appears
- ❌ "Login failed" or similar error
- ❌ Stays on login page

**Test 2: Empty Fields**
- Leave email or password empty

**Expected:**
- ❌ Validation error messages appear
- ❌ Submit button disabled or shows error
- ❌ Form doesn't submit

**Test 3: Invalid Email Format**
- Email: `notanemail`
- Password: `AnyPassword123!`

**Expected:**
- ❌ "Invalid email address" error
- ❌ Form doesn't submit

---

## 🧪 Step 5: Test Registration

### 5.1 Navigate to Register Page

Go to: **http://localhost:3000/register**

**Expected:**
- ✅ Registration form loads
- ✅ All fields visible (Name, Email, Password, Confirm Password, Country Code)

---

### 5.2 Test Registration Form

**Test Valid Registration:**
- Name: `Test User`
- Email: `testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com`
- Password: `TestPass123!`
- Confirm Password: `TestPass123!`
- Country Code: `US` (optional)

**Expected:**
- ✅ Form validates correctly
- ✅ Registration successful
- ✅ Redirects to dashboard
- ✅ User logged in automatically

**Test Password Validation:**
- Password: `weak` (too short)

**Expected:**
- ❌ Password validation error
- ❌ Error message about password requirements

**Test Password Mismatch:**
- Password: `TestPass123!`
- Confirm Password: `Different123!`

**Expected:**
- ❌ "Passwords don't match" error

---

## 🧪 Step 6: Test Dashboard

### 6.1 Verify Dashboard Access

After successful login, verify:

**Expected:**
- ✅ Dashboard page loads
- ✅ User name displayed: "Welcome, [Name]!"
- ✅ User email displayed
- ✅ User role displayed
- ✅ Subscription tier displayed
- ✅ Logout button functional

---

### 6.2 Test Logout

Click "Logout" button

**Expected:**
- ✅ Success toast notification
- ✅ Redirects to `/login`
- ✅ Cannot access dashboard (redirects back to login)

---

### 6.3 Test Protected Routes

Try accessing dashboard directly without login:
- Go to: **http://localhost:3000/dashboard**

**Expected:**
- ✅ Redirects to `/login`
- ✅ Cannot access dashboard

---

## 🧪 Step 7: Test Forgot Password

### 7.1 Navigate to Forgot Password

Go to: **http://localhost:3000/forgot-password`

**Expected:**
- ✅ Forgot password form loads
- ✅ Email input field visible
- ✅ "Send reset link" button present

---

### 7.2 Test Password Reset Request

Enter valid email: `ugochukwuhenry16@gmail.com`

**Expected:**
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Check server logs for reset token (development mode)

---

## 🔍 Troubleshooting

### Issue: Frontend won't start

**Possible Causes:**
1. Dependencies not installed
   - **Fix:** Run `pnpm install` in `apps/hub/hub`

2. Port 3000 already in use
   - **Fix:** Kill process on port 3000 or use different port

3. Environment variables missing
   - **Fix:** Create `.env.local` file

---

### Issue: Login fails with 500 error

**Possible Causes:**
1. API server not running
   - **Fix:** Start API server: `cd apps/api && pnpm run dev`

2. Database connection issue
   - **Fix:** Check database is running: `docker-compose ps postgres`

3. Wrong API URL
   - **Fix:** Check `.env.local` has correct `NEXT_PUBLIC_API_URL`

---

### Issue: CORS errors

**Possible Causes:**
1. API CORS not configured for frontend URL
   - **Fix:** Check `apps/api/src/server.js` CORS configuration

---

### Issue: Cannot connect to API

**Possible Causes:**
1. API running on different port
   - **Fix:** Verify API is on port 4000 or update `NEXT_PUBLIC_API_URL`

2. Network connectivity
   - **Fix:** Check firewall settings

---

## ✅ Test Checklist

- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Frontend server starts successfully
- [ ] Login page loads correctly
- [ ] Login with super admin credentials works
- [ ] Invalid credentials show error
- [ ] Empty fields show validation errors
- [ ] Registration form works
- [ ] Dashboard loads after login
- [ ] User information displays correctly
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Forgot password form works

---

## 📊 Expected Test Results

### Success Criteria:
- ✅ All login tests pass
- ✅ Registration works
- ✅ Dashboard accessible after login
- ✅ Protected routes work correctly
- ✅ Error handling works as expected

---

**Created by:** Auto (AI Assistant)  
**For:** Henry Maobughichi Ugochukwu (Super Admin)  
**Date:** December 2, 2025

