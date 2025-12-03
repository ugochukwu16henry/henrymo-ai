# Start HenryMo AI Frontend
# This script starts the Next.js frontend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting HenryMo AI Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendDir = Join-Path $PSScriptRoot "apps\hub\hub"

if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at: $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "Navigating to frontend directory..." -ForegroundColor Yellow
cd $frontendDir

Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Keep this window open while using the application." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
pnpm dev

