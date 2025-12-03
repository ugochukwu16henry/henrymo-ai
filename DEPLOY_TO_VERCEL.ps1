# Deploy Frontend to Vercel
# Quick deployment script for HenryMo AI Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy HenryMo AI Frontend to Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Check if logged in
Write-Host "Checking Vercel login status..." -ForegroundColor Yellow
$loginCheck = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Please login to Vercel..." -ForegroundColor Yellow
    Write-Host ""
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Logged in as: $loginCheck" -ForegroundColor Green
    Write-Host ""
}

# Navigate to frontend directory
$frontendDir = Join-Path $PSScriptRoot "apps\hub\hub"

if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to frontend directory..." -ForegroundColor Yellow
cd $frontendDir

# Check for .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "You should create .env.local with:" -ForegroundColor Yellow
    Write-Host "  NEXT_PUBLIC_API_URL=https://your-api.railway.app" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Options:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Preview Deployment (for testing)" -ForegroundColor White
Write-Host "2. Production Deployment" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Select option (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Deploying preview..." -ForegroundColor Yellow
    vercel
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Deploying to production..." -ForegroundColor Yellow
    Write-Host "Make sure you've set NEXT_PUBLIC_API_URL in Vercel dashboard!" -ForegroundColor Yellow
    Write-Host ""
    vercel --prod
} else {
    Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Set environment variables in Vercel dashboard:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_API_URL=https://your-api.railway.app" -ForegroundColor White
    Write-Host "2. Redeploy if you added environment variables" -ForegroundColor White
    Write-Host "3. Test your deployment" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

