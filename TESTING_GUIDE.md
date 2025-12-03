# Comprehensive Testing Guide

## Quick Start Testing

### 1. Start All Services

```powershell
# Terminal 1: Database
docker-compose up -d

# Terminal 2: API Server
cd apps/api
pnpm dev

# Terminal 3: Frontend
cd apps/hub/hub
pnpm dev
```

### 2. Verify Services Are Running

```powershell
# Check database
docker-compose ps

# Check API (should return JSON)
curl http://localhost:4000/api/health

# Check frontend (should load in browser)
# http://localhost:3000
```

---

## Manual Testing Scenarios

### Authentication Tests

#### Test 1: User Registration
1. Navigate to `/register`
2. Fill in registration form
3. Submit
4. Verify success message
5. Check database for new user

#### Test 2: User Login
1. Navigate to `/login`
2. Enter credentials:
   - Email: `ugochukwuhenry16@gmail.com`
   - Password: `1995Mobuchi@.`
3. Submit
4. Verify redirect to dashboard
5. Verify user data loaded

#### Test 3: Protected Routes
1. Logout
2. Try accessing `/dashboard`
3. Verify redirect to login
4. Login again
5. Verify access granted

### ChatBoss Tests

#### Test 4: Create Conversation
1. Navigate to `/dashboard/chat`
2. Click "New Conversation"
3. Verify conversation created
4. Verify conversation appears in sidebar

#### Test 5: Send Message
1. Type a message
2. Press Enter
3. Verify message appears
4. Verify AI response streams in
5. Verify response completes

#### Test 6: Switch AI Provider
1. Open conversation settings
2. Select different provider
3. Select different model
4. Save settings
5. Send new message
6. Verify uses new provider

### Media Studio Tests

#### Test 7: Generate Image
1. Navigate to `/dashboard/media`
2. Go to "Image Generator" tab
3. Enter prompt
4. Select style and size
5. Click "Generate"
6. Verify image generates
7. Verify image appears

#### Test 8: Generate Video
1. Go to "Video Generator" tab
2. Enter image URL
3. Set video parameters
4. Click "Generate"
5. Verify video generates
6. Verify video appears

### Streets Platform Tests

#### Test 9: Browse Streets
1. Navigate to `/dashboard/streets`
2. Verify streets list loads
3. Use search filter
4. Use location filters
5. Verify results update

#### Test 10: Upload Contribution
1. Click "Upload Contribution"
2. Fill in form
3. Upload images
4. Set GPS coordinates
5. Submit
6. Verify contribution created
7. Verify appears in "My Contributions"

### Admin Tests

#### Test 11: Admin Dashboard
1. Login as super admin
2. Navigate to `/dashboard/admin`
3. Verify statistics load
4. Verify quick actions visible
5. Test user management
6. Test audit logs

---

## API Testing

### Using curl

#### Health Check
```powershell
curl http://localhost:4000/api/health
```

#### Login
```powershell
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"ugochukwuhenry16@gmail.com\",\"password\":\"1995Mobuchi@.\"}'
```

#### Get User (with token)
```powershell
curl http://localhost:4000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman/Insomnia

1. Import API collection
2. Set base URL: `http://localhost:4000`
3. Set environment variables
4. Run collection

---

## Performance Testing

### API Response Times

Test key endpoints:
- `/api/auth/login` - Should be < 500ms
- `/api/conversations` - Should be < 200ms
- `/api/ai/chat` - Streaming should start < 1s
- `/api/admin/analytics` - Should be < 1s

### Frontend Performance

- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 500KB (gzipped)

---

## Security Testing

### Authentication
- [ ] Invalid credentials rejected
- [ ] Expired tokens rejected
- [ ] Protected routes require auth
- [ ] Password hashing works

### Authorization
- [ ] Role-based access works
- [ ] Admin routes protected
- [ ] User can't access admin
- [ ] Super admin can access all

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] File upload validation
- [ ] Rate limiting works

---

## Error Testing

### Network Errors
- [ ] API server down
- [ ] Database connection lost
- [ ] Slow network conditions
- [ ] Timeout handling

### Invalid Input
- [ ] Empty fields
- [ ] Invalid email format
- [ ] Invalid file types
- [ ] Oversized files

### Edge Cases
- [ ] Very long strings
- [ ] Special characters
- [ ] Unicode characters
- [ ] Boundary values

---

## Browser Testing

### Supported Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### Responsive Design
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

---

## Database Testing

### Verify Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Verify Data Integrity
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check conversations
SELECT COUNT(*) FROM conversations;

-- Check contributions
SELECT COUNT(*) FROM contributions;
```

---

## Automated Testing (Future)

### Unit Tests
```powershell
cd apps/api
pnpm test
```

### Integration Tests
```powershell
cd apps/api
pnpm test:integration
```

### E2E Tests
```powershell
cd apps/hub/hub
pnpm test:e2e
```

---

## Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

Results:
- Authentication: ✅/❌
- ChatBoss: ✅/❌
- Media Studio: ✅/❌
- Streets Platform: ✅/❌
- Admin System: ✅/❌
- Performance: ✅/❌
- Security: ✅/❌

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Additional notes]
```

---

**Last Updated:** December 3, 2025

