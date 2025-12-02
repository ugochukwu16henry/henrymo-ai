# Test Script for Day 3 - Health Check and Rate Limiting
# Run this after starting the API server: cd apps/api && pnpm run dev

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HenryMo AI - API Testing (Day 3)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Health Check
Write-Host "=== Test 2: Health Check ===" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET -ErrorAction Stop
    Write-Host "✅ Health check successful!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Cyan
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    
    # Check headers
    Write-Host "Security Headers:" -ForegroundColor Cyan
    if ($response.Headers.'X-Request-ID') {
        Write-Host "  ✅ X-Request-ID: $($response.Headers.'X-Request-ID')" -ForegroundColor Green
    }
    if ($response.Headers.'X-Content-Type-Options') {
        Write-Host "  ✅ X-Content-Type-Options: $($response.Headers.'X-Content-Type-Options')" -ForegroundColor Green
    }
    if ($response.Headers.'X-Frame-Options') {
        Write-Host "  ✅ X-Frame-Options: $($response.Headers.'X-Frame-Options')" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the API server is running:" -ForegroundColor Yellow
    Write-Host "  cd apps/api" -ForegroundColor Yellow
    Write-Host "  pnpm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Test 3: Rate Limiting ===" -ForegroundColor Yellow
Write-Host "Making 105 requests to test rate limiting (limit: 100/15min)..." -ForegroundColor Gray
Write-Host ""

$successCount = 0
$rateLimitCount = 0
$errorCount = 0

for ($i=1; $i -le 105; $i++) {
    try {
        $response = Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET -ErrorAction Stop
        $successCount++
        
        # Show first request details
        if ($i -eq 1) {
            Write-Host "Request $i : ✅ Success" -ForegroundColor Green
            if ($response.Headers.'X-RateLimit-Limit') {
                Write-Host "  Rate Limit: $($response.Headers.'X-RateLimit-Limit') requests per window" -ForegroundColor Gray
                Write-Host "  Remaining: $($response.Headers.'X-RateLimit-Remaining')" -ForegroundColor Gray
            }
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 429) {
            $rateLimitCount++
            if ($rateLimitCount -eq 1) {
                Write-Host ""
                Write-Host "Request $i : ⚠️  Rate Limited (429 Too Many Requests)" -ForegroundColor Yellow
                Write-Host "  This is expected after 100 requests!" -ForegroundColor Yellow
                try {
                    $errorBody = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorBody)
                    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
                    Write-Host "  Message: $($errorContent.error)" -ForegroundColor Yellow
                } catch {
                    Write-Host "  Rate limit exceeded" -ForegroundColor Yellow
                }
            }
        } else {
            $errorCount++
            if ($errorCount -eq 1) {
                Write-Host "Request $i : ❌ Unexpected error: $_" -ForegroundColor Red
            }
        }
    }
    
    # Show progress
    if ($i % 20 -eq 0) {
        Write-Host "Progress: $i/105 requests (Success: $successCount, Rate Limited: $rateLimitCount)" -ForegroundColor Gray
    }
    
    # Small delay to avoid overwhelming
    Start-Sleep -Milliseconds 10
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Requests: 105" -ForegroundColor White
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "⚠️  Rate Limited: $rateLimitCount" -ForegroundColor Yellow
Write-Host "❌ Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Evaluate results
if ($successCount -le 100 -and $rateLimitCount -ge 5) {
    Write-Host "✅ Rate limiting is working correctly!" -ForegroundColor Green
    Write-Host "   (First 100 requests succeeded, remaining were rate limited)" -ForegroundColor Gray
} elseif ($successCount -eq 105) {
    Write-Host "⚠️  Warning: All requests succeeded. Rate limiting may not be working." -ForegroundColor Yellow
    Write-Host "   Check if rate limiter is properly configured." -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Unexpected result. Check rate limiting configuration." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: Rate limit resets after 15 minutes, or restart the server." -ForegroundColor Gray
Write-Host ""

