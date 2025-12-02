# Testing Day 3: Health Check and Rate Limiting

## Test 2: Health Check

### Steps:

1. **Start the API server:**
   ```powershell
   cd apps/api
   pnpm run dev
   ```

2. **In another terminal, test health check:**
   ```powershell
   curl http://localhost:4000/api/health
   ```

   Or use PowerShell:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET | Select-Object -ExpandProperty Content
   ```

3. **Check response headers:**
   ```powershell
   curl -I http://localhost:4000/api/health
   ```

   Or:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET | Select-Object -ExpandProperty Headers
   ```

### Expected Results:

✅ Response should include:
- `status: "healthy"`
- `database.status: "healthy"` (if database is connected)
- `timestamp`: Current timestamp
- `uptime`: Server uptime in seconds
- `environment`: "development"
- `version`: "1.0.0"
- `requestId`: Unique request ID

✅ Headers should include:
- `X-Request-ID`: Unique request ID
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block

---

## Test 3: Rate Limiting

### Steps:

1. **Make multiple requests quickly:**
   ```powershell
   # Make 101 requests (exceeds limit of 100)
   1..101 | ForEach-Object {
     Write-Host "Request $_"
     Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET -ErrorAction SilentlyContinue
     Start-Sleep -Milliseconds 10
   }
   ```

2. **Or use a simpler test:**
   ```powershell
   # Test with 5 requests
   for ($i=1; $i -le 5; $i++) {
     Write-Host "Request $i"
     try {
       $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET
       Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
     } catch {
       Write-Host "Error: $_" -ForegroundColor Red
     }
   }
   ```

3. **Check rate limit headers:**
   ```powershell
   $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET
   $response.Headers
   ```

   Look for:
   - `X-RateLimit-Limit`: 100
   - `X-RateLimit-Remaining`: Decreasing number
   - `X-RateLimit-Reset`: Reset time

### Expected Results:

✅ First 100 requests: Should succeed with 200 status  
✅ 101st+ request: Should get 429 status (Too Many Requests)  
✅ Rate limit headers: Should be present  
✅ Error message: Should indicate rate limit exceeded  

---

## Quick Test Script

Save this as `test-api.ps1`:

```powershell
# Test Health Check
Write-Host "=== Test 2: Health Check ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET
    Write-Host "✅ Health check successful" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
    Write-Host ""
    Write-Host "Headers:" -ForegroundColor Yellow
    $response.Headers | Format-Table
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test 3: Rate Limiting ===" -ForegroundColor Cyan
$successCount = 0
$rateLimitCount = 0

for ($i=1; $i -le 105; $i++) {
    try {
        $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET -ErrorAction Stop
        $successCount++
        if ($i -eq 1) {
            Write-Host "Request $i : ✅ Success (showing first request)" -ForegroundColor Green
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            $rateLimitCount++
            if ($rateLimitCount -eq 1) {
                Write-Host "Request $i : ⚠️  Rate limited (first occurrence)" -ForegroundColor Yellow
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Request $i : ❌ Error: $_" -ForegroundColor Red
        }
    }
    
    # Show progress every 10 requests
    if ($i % 10 -eq 0) {
        Write-Host "Progress: $i/105 requests..." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Successful requests: $successCount" -ForegroundColor Green
Write-Host "  Rate limited requests: $rateLimitCount" -ForegroundColor Yellow
Write-Host ""
if ($successCount -le 100 -and $rateLimitCount -gt 0) {
    Write-Host "✅ Rate limiting is working correctly!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Rate limiting may not be working as expected" -ForegroundColor Yellow
}
```

Run it with:
```powershell
.\test-api.ps1
```

---

## Manual Testing Steps

### Test 2: Health Check

1. Start server: `cd apps/api && pnpm run dev`
2. In new terminal: `curl http://localhost:4000/api/health`
3. Verify response includes status, database, and requestId

### Test 3: Rate Limiting

1. Server must be running
2. Run the test script or manually make 101+ requests
3. Verify 101st request gets 429 error
4. Wait 15 minutes or restart server to reset limit

---

**Note:** Make sure the API server is running before testing!

