# 🧪 Stage 2 Day 6: User Management Backend - Testing Guide

**Testing Date:** [Current Date]  
**Super Admin:** Henry Maobughichi Ugochukwu

---

## 📋 Prerequisites

1. ✅ API server is running (`cd apps/api && pnpm run dev`)
2. ✅ Database is running (`docker-compose ps postgres`)
3. ✅ Authentication system is working (Day 5)
4. ✅ You have a valid JWT token from login
5. ✅ Postman, curl, or similar tool for testing

---

## 🔑 Test User Setup

### Create Test Users

First, register two test users:

```bash
# User 1 - Regular User
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "countryCode": "US"
  }'

# User 2 - For Admin Testing
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adminuser@example.com",
    "password": "AdminPass123!",
    "name": "Admin User",
    "countryCode": "US"
  }'
```

### Login and Save Tokens

```bash
# Login User 1
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'

# Save the token from response as USER_TOKEN

# Login as Super Admin (if available)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@henrymo-ai.com",
    "password": "admin123!"
  }'

# Save the token from response as ADMIN_TOKEN
```

---

## 🧪 Test Suite 1: Get Current User

### Test 1.1: Get Current User Profile

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user",
    "subscription_tier": "free",
    ...
  }
}
```

**Validation:**
- ✅ Status code is 200
- ✅ Returns user data
- ✅ Does NOT include password_hash
- ✅ Includes all profile fields

---

### Test 1.2: Get Current User Without Token

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/me
```

**Expected Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token."
}
```

---

## 🧪 Test Suite 2: Get User by ID

### Test 2.1: Get Own User Profile

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:** `200 OK`

**Validation:**
- ✅ Returns user data
- ✅ Same as `/api/users/me` endpoint

---

### Test 2.2: Get Another User's Profile (Regular User)

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/ANOTHER_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:** `403 Forbidden`
```json
{
  "success": false,
  "error": "Access denied. You can only view your own profile."
}
```

---

### Test 2.3: Get User by ID (Admin)

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/ANY_USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:** `200 OK`

**Validation:**
- ✅ Admin can access any user's profile

---

### Test 2.4: Get Non-existent User

**Request:**
```bash
curl -X GET http://localhost:4000/api/users/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 🧪 Test Suite 3: Update User Profile

### Test 3.1: Update Own Profile

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "countryCode": "NG"
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "...",
    "name": "Updated Name",
    "countryCode": "NG",
    ...
  }
}
```

**Validation:**
- ✅ Profile is updated
- ✅ Only specified fields are updated
- ✅ Returns updated user data

---

### Test 3.2: Update Another User's Profile (Regular User)

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/ANOTHER_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked Name"}'
```

**Expected Response:** `403 Forbidden`

---

### Test 3.3: Update Profile with Invalid Data

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "countryCode": "INVALID"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation error",
  "details": [...]
}
```

---

## 🧪 Test Suite 4: Change Password

### Test 4.1: Change Password Successfully

**Request:**
```bash
curl -X POST http://localhost:4000/api/users/YOUR_USER_ID/change-password \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123!",
    "newPassword": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Validation:**
- ✅ Password is changed
- ✅ Can login with new password
- ✅ Cannot login with old password

---

### Test 4.2: Change Password with Wrong Current Password

**Request:**
```bash
curl -X POST http://localhost:4000/api/users/YOUR_USER_ID/change-password \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "WrongPassword!",
    "newPassword": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

### Test 4.3: Change Password - Passwords Don't Match

**Request:**
```bash
curl -X POST http://localhost:4000/api/users/YOUR_USER_ID/change-password \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "NewSecurePass123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "DifferentPassword123!"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "path": "confirmPassword",
      "message": "Passwords don't match"
    }
  ]
}
```

---

## 🧪 Test Suite 5: Delete User Account

### Test 5.1: Delete Own Account

**Request:**
```bash
curl -X DELETE http://localhost:4000/api/users/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Validation:**
- ✅ Account is soft deleted (is_active = false)
- ✅ User cannot login anymore

---

## 🧪 Test Suite 6: Admin - List Users

### Test 6.1: List Users (Admin)

**Request:**
```bash
curl -X GET "http://localhost:4000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Test 6.2: List Users with Filters

**Request:**
```bash
curl -X GET "http://localhost:4000/api/users?role=user&subscriptionTier=free&isActive=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:** `200 OK` with filtered results

---

### Test 6.3: List Users (Regular User)

**Request:**
```bash
curl -X GET "http://localhost:4000/api/users" \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response:** `403 Forbidden`
```json
{
  "success": false,
  "error": "Access denied. Insufficient permissions."
}
```

---

## 🧪 Test Suite 7: Admin - Update User Role

### Test 7.1: Update User Role (Admin)

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "moderator"
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "...",
    "role": "moderator",
    ...
  }
}
```

---

### Test 7.2: Update Super Admin Role (Should Fail)

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/SUPER_ADMIN_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Cannot modify super admin role"
}
```

---

## 🧪 Test Suite 8: Admin - Update Subscription

### Test 8.1: Update Subscription Tier

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/subscription \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionTier": "pro"
  }'
```

**Expected Response:** `200 OK`

---

## 🧪 Test Suite 9: Admin - Suspend User

### Test 9.1: Suspend User

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/suspend \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suspend": true
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "is_suspended": true,
    ...
  }
}
```

---

### Test 9.2: Unsuspend User

**Request:**
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/suspend \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suspend": false
  }'
```

**Expected Response:** `200 OK`

---

## 🧪 Test Suite 10: Password Reset

### Test 10.1: Request Password Reset

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Note:** In development mode, check server logs for the reset token.

---

### Test 10.2: Reset Password with Token

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_LOGS",
    "newPassword": "ResetPass123!"
  }'
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

---

### Test 10.3: Reset Password with Expired Token

Wait 1+ hour after requesting reset, then try:

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "EXPIRED_TOKEN",
    "newPassword": "ResetPass123!"
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Reset token has expired. Please request a new one."
}
```

---

## ✅ Test Checklist

### Core Functionality:
- [ ] Get current user profile
- [ ] Get user by ID (own profile)
- [ ] Get user by ID (other user - should fail for regular users)
- [ ] Update own profile
- [ ] Update another user's profile (should fail for regular users)
- [ ] Change password successfully
- [ ] Change password with wrong current password
- [ ] Delete own account

### Admin Functionality:
- [ ] List users (admin only)
- [ ] List users with filters
- [ ] Update user role
- [ ] Update subscription tier
- [ ] Suspend user
- [ ] Unsuspend user

### Password Reset:
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Reset password with invalid token

### Security:
- [ ] Regular users cannot access admin endpoints
- [ ] Regular users cannot modify other users
- [ ] Super admin cannot be modified
- [ ] Invalid tokens are rejected
- [ ] Input validation works correctly

---

## 🐛 Troubleshooting

### Issue: 500 Internal Server Error
- Check server logs for detailed error
- Verify database connection
- Check environment variables

### Issue: 401 Unauthorized
- Verify token is valid
- Check token is in Authorization header: `Bearer <token>`
- Token might be expired - login again

### Issue: 403 Forbidden
- Check user role/permissions
- Verify you're accessing own resources or have admin access

### Issue: 404 Not Found
- Verify user ID is correct (UUID format)
- Check if user exists in database

---

**Created by:** Auto (AI Assistant)  
**For:** Henry Maobughichi Ugochukwu (Super Admin)

