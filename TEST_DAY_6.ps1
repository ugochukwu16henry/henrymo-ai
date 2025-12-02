# Day 6 Testing Script - User Management Backend

Write-Host "🧪 Testing Stage 2 Day 6: User Management Backend" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$apiUrl = "http://localhost:4000"
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "SecurePass123!"
$testName = "Test User"
$userToken = ""
$userId = ""

# Test counter
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = "",
        [int]$ExpectedStatus = 200,
        [string]$Description,
        [scriptblock]$Validator = $null
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
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ PASSED (Status: $statusCode)" -ForegroundColor Green
            
            if ($Validator) {
                & $Validator $response
            }
            
            return @{ Success = $true; Response = $response }
        } else {
            Write-Host "  ❌ FAILED - Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor Red
            return @{ Success = $false }
        }
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
            return @{ Success = $true; StatusCode = $statusCode }
        } else {
            Write-Host "  ❌ FAILED" -ForegroundColor Red
            Write-Host "  Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor Red
            if ($errorDetails) {
                Write-Host "  Error: $($errorDetails.error)" -ForegroundColor Yellow
            }
            return @{ Success = $false }
        }
    }
}

# Step 1: Register and Login
Write-Host "📋 Step 1: Create Test User" -ForegroundColor Cyan
Write-Host ""

$registerBody = @{
    email = $testEmail
    password = $testPassword
    name = $testName
    countryCode = "US"
}

$registerResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Body $registerBody -ExpectedStatus 201 -Description "Register test user"

if ($registerResult.Success -and $registerResult.Response) {
    Write-Host "  ✅ User registered successfully" -ForegroundColor Green
}

Write-Host ""

# Login
Write-Host "📋 Step 2: Login" -ForegroundColor Cyan
Write-Host ""

$loginBody = @{
    email = $testEmail
    password = $testPassword
}

$loginResult = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $loginBody -ExpectedStatus 200 -Description "Login test user"

if ($loginResult.Success -and $loginResult.Response) {
    $userToken = $loginResult.Response.data.token
    $userId = $loginResult.Response.data.user.id
    Write-Host "  ✅ Token received: $($userToken.Substring(0, 20))..." -ForegroundColor Gray
}

Write-Host ""

if (-not $userToken) {
    Write-Host "  ⚠️  Warning: No token received. Some tests may fail." -ForegroundColor Yellow
    Write-Host ""
}

# Test Suite 1: Get Current User
Write-Host "📋 Test Suite 1: Get Current User" -ForegroundColor Cyan
Write-Host ""

if ($userToken) {
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/users/me" -Token $userToken -ExpectedStatus 200 -Description "Get current user profile"
    if ($result.Success) { $passed++ } else { $failed++ }
    
    # Extract user ID if not already set
    if ($result.Response -and $result.Response.data) {
        $userId = $result.Response.data.id
    }
} else {
    Write-Host "  ⚠️  Skipped - No token available" -ForegroundColor Yellow
    $failed++
}

$result = Test-Endpoint -Method "GET" -Endpoint "/api/users/me" -ExpectedStatus 401 -Description "Get current user without token"
if ($result.Success) { $passed++ } else { $failed++ }

Write-Host ""

# Test Suite 2: Update Profile
Write-Host "📋 Test Suite 2: Update User Profile" -ForegroundColor Cyan
Write-Host ""

if ($userToken -and $userId) {
    $updateBody = @{
        name = "Updated Test User"
        countryCode = "NG"
    }
    
    $result = Test-Endpoint -Method "PUT" -Endpoint "/api/users/$userId" -Token $userToken -Body $updateBody -ExpectedStatus 200 -Description "Update user profile"
    if ($result.Success) { $passed++ } else { $failed++ }
} else {
    Write-Host "  ⚠️  Skipped - No token or user ID available" -ForegroundColor Yellow
    $failed++
}

Write-Host ""

# Test Suite 3: Change Password
Write-Host "📋 Test Suite 3: Change Password" -ForegroundColor Cyan
Write-Host ""

if ($userToken -and $userId) {
    $changePasswordBody = @{
        currentPassword = $testPassword
        newPassword = "NewSecurePass123!"
        confirmPassword = "NewSecurePass123!"
    }
    
    $result = Test-Endpoint -Method "POST" -Endpoint "/api/users/$userId/change-password" -Token $userToken -Body $changePasswordBody -ExpectedStatus 200 -Description "Change password"
    if ($result.Success) { $passed++ } else { $failed++ }
    
    # Try with wrong password
    $wrongPasswordBody = @{
        currentPassword = "WrongPassword!"
        newPassword = "AnotherPass123!"
        confirmPassword = "AnotherPass123!"
    }
    
    $result = Test-Endpoint -Method "POST" -Endpoint "/api/users/$userId/change-password" -Token $userToken -Body $wrongPasswordBody -ExpectedStatus 400 -Description "Change password with wrong current password"
    if ($result.Success) { $passed++ } else { $failed++ }
} else {
    Write-Host "  ⚠️  Skipped - No token or user ID available" -ForegroundColor Yellow
    $failed += 2
}

Write-Host ""

# Test Suite 4: Password Reset
Write-Host "📋 Test Suite 4: Password Reset" -ForegroundColor Cyan
Write-Host ""

$forgotPasswordBody = @{
    email = $testEmail
}

$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/forgot-password" -Body $forgotPasswordBody -ExpectedStatus 200 -Description "Request password reset"
if ($result.Success) { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "  ℹ️  Check server logs for reset token (development mode)" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "  Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ All tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests FAILED. Please review above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Note: Admin tests require admin token. See STAGE_2_DAY_6_TESTING.md for full test suite." -ForegroundColor Gray
}

Write-Host ""

