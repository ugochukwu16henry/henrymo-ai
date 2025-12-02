# Quick Login Test Guide

## Quick Start (3 Steps)

### Step 1: Start API Server

```powershell
cd apps/api
pnpm dev
```

Wait for: `Server running on: http://localhost:4000`

### Step 2: Start Frontend

Open a **new terminal**:

```powershell
cd apps/hub/hub

# Create .env.local if it doesn't exist
if (!(Test-Path .env.local)) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
}

pnpm dev
```

Wait for: `Ready on http://localhost:3000`

### Step 3: Test Login

1. Open browser: `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter credentials:
   - If you have a test user, use those credentials
   - Or register a new user first at `/register`
4. Click "Log in"
5. Should redirect to `/dashboard` on success

## Quick Test Script

Run the automated test:

```powershell
.\TEST_LOGIN_FRONTEND.ps1
```

## Troubleshooting

### "Failed to fetch" Error
- **Check**: API server is running on port 4000
- **Check**: `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Check**: No CORS errors in browser console

### "Invalid email or password"
- **Check**: User exists in database
- **Check**: Password is correct
- **Try**: Register a new user first

### Frontend won't start
- **Check**: Node.js version >= 18
- **Check**: Dependencies installed: `pnpm install`
- **Check**: Port 3000 is not in use

### API won't start
- **Check**: Database is running (Docker)
- **Check**: `.env` file exists in `apps/api/`
- **Check**: Database credentials are correct

## Expected Flow

1. ✅ Visit `http://localhost:3000` → Redirects to `/login`
2. ✅ Enter email and password → Click "Log in"
3. ✅ Success toast appears → Redirects to `/dashboard`
4. ✅ User info displayed on dashboard
5. ✅ Token stored in localStorage (check DevTools)

## Manual API Test

Test login directly:

```powershell
$body = @{
    email = "your-email@example.com"
    password = "YourPassword123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

## Success Indicators

- ✅ No console errors
- ✅ Toast notification: "Login successful!"
- ✅ Redirect to `/dashboard`
- ✅ User data visible on dashboard
- ✅ `auth_token` in localStorage
- ✅ `auth_user` in localStorage

