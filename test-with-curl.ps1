# Test using curl to see raw response
Write-Host "Testing with curl..." -ForegroundColor Cyan
Write-Host ""

$output = curl.exe -s http://localhost:4000/api/health 2>&1
Write-Host "Raw Response:" -ForegroundColor Yellow
Write-Host $output

if ($output -match '\{.*\}') {
    Write-Host ""
    Write-Host "Parsing JSON..." -ForegroundColor Cyan
    try {
        $json = $output | ConvertFrom-Json
        $json | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "Could not parse as JSON" -ForegroundColor Yellow
    }
}

