# Clean Restart API Server
# This script kills all node processes and restarts the API server cleanly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Clean Restart API Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all node processes
Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✓ Stopped $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "✓ No Node.js processes running" -ForegroundColor Green
}

Write-Host ""
Write-Host "Waiting 2 seconds for processes to fully stop..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 2: Navigate to API directory
Write-Host ""
Write-Host "Step 2: Starting API server..." -ForegroundColor Yellow
$apiDir = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found!" -ForegroundColor Red
    exit 1
}

cd $apiDir

# Step 3: Verify the fix is in place
Write-Host ""
Write-Host "Verifying streets.js is fixed..." -ForegroundColor Yellow
$content = Get-Content "src\routes\streets.js" -Raw
if ($content -match "require\(['\`"].*middleware/validate['\`"]\)") {
    Write-Host "✓ streets.js is correctly using 'validate' middleware" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: streets.js still has wrong import!" -ForegroundColor Red
    Write-Host "Please check the file manually" -ForegroundColor Red
    exit 1
}

# Step 4: Start the server
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting API Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The server should start without errors now." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
pnpm dev

