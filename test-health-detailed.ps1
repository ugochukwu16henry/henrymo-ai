# Detailed Health Check Test
Write-Host "=== Detailed Health Check Test ===" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -UseBasicParsing
    Write-Host "✅ Response received!" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Request failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host ""
            Write-Host "Response Body:" -ForegroundColor Yellow
            Write-Host $errorBody
            
            try {
                $errorJson = $errorBody | ConvertFrom-Json
                Write-Host ""
                Write-Host "Parsed JSON:" -ForegroundColor Yellow
                $errorJson | ConvertTo-Json -Depth 10
            } catch {
                Write-Host "Not JSON response" -ForegroundColor Gray
            }
        } catch {
            Write-Host "Could not read error stream" -ForegroundColor Yellow
        }
    }
}

