# Diagnostic Script for HenryMo AI Issues
# Checks common issues and provides fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HenryMo AI Diagnostic Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Database Connection
Write-Host "1. Checking database connection..." -ForegroundColor Yellow
try {
    $dbCheck = docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "SELECT COUNT(*) FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Database is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Database connection failed" -ForegroundColor Red
        Write-Host "   Fix: Run 'docker-compose up -d'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Could not check database" -ForegroundColor Red
}

Write-Host ""

# Check 2: Super Admin User
Write-Host "2. Checking super admin user..." -ForegroundColor Yellow
try {
    $userCheck = docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "SELECT email, role, is_active FROM users WHERE email = 'ugochukwuhenry16@gmail.com';" 2>&1
    if ($userCheck -match "super_admin") {
        Write-Host "   ✓ Super admin user exists with correct role" -ForegroundColor Green
    } elseif ($userCheck -match "ugochukwuhenry16@gmail.com") {
        Write-Host "   ⚠ User exists but role may be incorrect" -ForegroundColor Yellow
        Write-Host "   Fix: Run 'pwsh -File CREATE_SUPER_ADMIN.ps1'" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ Super admin user not found" -ForegroundColor Red
        Write-Host "   Fix: Run 'pwsh -File CREATE_SUPER_ADMIN.ps1'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Could not check user" -ForegroundColor Red
}

Write-Host ""

# Check 3: API Server Status
Write-Host "3. Checking API server..." -ForegroundColor Yellow
try {
    $apiCheck = curl -s http://localhost:4000/api/health 2>&1
    if ($apiCheck -match "healthy" -or $apiCheck -match "status") {
        Write-Host "   ✓ API server is running" -ForegroundColor Green
    } else {
        Write-Host "   ✗ API server is not responding" -ForegroundColor Red
        Write-Host "   Fix: Start API server with 'cd apps/api && pnpm dev'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ API server is not running" -ForegroundColor Red
    Write-Host "   Fix: Start API server with 'cd apps/api && pnpm dev'" -ForegroundColor Yellow
}

Write-Host ""

# Check 4: API Keys
Write-Host "4. Checking API keys..." -ForegroundColor Yellow
$envFile = "apps\api\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "ANTHROPIC_API_KEY=sk-ant-") {
        Write-Host "   ✓ Anthropic API key is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Anthropic API key may not be configured" -ForegroundColor Yellow
        Write-Host "   Fix: Add ANTHROPIC_API_KEY to apps/api/.env" -ForegroundColor Yellow
    }
    
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "   ✓ OpenAI API key is configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ OpenAI API key may not be configured" -ForegroundColor Yellow
        Write-Host "   Fix: Add OPENAI_API_KEY to apps/api/.env" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
    Write-Host "   Fix: Create apps/api/.env file" -ForegroundColor Yellow
}

Write-Host ""

# Check 5: Database Tables
Write-Host "5. Checking database tables..." -ForegroundColor Yellow
try {
    $tablesCheck = docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'audit_logs', 'contributions');" 2>&1
    if ($tablesCheck -match "users" -and $tablesCheck -match "audit_logs" -and $tablesCheck -match "contributions") {
        Write-Host "   ✓ Required tables exist" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Some tables may be missing" -ForegroundColor Yellow
        Write-Host "   Fix: Run 'cd packages/database && node scripts/migrate.js schema'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Could not check tables" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Fix any issues found above" -ForegroundColor White
Write-Host "2. Restart API server: cd apps/api && pnpm dev" -ForegroundColor White
Write-Host "3. Try logging in again" -ForegroundColor White
Write-Host ""

