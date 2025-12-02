# Simple connection test using psql client
Write-Host "Testing connection using psql client..." -ForegroundColor Cyan

$env:PGPASSWORD='postgres'
$result = docker-compose exec -T postgres psql -h localhost -U postgres -d henmo_ai_dev -c "SELECT 1 as test;" 2>&1

if ($result -match "test") {
    Write-Host "✅ Direct connection works!" -ForegroundColor Green
    Write-Host $result
} else {
    Write-Host "❌ Direct connection failed" -ForegroundColor Red
    Write-Host $result
}

