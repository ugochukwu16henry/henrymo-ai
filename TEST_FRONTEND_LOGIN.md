# Frontend Login Testing Guide

## Prerequisites

1. **API Server must be running** on `http://localhost:4000`
2. **Database must be running** (PostgreSQL via Docker)
3. **Frontend environment configured**

## Setup Steps

### 1. Start the API Server

```powershell
# Navigate to API directory
cd apps/api

# Start the server (make sure .env file exists with database credentials)
pnpm dev
```

The API server should start on `http://localhost:4000`

### 2. Verify API is Running

```powershell
# Test health endpoint
curl http://localhost:4000/api/health

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:4000/api/health
```

### 3. Create a Test User (if needed)

You can either:
- Use an existing user from the database
- Register a new user via the frontend
- Or create one via API:

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!@#"
    name = "Test User"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

### 4. Start the Frontend

```powershell
# Navigate to frontend directory
cd apps/hub/hub

# Create .env.local if it doesn't exist
# Copy from env.example or create with:
# NEXT_PUBLIC_API_URL=http://localhost:4000
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm dev
```

The frontend should start on `http://localhost:3000`

### 5. Test Login Flow

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Redirect**: You should be redirected to `/login` if not authenticated
3. **Login Form**: Enter your credentials:
   - Email: `test@example.com` (or your test user email)
   - Password: `Test123!@#` (or your test user password)
4. **Submit**: Click "Log in" button
5. **Expected Result**: 
   - Success toast notification
   - Redirect to `/dashboard`
   - User information displayed

## Testing Checklist

- [ ] API server is running on port 4000
- [ ] Database connection is working
- [ ] Frontend server is running on port 3000
- [ ] Can access login page at `http://localhost:3000/login`
- [ ] Login form displays correctly
- [ ] Can submit login form
- [ ] Successful login redirects to dashboard
- [ ] Token is stored in localStorage
- [ ] User data is displayed on dashboard
- [ ] Logout functionality works

## Troubleshooting

### API Server Not Running
- Check if port 4000 is already in use
- Verify `.env` file exists in `apps/api/`
- Check database connection in API logs

### Frontend Not Connecting to API
- Verify `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`
- Check browser console for CORS errors
- Verify API CORS configuration allows `http://localhost:3000`

### Login Fails
- Check API server logs for errors
- Verify user exists in database
- Check password is correct
- Verify JWT_SECRET is set in API `.env`

### CORS Errors
- Ensure `FRONTEND_URL=http://localhost:3000` in API `.env`
- Check API server CORS configuration

## Manual API Test

Test login directly via API:

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:4000/api/auth/login -Method POST -Body $body -ContentType "application/json"
$response.Content
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Next Steps

After successful login test:
- Test registration flow
- Test protected routes
- Test logout functionality
- Continue with Day 8: User Dashboard & Profile
