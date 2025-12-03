# Fix Port 4000 Already in Use Error
# Finds and kills the process using port 4000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Port 4000 Already in Use" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Finding process using port 4000..." -ForegroundColor Yellow

# Find process using port 4000
$processes = netstat -ano | findstr :4000

if ($processes) {
    Write-Host "Found processes using port 4000:" -ForegroundColor Yellow
    Write-Host $processes -ForegroundColor White
    Write-Host ""
    
    # Extract PIDs
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    if ($pids) {
        Write-Host "Killing processes: $($pids -join ', ')" -ForegroundColor Yellow
        
        foreach ($pid in $pids) {
            try {
                $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  Killing PID $pid ($($proc.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✓ Process $pid killed" -ForegroundColor Green
                }
            } catch {
                    Write-Host "  Warning: Could not kill PID $pid: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "Waiting 2 seconds for port to be released..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Verify port is free
        $stillInUse = netstat -ano | findstr :4000
        if ($stillInUse) {
            Write-Host "Warning: Port 4000 is still in use. You may need to manually kill the process." -ForegroundColor Yellow
        } else {
            Write-Host "✅ Port 4000 is now free!" -ForegroundColor Green
        }
    } else {
        Write-Host "Warning: Could not extract process IDs" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No process found using port 4000" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start API server: cd apps/api && pnpm dev" -ForegroundColor White
Write-Host "2. Or use: pwsh -File START_API_SERVER.ps1" -ForegroundColor White
Write-Host ""

