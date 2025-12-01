# Stage 1 Testing Guide

**Stage:** Foundation & Infrastructure (Days 1-4)  
**Super Admin:** Henry Maobughichi Ugochukwu

---

## 🧪 Day 1 Testing

### Test 1: Verify Monorepo Structure

**Objective:** Ensure all directories are created correctly

**Steps:**
1. Check if all directories exist:
   ```bash
   ls -la apps/
   ls -la packages/
   ```

2. Expected directories:
   - `apps/api/`
   - `apps/hub/hub/`
   - `apps/web/`
   - `packages/database/`
   - `packages/shared/`
   - `packages/ai-core/`
   - `scripts/`
   - `docs/`

**Success Criteria:**
- ✅ All directories exist
- ✅ No errors when listing directories

---

### Test 2: Verify Package Manager

**Objective:** Ensure pnpm is working correctly

**Steps:**
1. Check pnpm version:
   ```bash
   pnpm --version
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Verify workspace structure:
   ```bash
   pnpm list -r --depth=0
   ```

**Success Criteria:**
- ✅ pnpm version >= 8.0.0
- ✅ Dependencies install without errors
- ✅ Workspace packages are recognized

---

### Test 3: Verify Git Repository

**Objective:** Ensure Git is properly initialized

**Steps:**
1. Check git status:
   ```bash
   git status
   ```

2. Verify .gitignore is working:
   ```bash
   git check-ignore node_modules
   ```

3. Stage and commit initial files:
   ```bash
   git add .
   git commit -m "Initial commit: Stage 1 Day 1 setup"
   ```

**Success Criteria:**
- ✅ Git repository is initialized
- ✅ .gitignore properly excludes files
- ✅ Files can be committed

---

## 🧪 Day 2 Testing

### Test 1: Database Connection

**Objective:** Verify PostgreSQL database can be accessed

**Steps:**
1. Start Docker Compose:
   ```bash
   docker-compose up -d postgres
   ```

2. Wait for PostgreSQL to be ready (check logs):
   ```bash
   docker-compose logs postgres
   ```

3. Test database connection:
   ```bash
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT version();"
   ```

**Success Criteria:**
- ✅ PostgreSQL container starts successfully
- ✅ Database connection works
- ✅ Can run SQL queries

---

### Test 2: Database Schema

**Objective:** Verify database schema can be created

**Steps:**
1. Check if schema file exists:
   ```bash
   ls packages/database/schema.sql
   ```

2. Run schema creation (when available):
   ```bash
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -f /docker-entrypoint-initdb.d/init.sql
   ```

3. Verify tables exist:
   ```bash
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
   ```

**Success Criteria:**
- ✅ Schema file exists
- ✅ Tables can be created
- ✅ No SQL errors

---

## 🧪 Day 3 Testing

### Test 1: API Server Startup

**Objective:** Verify API server starts correctly

**Steps:**
1. Navigate to API directory:
   ```bash
   cd apps/api
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create .env file from .env.example:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the server:
   ```bash
   pnpm run dev
   ```

**Success Criteria:**
- ✅ Server starts without errors
- ✅ Server listens on PORT 4000
- ✅ No uncaught exceptions

---

### Test 2: Health Check Endpoint

**Objective:** Verify health check endpoint works

**Steps:**
1. Start the API server (if not running)

2. Test health check:
   ```bash
   curl http://localhost:4000/api/health
   ```

   Or use browser: `http://localhost:4000/api/health`

3. Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-01-XX...",
     "uptime": 123.45,
     "environment": "development",
     "version": "1.0.0"
   }
   ```

**Success Criteria:**
- ✅ Health check returns 200 OK
- ✅ Response contains expected fields
- ✅ Status is "healthy"

---

### Test 3: API Info Endpoint

**Objective:** Verify API info endpoint works

**Steps:**
1. Test API info:
   ```bash
   curl http://localhost:4000/api/info
   ```

2. Expected response should include:
   - API name
   - Version
   - Available endpoints

**Success Criteria:**
- ✅ Info endpoint returns 200 OK
- ✅ Response contains API information
- ✅ Endpoints are listed

---

### Test 4: Error Handling

**Objective:** Verify error handling works

**Steps:**
1. Test 404 route:
   ```bash
   curl http://localhost:4000/api/nonexistent
   ```

2. Expected response:
   ```json
   {
     "success": false,
     "error": "Route not found",
     "path": "/api/nonexistent"
   }
   ```

3. Check server logs for error logging

**Success Criteria:**
- ✅ 404 errors return proper response
- ✅ Errors are logged
- ✅ Error format is consistent

---

### Test 5: Request Logging

**Objective:** Verify requests are being logged

**Steps:**
1. Make several requests:
   ```bash
   curl http://localhost:4000/api/health
   curl http://localhost:4000/api/info
   ```

2. Check logs:
   ```bash
   tail -f apps/api/logs/combined.log
   ```

3. Verify logs contain:
   - Request method
   - Request path
   - Status code
   - Duration

**Success Criteria:**
- ✅ Requests are logged
- ✅ Log format is consistent
- ✅ Log files are created

---

### Test 6: CORS Configuration

**Objective:** Verify CORS is configured correctly

**Steps:**
1. Test CORS headers:
   ```bash
   curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:4000/api/health
   ```

2. Check for CORS headers in response:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

**Success Criteria:**
- ✅ CORS headers are present
- ✅ Frontend URL is allowed
- ✅ Credentials are enabled

---

## 🧪 Day 4 Testing

### Test 1: Docker Services

**Objective:** Verify all Docker services start correctly

**Steps:**
1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Check service status:
   ```bash
   docker-compose ps
   ```

3. Check service logs:
   ```bash
   docker-compose logs postgres
   ```

**Success Criteria:**
- ✅ All services start successfully
- ✅ Services show as "Up"
- ✅ No errors in logs

---

### Test 2: Database Persistence

**Objective:** Verify database data persists across restarts

**Steps:**
1. Create a test table:
   ```bash
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "CREATE TABLE test_table (id SERIAL PRIMARY KEY);"
   ```

2. Restart services:
   ```bash
   docker-compose restart postgres
   ```

3. Verify table still exists:
   ```bash
   docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "\dt"
   ```

**Success Criteria:**
- ✅ Data persists after restart
- ✅ Volume mounts work correctly
- ✅ No data loss

---

### Test 3: Environment Variables

**Objective:** Verify environment variables are loaded correctly

**Steps:**
1. Check .env.example exists:
   ```bash
   ls apps/api/.env.example
   ```

2. Create .env from example:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

3. Verify environment variables are loaded:
   - Check server logs for configuration
   - Verify PORT is used correctly
   - Check database connection uses DATABASE_URL

**Success Criteria:**
- ✅ Environment files exist
- ✅ Variables are loaded
- ✅ Configuration is correct

---

## 📊 Stage 1 Complete Checklist

By the end of Stage 1, verify:

- [ ] Monorepo structure is complete
- [ ] All directories are created
- [ ] Package manager (pnpm) works
- [ ] Git repository is initialized
- [ ] Database schema is designed
- [ ] Database can be created
- [ ] API server starts successfully
- [ ] Health check endpoint works
- [ ] Error handling works
- [ ] Logging is functional
- [ ] Docker Compose works
- [ ] Environment variables work
- [ ] Documentation is in place

---

## 🐛 Troubleshooting

### Issue: pnpm not found
**Solution:** Install pnpm globally: `npm install -g pnpm`

### Issue: Docker not starting
**Solution:** 
- Check Docker Desktop is running
- Check ports are not in use
- Review docker-compose logs

### Issue: Database connection fails
**Solution:**
- Verify DATABASE_URL is correct
- Check PostgreSQL container is running
- Verify network connectivity

### Issue: API server won't start
**Solution:**
- Check PORT is not in use
- Verify all dependencies are installed
- Check environment variables
- Review error logs

---

## 📝 Testing Notes

- All tests should be run in order
- Keep a testing log of results
- Document any issues encountered
- Note any deviations from expected behavior

---

**Created by:** Henry Maobughichi Ugochukwu (Super Admin)  
**Last Updated:** Stage 1 Day 4

