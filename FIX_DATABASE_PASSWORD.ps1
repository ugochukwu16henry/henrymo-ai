# Fix Database Password Authentication Error
# This script resets the database container to ensure password matches

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Database Password Authentication" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop and remove the container
Write-Host "1. Stopping and removing database container..." -ForegroundColor Yellow
docker stop henmo-ai-postgres 2>$null
docker rm henmo-ai-postgres 2>$null
Write-Host "   ✓ Container removed" -ForegroundColor Green
Write-Host ""

# Step 2: Remove the volume (optional - uncomment if you want to reset all data)
Write-Host "2. Do you want to reset the database (delete all data)?" -ForegroundColor Yellow
Write-Host "   This will remove all existing data!" -ForegroundColor Red
$reset = Read-Host "   Type 'yes' to reset, or press Enter to keep data"
if ($reset -eq 'yes') {
    Write-Host "   Removing database volume..." -ForegroundColor Yellow
    docker volume rm henrymo-ai_postgres_data 2>$null
    Write-Host "   ✓ Volume removed (database will be recreated)" -ForegroundColor Green
} else {
    Write-Host "   ✓ Keeping existing data" -ForegroundColor Green
}
Write-Host ""

# Step 3: Start the database container
Write-Host "3. Starting database container..." -ForegroundColor Yellow
cd C:\Users\user\Documents\henrymo-ai
docker-compose up -d postgres

# Wait for database to be ready
Write-Host "   Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $result = docker exec henmo-ai-postgres pg_isready -U postgres 2>&1
        if ($result -match "accepting connections") {
            $ready = $true
            Write-Host "   ✓ Database is ready!" -ForegroundColor Green
        }
    } catch {
        # Continue waiting
    }
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (-not $ready) {
    Write-Host "   ⚠ Database might still be starting..." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Verify connection
Write-Host "4. Testing database connection..." -ForegroundColor Yellow
cd C:\Users\user\Documents\henrymo-ai\apps\api

# Test connection using Node.js
$testScript = @"
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
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connection successful!');
    console.log('   Current time:', res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});
"@

$testScript | Out-File -FilePath "test-connection-temp.js" -Encoding utf8
$result = node test-connection-temp.js 2>&1
Remove-Item test-connection-temp.js -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Database connection failed" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}
Write-Host ""

# Step 5: Verify .env file
Write-Host "5. Verifying .env file..." -ForegroundColor Yellow
$envPath = "C:\Users\user\Documents\henrymo-ai\apps\api\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "DB_PASSWORD=postgres" -or $envContent -match "postgres:postgres@") {
        Write-Host "   ✓ .env file has correct password" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ .env file might have wrong password" -ForegroundColor Yellow
        Write-Host "   Expected: DB_PASSWORD=postgres" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ .env file not found!" -ForegroundColor Red
    Write-Host "   Creating .env from env.example.txt..." -ForegroundColor Yellow
    Copy-Item "env.example.txt" ".env"
    Write-Host "   ✓ .env file created" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "1. Database container restarted" -ForegroundColor White
Write-Host "2. Password: postgres" -ForegroundColor White
Write-Host "3. User: postgres" -ForegroundColor White
Write-Host "4. Database: henmo_ai_dev" -ForegroundColor White
Write-Host ""
Write-Host "Next: Start your API server with 'pnpm dev'" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

