# Start API Server - Clean Start
# Kills any existing processes on port 4000 and starts fresh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting API Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any process using port 4000
Write-Host "Step 1: Checking port 4000..." -ForegroundColor Yellow
$processes = netstat -ano | findstr :4000

if ($processes) {
    Write-Host "Found processes using port 4000, killing them..." -ForegroundColor Yellow
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed PID $pid" -ForegroundColor Green
        } catch {
            Write-Host "  Could not kill PID $pid" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "Port 4000 is free" -ForegroundColor Green
}

Write-Host ""

# Step 2: Navigate to API directory
$apiDir = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found!" -ForegroundColor Red
    exit 1
}

cd $apiDir

# Step 3: Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please make sure you have configured your .env file" -ForegroundColor Yellow
    Write-Host ""
}

# Step 4: Start the server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting API Server on Port 4000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The server will start in this window." -ForegroundColor Yellow
Write-Host "Keep this window open!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Once you see 'Server running on port 4000'," -ForegroundColor Cyan
Write-Host "you can login at: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
pnpm dev

