# Reset Database Password - Fix Authentication Issue

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🔧 RESETTING DATABASE PASSWORD" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "   1. Stop the database container" -ForegroundColor White
Write-Host "   2. Remove the database volume (ALL DATA WILL BE LOST)" -ForegroundColor White
Write-Host "   3. Recreate with fresh database using password: postgres" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "1️⃣  Stopping database container..." -ForegroundColor Yellow
docker-compose stop postgres 2>&1 | Out-Null

Write-Host "2️⃣  Removing database container..." -ForegroundColor Yellow
docker-compose rm -f postgres 2>&1 | Out-Null

Write-Host "3️⃣  Removing database volume..." -ForegroundColor Yellow
docker volume rm henrymo-ai_postgres_data 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   (Volume may not exist, that's okay)" -ForegroundColor Gray
}

Write-Host "4️⃣  Starting fresh database container..." -ForegroundColor Yellow
docker-compose up -d postgres

Write-Host ""
Write-Host "⏳ Waiting for database to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "5️⃣  Verifying database is ready..." -ForegroundColor Yellow
$dbStatus = docker-compose ps postgres --format "{{.Status}}" 2>&1
if ($dbStatus -like "*Up*") {
    Write-Host "   ✅ Database container is running" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "6️⃣  Testing connection..." -ForegroundColor Yellow
    cd apps/api
    $testResult = node -e "const { Pool } = require('pg'); const pool = new Pool({ host: 'localhost', port: 5432, database: 'henmo_ai_dev', user: 'postgres', password: 'postgres', connectionTimeoutMillis: 10000 }); pool.query('SELECT NOW()').then(() => { console.log('SUCCESS'); process.exit(0); }).catch(e => { console.error('FAILED:', e.message); process.exit(1); });" 2>&1
    
    if ($testResult -match "SUCCESS") {
        Write-Host "   ✅ Database connection successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=" * 70 -ForegroundColor Green
        Write-Host "✅ DATABASE PASSWORD RESET COMPLETE" -ForegroundColor Green
        Write-Host "=" * 70 -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Verify apps/api/.env has:" -ForegroundColor White
        Write-Host "      DATABASE_URL=postgresql://postgres:postgres@localhost:5432/henmo_ai_dev" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   2. Run migrations to create schema:" -ForegroundColor White
        Write-Host "      cd packages/database" -ForegroundColor Gray
        Write-Host "      pnpm run migrate" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   3. Start API server:" -ForegroundColor White
        Write-Host "      cd apps/api" -ForegroundColor Gray
        Write-Host "      pnpm run dev" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "   ❌ Connection still failing" -ForegroundColor Red
        Write-Host "   Error: $testResult" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Wait a bit longer for database to fully initialize" -ForegroundColor Yellow
    }
    cd ../..
} else {
    Write-Host "   ❌ Database container failed to start" -ForegroundColor Red
    Write-Host "   Check logs: docker-compose logs postgres" -ForegroundColor Yellow
}

Write-Host ""

