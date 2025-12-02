# 🧪 Stage 2 Day 5: Testing Guide

**Testing Authentication System - Backend**

---

## 📋 Prerequisites

1. ✅ API server is running: `cd apps/api && pnpm run dev`
2. ✅ Database is running: `docker-compose up -d postgres`
3. ✅ Database schema is applied: `cd packages/database && node scripts/migrate.js schema`

---

## ✅ Test 1: User Registration

### Test 1.1: Valid Registration

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

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Response contains `user` object with all fields
- ✅ Response contains `token` (JWT)
- ✅ User role is "user"
- ✅ Subscription tier is "free"
- ✅ Email verified is false

### Test 1.2: Duplicate Email

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "name": "Test User 2"
  }'
```

**Expected Result:**
- ✅ Status: 409 Conflict
- ✅ Error message: "User with this email already exists"

### Test 1.3: Invalid Email Format

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message contains validation error

### Test 1.4: Weak Password

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "weak",
    "name": "Test User"
  }'
```

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message about password requirements

---

## ✅ Test 2: User Login

### Test 2.1: Valid Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains `user` object
- ✅ Response contains `token` (JWT)
- ✅ Last login time is updated

**Save the token for next tests:**
```bash
# Save token to variable (PowerShell)
$token = "your-jwt-token-here"
```

### Test 2.2: Invalid Email

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid email or password"

### Test 2.3: Invalid Password

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword123!"
  }'
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid email or password"

### Test 2.4: Missing Fields

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Validation error for missing password

---

## ✅ Test 3: Get Current User

### Test 3.1: Valid Token

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $token"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains complete user object
- ✅ No sensitive data (password) exposed

### Test 3.2: Missing Token

```bash
curl -X GET http://localhost:4000/api/auth/me
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message: "Authentication required"

### Test 3.3: Invalid Token

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer invalid-token-here"
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message about invalid token

### Test 3.4: Expired Token

(Test with a token that has expired - requires time to pass or manually setting expiration)

---

## ✅ Test 4: Refresh Token

### Test 4.1: Refresh with Authorization Header

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Authorization: Bearer $token"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains new token
- ✅ Response contains user object

### Test 4.2: Refresh with Request Body

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$token\"}"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains new token

### Test 4.3: Missing Token

```bash
curl -X POST http://localhost:4000/api/auth/refresh
```

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message about missing token

---

## ✅ Test 5: Rate Limiting

### Test 5.1: Registration Rate Limit

Run registration 4 times quickly:

```bash
for ($i=1; $i -le 4; $i++) {
  curl -X POST http://localhost:4000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\", \"password\": \"SecurePass123!\", \"name\": \"Test $i\"}"
  Start-Sleep -Seconds 1
}
```

**Expected Result:**
- ✅ First 3 requests succeed (or fail validation)
- ✅ 4th request returns 429 Too Many Requests

### Test 5.2: Login Rate Limit

Try logging in with wrong password 6 times:

```bash
for ($i=1; $i -le 6; $i++) {
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "testuser@example.com", "password": "WrongPassword"}'
  Start-Sleep -Seconds 1
}
```

**Expected Result:**
- ✅ First 5 attempts return 401
- ✅ 6th attempt returns 429 Too Many Requests

---

## ✅ Test 6: Password Strength

### Test 6.1: All Password Requirements

Test various invalid passwords:

```bash
# Too short
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "Short1!", "name": "Test"}'

# No uppercase
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "lowercase123!", "name": "Test"}'

# No lowercase
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test3@example.com", "password": "UPPERCASE123!", "name": "Test"}'

# No number
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test4@example.com", "password": "NoNumber!", "name": "Test"}'

# No special character
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test5@example.com", "password": "NoSpecial123", "name": "Test"}'
```

**Expected Result:**
- ✅ All return 400 Bad Request
- ✅ Error messages specify missing requirement

---

## 📊 Test Results Summary

After completing all tests, verify:

- ✅ Registration works with valid data
- ✅ Registration rejects duplicate emails
- ✅ Registration validates input
- ✅ Login works with correct credentials
- ✅ Login rejects incorrect credentials
- ✅ JWT tokens are generated correctly
- ✅ Protected routes require authentication
- ✅ Token refresh works
- ✅ Rate limiting is active
- ✅ Password strength validation works

---

## 🎯 Expected Test Results

**All tests should pass if implementation is correct!**

If any test fails:
1. Check API server logs
2. Check database connection
3. Verify environment variables
4. Review error messages

---

**Super Admin:** Henry Maobughichi Ugochukwu

