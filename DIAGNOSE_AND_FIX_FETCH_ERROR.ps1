# Diagnose and Fix "Failed to Fetch" Error

Write-Host "🔍 Diagnosing 'Failed to Fetch' Error..." -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$errors = @()

# Step 1: Check API Server
Write-Host "1️⃣  Checking API Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ API server is RUNNING" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API server is NOT running" -ForegroundColor Red
    $errors += "API server is not running"
    Write-Host ""
    Write-Host "   💡 Solution:" -ForegroundColor Yellow
    Write-Host "   Open a NEW terminal and run:" -ForegroundColor White
    Write-Host "   cd apps/api" -ForegroundColor Gray
    Write-Host "   pnpm run dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""

# Step 2: Check Database
Write-Host "2️⃣  Checking Database..." -ForegroundColor Yellow
$dbStatus = docker-compose ps postgres --format "{{.Status}}" 2>&1
if ($dbStatus -like "*Up*") {
    Write-Host "   ✅ Database is running" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Database status unclear: $dbStatus" -ForegroundColor Yellow
    $errors += "Database may not be running"
}

Write-Host ""

# Step 3: Check Frontend Environment
Write-Host "3️⃣  Checking Frontend Environment..." -ForegroundColor Yellow
$envFile = "apps/hub/hub/.env.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ .env.local file exists" -ForegroundColor Green
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "NEXT_PUBLIC_API_URL=http://localhost:4000") {
        Write-Host "   ✅ API URL is correct" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  API URL may be incorrect" -ForegroundColor Yellow
        $errors += "Frontend API URL may be wrong"
    }
} else {
    Write-Host "   ❌ .env.local file is missing" -ForegroundColor Red
    $errors += ".env.local file missing"
    Write-Host ""
    Write-Host "   💡 Creating .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -Encoding utf8 -FilePath $envFile
    Write-Host "   ✅ Created .env.local file" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ⚠️  IMPORTANT: Restart Next.js dev server after this!" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Check API Environment
Write-Host "4️⃣  Checking API Environment..." -ForegroundColor Yellow
$apiEnvFile = "apps/api/.env"
if (Test-Path $apiEnvFile) {
    Write-Host "   ✅ API .env file exists" -ForegroundColor Green
    $apiEnvContent = Get-Content $apiEnvFile -Raw
    if ($apiEnvContent -match "FRONTEND_URL") {
        Write-Host "   ✅ FRONTEND_URL is set" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  FRONTEND_URL not found in .env" -ForegroundColor Yellow
        Write-Host "   Adding FRONTEND_URL..." -ForegroundColor Gray
        Add-Content -Path $apiEnvFile -Value "`nFRONTEND_URL=http://localhost:3000"
        Write-Host "   ✅ Added FRONTEND_URL" -ForegroundColor Green
        Write-Host "   ⚠️  Restart API server after this!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  API .env file not found" -ForegroundColor Yellow
    Write-Host "   Check if apps/api/.env exists" -ForegroundColor Gray
}

Write-Host ""

# Summary
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Diagnosis Summary:" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 If you still have 'failed to fetch' error:" -ForegroundColor Yellow
    Write-Host "   1. Check browser console (F12) for specific errors" -ForegroundColor White
    Write-Host "   2. Check Network tab to see the failed request" -ForegroundColor White
    Write-Host "   3. Ensure both servers are running" -ForegroundColor White
    Write-Host "   4. Try hard refresh (Ctrl+F5)" -ForegroundColor White
} else {
    Write-Host "❌ Issues Found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   • $error" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "🔧 Fix Steps:" -ForegroundColor Cyan
    Write-Host ""
    if ($errors -contains "API server is not running") {
        Write-Host "1. Start API Server:" -ForegroundColor White
        Write-Host "   cd apps/api" -ForegroundColor Gray
        Write-Host "   pnpm run dev" -ForegroundColor Gray
        Write-Host ""
    }
    if ($errors -contains ".env.local file missing") {
        Write-Host "2. Restart Frontend Server:" -ForegroundColor White
        Write-Host "   (Stop current server, then)" -ForegroundColor Gray
        Write-Host "   cd apps/hub/hub" -ForegroundColor Gray
        Write-Host "   pnpm dev" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "📚 See FIX_FETCH_ERROR.md for detailed troubleshooting" -ForegroundColor Cyan
Write-Host ""


