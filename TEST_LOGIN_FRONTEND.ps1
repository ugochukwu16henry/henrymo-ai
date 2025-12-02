# Frontend Login Test Script
# This script helps test the login functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HenryMo AI - Frontend Login Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if API server is running
Write-Host "1. Checking API server..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -UseBasicParsing -ErrorAction Stop
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "   ✓ API server is running" -ForegroundColor Green
        $healthData = $healthCheck.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ API server is NOT running" -ForegroundColor Red
    Write-Host "   Please start the API server first:" -ForegroundColor Yellow
    Write-Host "   cd apps/api && pnpm dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if frontend is running
Write-Host "2. Checking frontend server..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing -ErrorAction Stop -TimeoutSec 2
    if ($frontendCheck.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ Frontend server is NOT running" -ForegroundColor Yellow
    Write-Host "   Start it with: cd apps/hub/hub && pnpm dev" -ForegroundColor Yellow
}

Write-Host ""

# Test login endpoint directly
Write-Host "3. Testing login endpoint..." -ForegroundColor Yellow
$testEmail = Read-Host "   Enter test email (or press Enter for default: test@example.com)"
if ([string]::IsNullOrWhiteSpace($testEmail)) {
    $testEmail = "test@example.com"
}

$testPassword = Read-Host "   Enter test password" -AsSecureString
$testPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($testPassword)
)

$loginBody = @{
    email = $testEmail
    password = $testPasswordPlain
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    
    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Login successful!" -ForegroundColor Green
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "   User: $($loginData.data.user.name) ($($loginData.data.user.email))" -ForegroundColor Green
        Write-Host "   Role: $($loginData.data.user.role)" -ForegroundColor Green
        Write-Host "   Token received: $($loginData.data.token.Substring(0, 20))..." -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Login failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        try {
            $errorData = $responseBody | ConvertFrom-Json
            Write-Host "   Error: $($errorData.error)" -ForegroundColor Red
        } catch {
            Write-Host "   Error: $responseBody" -ForegroundColor Red
        }
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000/login in your browser" -ForegroundColor White
Write-Host "2. Enter your credentials" -ForegroundColor White
Write-Host "3. Verify you're redirected to /dashboard" -ForegroundColor White
Write-Host "4. Check browser console for any errors" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

