# Start All HenryMo AI Services
# This script starts the database, API server, and provides instructions for frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting HenryMo AI Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Database
Write-Host "Step 1: Starting Database..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start database. Make sure Docker is running." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Start API Server
Write-Host ""
Write-Host "Step 2: Starting API Server..." -ForegroundColor Yellow
Write-Host ""

$apiDir = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found!" -ForegroundColor Red
    exit 1
}

cd $apiDir

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found in apps/api!" -ForegroundColor Yellow
    Write-Host "Please make sure you have configured your .env file" -ForegroundColor Yellow
}

Write-Host "Starting API server on port 4000..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Server Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep this window open!" -ForegroundColor Yellow
Write-Host "The API server will run here." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once you see 'Server running on port 4000'," -ForegroundColor Cyan
Write-Host "you can try logging in at: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server (this will block)
pnpm dev

