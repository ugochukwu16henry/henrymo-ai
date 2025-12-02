# Simple Health Check Test
Write-Host "Testing API Health Check..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET
    Write-Host "✅ Health Check Successful!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response Data:" -ForegroundColor Yellow
    Write-Host "  Status: $($json.status)"
    Write-Host "  Environment: $($json.environment)"
    Write-Host "  Version: $($json.version)"
    Write-Host "  Uptime: $([math]::Round($json.uptime, 2)) seconds"
    
    if ($json.database) {
        Write-Host ""
        Write-Host "Database:" -ForegroundColor Yellow
        Write-Host "  Status: $($json.database.status)"
        if ($json.database.database) {
            Write-Host "  Database: $($json.database.database)"
        }
        if ($json.database.error) {
            Write-Host "  Error: $($json.database.error)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Security Headers:" -ForegroundColor Yellow
    if ($response.Headers.'X-Request-ID') {
        Write-Host "  ✅ X-Request-ID: $($response.Headers.'X-Request-ID')" -ForegroundColor Green
    }
    if ($response.Headers.'X-Content-Type-Options') {
        Write-Host "  ✅ X-Content-Type-Options: $($response.Headers.'X-Content-Type-Options')" -ForegroundColor Green
    }
    if ($response.Headers.'X-Frame-Options') {
        Write-Host "  ✅ X-Frame-Options: $($response.Headers.'X-Frame-Options')" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Health Check Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error Response: $errorContent" -ForegroundColor Yellow
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

