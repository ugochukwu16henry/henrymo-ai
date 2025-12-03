# Deploy API to Railway
# Quick deployment script for HenryMo AI API

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy HenryMo AI API to Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "Railway CLI not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install Railway CLI:" -ForegroundColor Yellow
    Write-Host "  Option 1: npm install -g @railway/cli" -ForegroundColor White
    Write-Host "  Option 2: winget install Railway.Railway" -ForegroundColor White
    Write-Host ""
    Write-Host "Or deploy via Railway Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://railway.app" -ForegroundColor White
    Write-Host "  2. Click 'New Project'" -ForegroundColor White
    Write-Host "  3. Select 'Deploy from GitHub repo'" -ForegroundColor White
    Write-Host "  4. Select your repository" -ForegroundColor White
    Write-Host "  5. Set Root Directory: apps/api" -ForegroundColor White
    Write-Host "  6. Set Start Command: node src/server.js" -ForegroundColor White
    Write-Host "  7. Add environment variables" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Check if logged in
Write-Host "Checking Railway login status..." -ForegroundColor Yellow
$loginCheck = railway whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Please login to Railway..." -ForegroundColor Yellow
    Write-Host ""
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Logged in to Railway" -ForegroundColor Green
    Write-Host ""
}

# Navigate to API directory
$apiDir = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found at $apiDir" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to API directory..." -ForegroundColor Yellow
cd $apiDir

# Check for .env
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "You'll need to set environment variables in Railway dashboard." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Deployment Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Deploy via Railway Dashboard (Recommended)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor White
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Click 'New Project' > 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "3. Select your repository" -ForegroundColor White
Write-Host "4. Configure:" -ForegroundColor White
Write-Host "   - Root Directory: apps/api" -ForegroundColor Cyan
Write-Host "   - Build Command: pnpm install" -ForegroundColor Cyan
Write-Host "   - Start Command: node src/server.js" -ForegroundColor Cyan
Write-Host "5. Add PostgreSQL service" -ForegroundColor White
Write-Host "6. Add environment variables (see DEPLOYMENT_COMPARISON.md)" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Deploy via Railway CLI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run these commands:" -ForegroundColor White
Write-Host "  railway init" -ForegroundColor Cyan
Write-Host "  railway up" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then set environment variables:" -ForegroundColor White
Write-Host "  railway variables set DATABASE_URL=<your-db-url>" -ForegroundColor Cyan
Write-Host "  railway variables set JWT_SECRET=<your-secret>" -ForegroundColor Cyan
Write-Host "  (add all other required variables)" -ForegroundColor Cyan
Write-Host ""

$useCLI = Read-Host "Do you want to use Railway CLI now? (y/n)"

if ($useCLI -eq "y") {
    Write-Host ""
    Write-Host "Initializing Railway project..." -ForegroundColor Yellow
    railway init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Deploying to Railway..." -ForegroundColor Yellow
        railway up
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Add PostgreSQL service in Railway dashboard" -ForegroundColor White
        Write-Host "2. Set environment variables:" -ForegroundColor White
        Write-Host "   railway variables set DATABASE_URL=<db-url>" -ForegroundColor Cyan
        Write-Host "   railway variables set JWT_SECRET=<secret>" -ForegroundColor Cyan
        Write-Host "   (see DEPLOYMENT_COMPARISON.md for full list)" -ForegroundColor White
        Write-Host "3. Run database migrations:" -ForegroundColor White
        Write-Host "   railway run cd packages/database && node scripts/migrate.js schema" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Use Railway Dashboard for deployment (recommended)." -ForegroundColor Yellow
    Write-Host "See steps above." -ForegroundColor Yellow
    Write-Host ""
}

