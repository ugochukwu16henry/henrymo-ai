# Complete Database Authentication Fix
# This script fixes the password authentication issue by using trust auth for development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete Database Authentication Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop container
Write-Host "1. Stopping database container..." -ForegroundColor Yellow
docker stop henmo-ai-postgres 2>$null
Write-Host "   ✓ Stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Modify pg_hba.conf to use trust for development
Write-Host "2. Configuring trust authentication for development..." -ForegroundColor Yellow

# Create a custom pg_hba.conf
$pgHbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               trust
host    all             all             ::/0                    trust
"@

# Copy to container
docker cp - henmo-ai-postgres:/var/lib/postgresql/data/pg_hba.conf - <<< $pgHbaContent 2>$null

# Alternative: Use docker exec to modify
Write-Host "   Modifying pg_hba.conf inside container..." -ForegroundColor Yellow
docker start henmo-ai-postgres
Start-Sleep -Seconds 5

# Use sed to replace md5/scram with trust
docker exec henmo-ai-postgres sh -c "sed -i 's/scram-sha-256/trust/g' /var/lib/postgresql/data/pg_hba.conf"
docker exec henmo-ai-postgres sh -c "sed -i 's/md5/trust/g' /var/lib/postgresql/data/pg_hba.conf"

# Reload config
docker exec henmo-ai-postgres psql -U postgres -c "SELECT pg_reload_conf();" 2>$null
Write-Host "   ✓ Configured trust authentication" -ForegroundColor Green
Write-Host ""

# Step 3: Test connection (should work without password now)
Write-Host "3. Testing connection..." -ForegroundColor Yellow
cd C:\Users\user\Documents\henrymo-ai\apps\api

$testScript = @'
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'henmo_ai_dev',
  user: 'postgres',
  // Password not needed with trust auth, but include it anyway
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

$testScript | Out-File -FilePath "test-connection-trust.js" -Encoding utf8
Start-Sleep -Seconds 2
$result = node test-connection-trust.js 2>&1
Remove-Item test-connection-trust.js -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ Database authentication fixed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  NOTE: Using TRUST authentication for development" -ForegroundColor Yellow
    Write-Host "   This means no password is required." -ForegroundColor Yellow
    Write-Host "   For production, use scram-sha-256 with passwords." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can now start your API server:" -ForegroundColor White
    Write-Host "  cd apps/api && pnpm dev" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Connection still failing" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manual fix:" -ForegroundColor Yellow
    Write-Host "1. docker exec -it henmo-ai-postgres sh" -ForegroundColor White
    Write-Host "2. vi /var/lib/postgresql/data/pg_hba.conf" -ForegroundColor White
    Write-Host "3. Change 'scram-sha-256' to 'trust' for host connections" -ForegroundColor White
    Write-Host "4. psql -U postgres -c 'SELECT pg_reload_conf();'" -ForegroundColor White
}

