# Frontend Testing Setup Script
# Sets up and tests the frontend login

Write-Host "🧪 Frontend Login Testing Setup" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

# Step 1: Check API Server
Write-Host "1️⃣  Checking API Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ API server is running" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    if ($health.database) {
        Write-Host "   Database: $($health.database.status)" -ForegroundColor $(if ($health.database.status -eq 'healthy') { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host "   ❌ API server is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please start the API server first:" -ForegroundColor Yellow
    Write-Host "   cd apps/api" -ForegroundColor White
    Write-Host "   pnpm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 2: Check Database
Write-Host "2️⃣  Checking Database..." -ForegroundColor Yellow
$dbStatus = docker-compose ps postgres --format "{{.Status}}" 2>&1
if ($dbStatus -like "*Up*") {
    Write-Host "   ✅ Database is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Database status: $dbStatus" -ForegroundColor Yellow
    Write-Host "   Starting database..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 3
}

Write-Host ""

# Step 3: Check Frontend Directory
Write-Host "3️⃣  Checking Frontend Project..." -ForegroundColor Yellow
$frontendPath = "apps/hub/hub"
if (Test-Path "$frontendPath/package.json") {
    Write-Host "   ✅ Frontend project exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend project not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Check Environment File
Write-Host "4️⃣  Checking Environment Configuration..." -ForegroundColor Yellow
$envFile = "$frontendPath/.env.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.local not found, creating..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -Encoding utf8 -FilePath $envFile
    Write-Host "   ✅ .env.local created" -ForegroundColor Green
}

Write-Host ""

# Step 5: Check Dependencies
Write-Host "5️⃣  Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "$frontendPath/node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    Write-Host "   💡 If you encounter errors, run: cd $frontendPath && pnpm install" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    Push-Location $frontendPath
    pnpm install
    Pop-Location
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the frontend server:" -ForegroundColor White
Write-Host "   cd apps/hub/hub" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000/login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Login with Super Admin credentials:" -ForegroundColor White
Write-Host "   Email: ugochukwuhenry16@gmail.com" -ForegroundColor Yellow
Write-Host "   Password: 1995Mobuchi@." -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 See TEST_FRONTEND_LOGIN.md for detailed testing guide" -ForegroundColor Cyan
Write-Host ""

