# Fix Password Authentication Error

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🔧 FIXING PASSWORD AUTHENTICATION ERROR" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "This will reset the database to fix authentication issues." -ForegroundColor Yellow
Write-Host ""

# Step 1: Stop and remove database
Write-Host "1️⃣  Stopping database container..." -ForegroundColor Yellow
docker-compose stop postgres 2>&1 | Out-Null
docker-compose rm -f postgres 2>&1 | Out-Null

# Step 2: Remove volume to clear authentication issues
Write-Host "2️⃣  Removing database volume (clears old auth config)..." -ForegroundColor Yellow
docker volume rm henrymo-ai_postgres_data 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   (Volume may not exist, that's okay)" -ForegroundColor Gray
}

# Step 3: Start fresh database
Write-Host "3️⃣  Starting fresh database container..." -ForegroundColor Yellow
docker-compose up -d postgres

# Step 4: Wait for initialization
Write-Host "4️⃣  Waiting for database to initialize (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Step 5: Test connection
Write-Host "5️⃣  Testing connection..." -ForegroundColor Yellow
cd apps/api

$testScript = @"
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'henmo_ai_dev',
  user: 'postgres',
  password: 'postgres',
  connectionTimeoutMillis: 10000,
});

pool.query('SELECT NOW() as time')
  .then(result => {
    console.log('SUCCESS');
    process.exit(0);
  })
  .catch(error => {
    console.error('FAILED:', error.message);
    process.exit(1);
  });
"@

$testScript | Out-File -Encoding utf8 -FilePath "test-conn-temp.js"

$testResult = node test-conn-temp.js 2>&1
Remove-Item test-conn-temp.js -ErrorAction SilentlyContinue

cd ../..

if ($testResult -match "SUCCESS") {
    Write-Host "   ✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host "✅ PASSWORD AUTHENTICATION FIXED!" -ForegroundColor Green
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run database migrations:" -ForegroundColor White
    Write-Host "      cd packages/database" -ForegroundColor Gray
    Write-Host "      pnpm run migrate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Start API server:" -ForegroundColor White
    Write-Host "      cd apps/api" -ForegroundColor Gray
    Write-Host "      pnpm run dev" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ❌ Connection still failing" -ForegroundColor Red
    Write-Host "   Error: $testResult" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Try waiting a bit longer, then test manually:" -ForegroundColor Yellow
    Write-Host "   cd apps/api" -ForegroundColor Gray
    Write-Host "   node -e `"const {Pool}=require('pg');new Pool({host:'localhost',port:5432,database:'henmo_ai_dev',user:'postgres',password:'postgres'}).query('SELECT NOW()').then(()=>console.log('OK')).catch(e=>console.error(e.message));`"" -ForegroundColor Gray
}

Write-Host ""

