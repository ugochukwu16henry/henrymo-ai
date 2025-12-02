# 🧪 Day 5 Testing Instructions

**Testing Authentication System - Backend**

---

## ⚠️ Important Notes

The API server needs to be **running** and **able to connect to the database** before testing.

---

## 🚀 Step 1: Start the API Server

**Open a terminal and run:**

```powershell
cd apps/api
pnpm run dev
```

**Expected output:**
```
🚀 HenryMo AI API Server
Server running on: http://localhost:4000
```

---

## ✅ Step 2: Verify Server is Running

**In another terminal, test the health endpoint:**

```powershell
curl http://localhost:4000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy"
  }
}
```

**If database status is "unhealthy":**
- Check database is running: `docker-compose ps postgres`
- Verify `.env` file exists in `apps/api/` with correct `DATABASE_URL`

---

## 🧪 Step 3: Run Tests

### Option 1: Automated Test Script

```powershell
.\TEST_DAY_5_DETAILED.ps1
```

### Option 2: Manual Testing with curl

#### Test 1: Register a New User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "countryCode": "US"
  }'
```

**Expected:** Status 201 with user object and JWT token

**Save the token from the response for next tests.**

#### Test 2: Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected:** Status 200 with user object and JWT token

#### Test 3: Get Current User

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** Status 200 with user object

#### Test 4: Refresh Token

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** Status 200 with new token

---

## 🔍 Troubleshooting

### Issue: 500 Internal Server Error

**Possible causes:**
1. Database connection failed
   - **Fix:** Check `.env` file has correct `DATABASE_URL`
   - **Fix:** Verify database is running: `docker-compose ps postgres`

2. Missing environment variables
   - **Fix:** Ensure `JWT_SECRET` is set in `.env`

3. Code error
   - **Fix:** Check server logs for detailed error messages
   - **Fix:** Verify all dependencies are installed: `pnpm install`

### Issue: 503 Service Unavailable

**Possible causes:**
1. Database health check failing
   - **Fix:** Database might not be accessible from host
   - **Workaround:** Test from inside container or fix connection

2. Server not fully started
   - **Fix:** Wait a few seconds after starting server
   - **Fix:** Check server logs for startup errors

### Issue: 401 Unauthorized

**Possible causes:**
1. Invalid or missing token
   - **Fix:** Ensure token is in `Authorization: Bearer <token>` header
   - **Fix:** Token might be expired, get a new one

### Issue: 400 Bad Request

**Possible causes:**
1. Validation error
   - **Fix:** Check request body matches required format
   - **Fix:** Ensure email is valid format
   - **Fix:** Ensure password meets requirements (8+ chars, uppercase, lowercase, number, special char)

---

## 📋 Test Checklist

- [ ] API server is running
- [ ] Health check returns 200
- [ ] Database status is "healthy"
- [ ] User registration works
- [ ] Duplicate email is rejected
- [ ] User login works
- [ ] Invalid credentials are rejected
- [ ] Get current user works with valid token
- [ ] Get current user fails without token
- [ ] Token refresh works
- [ ] Rate limiting is active (test by making many requests)

---

## 📊 Expected Test Results

✅ **All tests should pass if:**
- Server is running correctly
- Database is connected
- Environment variables are set
- Code is deployed correctly

❌ **If tests fail:**
1. Check server logs
2. Verify database connection
3. Check environment variables
4. Review error messages

---

## 🎯 Success Criteria

Day 5 is successful when:
- ✅ User can register with valid data
- ✅ User can login with correct credentials
- ✅ JWT tokens are generated
- ✅ Protected routes require authentication
- ✅ Token refresh works
- ✅ Validation rejects invalid input
- ✅ Rate limiting prevents abuse

---

**Super Admin:** Henry Maobughichi Ugochukwu

