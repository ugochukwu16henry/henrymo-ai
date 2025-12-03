# Start HenryMo AI API Server
# This script starts the backend API server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting HenryMo AI API Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiDir = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found at: $apiDir" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to API directory..." -ForegroundColor Yellow
cd $apiDir

Write-Host "Checking if .env file exists..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please make sure you have configured your .env file" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting API server on port 4000..." -ForegroundColor Green
Write-Host ""
Write-Host "The server will start in this window." -ForegroundColor Cyan
Write-Host "Keep this window open while using the application." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
pnpm dev

