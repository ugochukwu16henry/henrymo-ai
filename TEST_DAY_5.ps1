# Day 5 Testing Script
# Tests Authentication System - Backend

Write-Host "🧪 Testing Stage 2 Day 5: Authentication System - Backend" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$apiUrl = "http://localhost:4000"
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "SecurePass123!"
$testName = "Test User"
$token = ""

$testCount = 0
$passedCount = 0
$failedCount = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = "",
        [int]$ExpectedStatus = 200,
        [string]$Description
    )
    
    $script:testCount++
    Write-Host "Test $testCount`: $Description" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Compress
            $response = Invoke-RestMethod -Uri "$apiUrl$Endpoint" -Method $Method -Headers $headers -Body $bodyJson -StatusCodeVariable statusCode -ErrorAction SilentlyContinue
        } else {
            $response = Invoke-RestMethod -Uri "$apiUrl$Endpoint" -Method $Method -Headers $headers -StatusCodeVariable statusCode -ErrorAction SilentlyContinue
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASSED (Status: $statusCode)" -ForegroundColor Green
            $script:passedCount++
            
            # Extract token from registration/login
            if ($response.data -and $response.data.token) {
                $script:token = $response.data.token
                Write-Host "  📝 Token saved for subsequent tests" -ForegroundColor Gray
            }
            
            return $response
        } else {
            Write-Host "  ❌ FAILED - Expected status $ExpectedStatus, got $statusCode" -ForegroundColor Red
            $script:failedCount++
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASSED (Status: $statusCode)" -ForegroundColor Green
            $script:passedCount++
            return $null
        } else {
            Write-Host "  ❌ FAILED - Expected status $ExpectedStatus, got $statusCode" -ForegroundColor Red
            Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Yellow
            $script:failedCount++
            return $null
        }
    }
    
    Write-Host ""
}

# Test 1: User Registration
Write-Host "📋 Test Suite 1: User Registration" -ForegroundColor Cyan
Write-Host ""

$registerBody = @{
    email = $testEmail
    password = $testPassword
    name = $testName
    countryCode = "US"
}

Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody -ExpectedStatus 201 -Description "Register new user"

# Test 2: Duplicate Email
Write-Host "📋 Test Suite 2: Duplicate Email" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody -ExpectedStatus 409 -Description "Register with duplicate email"

# Test 3: User Login
Write-Host "📋 Test Suite 3: User Login" -ForegroundColor Cyan
Write-Host ""

$loginBody = @{
    email = $testEmail
    password = $testPassword
}

Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody -ExpectedStatus 200 -Description "Login with valid credentials"

# Wait a moment for token
Start-Sleep -Seconds 1

if (-not $token) {
    Write-Host "  ⚠️  Warning: Token not received, some tests may fail" -ForegroundColor Yellow
}

# Test 4: Get Current User
Write-Host "📋 Test Suite 4: Get Current User" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Method "GET" -Endpoint "/api/auth/me" -Token $token -ExpectedStatus 200 -Description "Get current user with valid token"

Test-Endpoint -Method "GET" -Endpoint "/api/auth/me" -ExpectedStatus 401 -Description "Get current user without token"

# Test 5: Refresh Token
Write-Host "📋 Test Suite 5: Refresh Token" -ForegroundColor Cyan
Write-Host ""

if ($token) {
    Test-Endpoint -Method "POST" -Endpoint "/api/auth/refresh" -Token $token -ExpectedStatus 200 -Description "Refresh token via Authorization header"
}

# Summary
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "  Total Tests: $testCount" -ForegroundColor White
Write-Host "  Passed: $passedCount" -ForegroundColor Green
Write-Host "  Failed: $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "✅ All tests PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests FAILED. Please review above." -ForegroundColor Yellow
    exit 1
}

