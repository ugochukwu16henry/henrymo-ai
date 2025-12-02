# Final Fix for Database Password Issue
# This script completely resets the database with correct password

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Database Password Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop and remove everything
Write-Host "1. Stopping and removing database..." -ForegroundColor Yellow
docker stop henmo-ai-postgres 2>$null
docker rm henmo-ai-postgres 2>$null
docker volume rm henrymo-ai_postgres_data -f 2>$null
Write-Host "   ✓ Removed" -ForegroundColor Green
Write-Host ""

# Step 2: Update docker-compose to use scram-sha-256 instead of md5
Write-Host "2. Updating docker-compose.yml..." -ForegroundColor Yellow
$composeFile = "C:\Users\user\Documents\henrymo-ai\docker-compose.yml"
$composeContent = Get-Content $composeFile -Raw
# Remove the password_encryption=md5 line
$composeContent = $composeContent -replace "      -c password_encryption=md5`r?`n", ""
$composeContent | Set-Content $composeFile -NoNewline
Write-Host "   ✓ Updated (removed md5 encryption requirement)" -ForegroundColor Green
Write-Host ""

# Step 3: Start fresh database
Write-Host "3. Starting fresh database..." -ForegroundColor Yellow
cd C:\Users\user\Documents\henrymo-ai
docker-compose up -d postgres

# Wait for database
Write-Host "   Waiting for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 4: Test connection
Write-Host "4. Testing connection..." -ForegroundColor Yellow
cd C:\Users\user\Documents\henrymo-ai\apps\api

$testScript = @'
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'henmo_ai_dev',
  user: 'postgres',
  password: 'postgres',
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  } else {
    console.log('SUCCESS! Database connection works!');
    pool.end();
    process.exit(0);
  }
});
'@

$testScript | Out-File -FilePath "test-connection-final.js" -Encoding utf8
$result = node test-connection-final.js 2>&1
Remove-Item test-connection-final.js -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Connection successful!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Connection failed" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database should now be working!" -ForegroundColor Green
Write-Host "Password: postgres" -ForegroundColor White
Write-Host "User: postgres" -ForegroundColor White
Write-Host "Database: henmo_ai_dev" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

