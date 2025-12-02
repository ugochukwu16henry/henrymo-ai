# Detailed Day 5 Testing Script with Error Details

Write-Host "🧪 Testing Stage 2 Day 5: Authentication System - Backend (Detailed)" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$apiUrl = "http://localhost:4000"
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "SecurePass123!"
$testName = "Test User"
$token = ""

# First, check if server is running
Write-Host "🔍 Checking API server status..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$apiUrl/api/health" -Method GET -ErrorAction Stop
    Write-Host "  ✅ API server is running" -ForegroundColor Green
    Write-Host "  Status: $($healthResponse.status)" -ForegroundColor Gray
    if ($healthResponse.database) {
        Write-Host "  Database: $($healthResponse.database.status)" -ForegroundColor $(if ($healthResponse.database.status -eq 'healthy') { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host "  ❌ API server is not accessible" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please start the API server:" -ForegroundColor Yellow
    Write-Host "  cd apps/api && pnpm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = "",
        [int]$ExpectedStatus = 200,
        [string]$Description,
        [switch]$ShowResponse
    )
    
    Write-Host "Test: $Description" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = "$apiUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Compress)
        }
        
        $response = Invoke-RestMethod @params
        $statusCode = 200
        
        if ($ShowResponse) {
            Write-Host "  Response:" -ForegroundColor Gray
            $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
        }
        
        Write-Host "  ✅ PASSED (Status: $statusCode)" -ForegroundColor Green
        
        # Extract token
        if ($response.data -and $response.data.token) {
            $script:token = $response.data.token
            Write-Host "  📝 Token received" -ForegroundColor Gray
        }
        
        return $response
    } catch {
        $statusCode = 0
        $errorDetails = $null
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $errorDetails = $responseBody | ConvertFrom-Json
                $reader.Close()
            } catch {
                $errorDetails = $responseBody
            }
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASSED (Status: $statusCode - Expected)" -ForegroundColor Green
            if ($errorDetails) {
                Write-Host "  Error: $($errorDetails.error)" -ForegroundColor Gray
            }
            return $null
        } else {
            Write-Host "  ❌ FAILED" -ForegroundColor Red
            Write-Host "  Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor Red
            if ($errorDetails) {
                Write-Host "  Error: $($errorDetails.error)" -ForegroundColor Yellow
                if ($errorDetails.details) {
                    Write-Host "  Details:" -ForegroundColor Yellow
                    $errorDetails.details | ForEach-Object {
                        Write-Host "    - $($_.message)" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "  Exception: $($_.Exception.Message)" -ForegroundColor Yellow
            }
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

$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody -ExpectedStatus 201 -Description "Register new user" -ShowResponse

Write-Host ""

# Test 2: Duplicate Email
Write-Host "📋 Test Suite 2: Duplicate Email" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody -ExpectedStatus 409 -Description "Register with duplicate email"

Write-Host ""

# Test 3: User Login
Write-Host "📋 Test Suite 3: User Login" -ForegroundColor Cyan
Write-Host ""

$loginBody = @{
    email = $testEmail
    password = $testPassword
}

$loginResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody -ExpectedStatus 200 -Description "Login with valid credentials" -ShowResponse

Start-Sleep -Seconds 1

Write-Host ""

# Test 4: Get Current User
Write-Host "📋 Test Suite 4: Get Current User" -ForegroundColor Cyan
Write-Host ""

if ($token) {
    Test-Endpoint -Method "GET" -Endpoint "/api/auth/me" -Token $token -ExpectedStatus 200 -Description "Get current user with valid token" -ShowResponse
} else {
    Write-Host "  ⚠️  Skipping - No token available" -ForegroundColor Yellow
}

Test-Endpoint -Method "GET" -Endpoint "/api/auth/me" -ExpectedStatus 401 -Description "Get current user without token"

Write-Host ""

# Summary
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see errors above, please:" -ForegroundColor Yellow
Write-Host "  1. Check API server logs for detailed error messages" -ForegroundColor White
Write-Host "  2. Verify database is running: docker-compose ps postgres" -ForegroundColor White
Write-Host "  3. Check environment variables in apps/api/.env" -ForegroundColor White
Write-Host ""

