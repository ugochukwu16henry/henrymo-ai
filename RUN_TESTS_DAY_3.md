# Run Tests 2 and 3 - Quick Guide

## Prerequisites

1. **Make sure API server is running:**
   ```powershell
   cd apps/api
   pnpm run dev
   ```
   
   You should see:
   ```
   ╔══════════════════════════════════════════════════════╗
   ║   🚀 HenryMo AI API Server                          ║
   ║   Server running on: http://localhost:4000          ║
   ```

2. **Keep the server running in one terminal**

3. **Open a NEW terminal for testing**

## Quick Test (Automated Script)

### Option 1: Run the PowerShell Test Script

```powershell
# From project root
cd apps/api
.\test-api.ps1
```

This will automatically:
- ✅ Test health check
- ✅ Test rate limiting (105 requests)
- ✅ Show detailed results

## Manual Testing

### Test 2: Health Check

**In a new terminal:**

```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET | Select-Object StatusCode, @{Name='Content';Expression={$_.Content | ConvertFrom-Json}}
```

**Or simpler:**

```powershell
curl http://localhost:4000/api/health
```

**Expected:**
- Status: 200 OK
- Response includes: status, database, timestamp, uptime, requestId

### Test 3: Rate Limiting

**Make 105 requests (exceeds limit of 100):**

```powershell
$success = 0
$limited = 0

for ($i=1; $i -le 105; $i++) {
    try {
        $r = Invoke-WebRequest -Uri http://localhost:4000/api/health -ErrorAction Stop
        $success++
        Write-Host "Request $i : OK" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            $limited++
            if ($limited -eq 1) {
                Write-Host "Request $i : RATE LIMITED (expected!)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "Success: $success, Rate Limited: $limited"
```

**Expected:**
- First 100 requests: ✅ Success (200)
- Request 101+: ⚠️ Rate Limited (429)

## What to Look For

### Health Check Should Return:

```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0",
  "requestId": "req-...",
  "database": {
    "status": "healthy",
    "database": "henmo_ai_dev"
  }
}
```

### Rate Limiting:

- ✅ First 100 requests: Status 200
- ⚠️ 101st request: Status 429 with error message
- Response headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Troubleshooting

### If health check fails:
- ✅ Check server is running: `netstat -ano | findstr :4000`
- ✅ Check database is running: `docker-compose ps`
- ✅ Check .env file exists in apps/api/

### If rate limiting doesn't work:
- ✅ Check rate limiter middleware is loaded
- ✅ Try restarting the server
- ✅ Check for errors in server logs

---

**Ready to test!** Start the server, then run the tests. 🚀

