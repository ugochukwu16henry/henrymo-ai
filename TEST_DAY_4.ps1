# Day 4 Testing Script
# Tests all Day 4 deliverables

Write-Host "🧪 Testing Stage 1 Day 4: Development Environment & Documentation" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$allTestsPassed = $true
$testCount = 0
$passedCount = 0

function Test-File {
    param([string]$Path, [string]$Description)
    $script:testCount++
    if (Test-Path $Path) {
        Write-Host "  ✅ Test $testCount`: $Description" -ForegroundColor Green
        $script:passedCount++
        return $true
    } else {
        Write-Host "  ❌ Test $testCount`: $Description" -ForegroundColor Red
        Write-Host "     Missing: $Path" -ForegroundColor Yellow
        $script:allTestsPassed = $false
        return $false
    }
}

function Test-FileContent {
    param([string]$Path, [string]$Description, [string]$ShouldContain)
    $script:testCount++
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match $ShouldContain) {
            Write-Host "  ✅ Test $testCount`: $Description" -ForegroundColor Green
            $script:passedCount++
            return $true
        } else {
            Write-Host "  ⚠️  Test $testCount`: $Description" -ForegroundColor Yellow
            Write-Host "     File exists but may not contain expected content" -ForegroundColor Yellow
            return $true  # Don't fail, just warn
        }
    } else {
        Write-Host "  ❌ Test $testCount`: $Description" -ForegroundColor Red
        $script:allTestsPassed = $false
        return $false
    }
}

# Test 1: Development Scripts
Write-Host "📋 Test 1: Development Scripts" -ForegroundColor Yellow
Test-File "scripts\setup.ps1" "Setup script (PowerShell) exists"
Test-File "scripts\setup.sh" "Setup script (Bash) exists"
Test-File "scripts\dev.ps1" "Dev script (PowerShell) exists"
Test-File "scripts\dev.sh" "Dev script (Bash) exists"
Test-File "scripts\reset-db.ps1" "Reset DB script (PowerShell) exists"
Test-File "scripts\reset-db.sh" "Reset DB script (Bash) exists"
Write-Host ""

# Test 2: Documentation Files
Write-Host "📚 Test 2: Documentation Files" -ForegroundColor Yellow
Test-File "docs\DEVELOPMENT_SETUP.md" "Development Setup guide exists"
Test-File "docs\ENVIRONMENT_VARIABLES.md" "Environment Variables guide exists"
Test-File "docs\CONTRIBUTING.md" "Contributing guidelines exist"
Test-File "docs\API_DOCUMENTATION.md" "API Documentation exists"
Test-File "docs\DEPLOYMENT.md" "Deployment guide exists"
Write-Host ""

# Test 3: Environment Templates
Write-Host "🔧 Test 3: Environment Templates" -ForegroundColor Yellow
Test-File "apps\api\env.example.txt" "API environment template exists"
Test-File "apps\hub\hub\env.example" "Frontend environment template exists"
Write-Host ""

# Test 4: Documentation Content Checks
Write-Host "📖 Test 4: Documentation Content" -ForegroundColor Yellow
Test-FileContent "docs\DEVELOPMENT_SETUP.md" "Development Setup has content" "Prerequisites"
Test-FileContent "docs\ENVIRONMENT_VARIABLES.md" "Environment Variables has content" "DATABASE_URL"
Test-FileContent "docs\CONTRIBUTING.md" "Contributing has content" "Code of Conduct"
Test-FileContent "docs\API_DOCUMENTATION.md" "API Documentation has content" "/api/health"
Test-FileContent "docs\DEPLOYMENT.md" "Deployment guide has content" "Prerequisites"
Write-Host ""

# Test 5: README Links
Write-Host "🔗 Test 5: README Documentation Links" -ForegroundColor Yellow
$readmeContent = Get-Content "README.md" -Raw
$linksFound = @()
if ($readmeContent -match "docs/DEVELOPMENT_SETUP.md") { $linksFound += "Development Setup" }
if ($readmeContent -match "docs/ENVIRONMENT_VARIABLES.md") { $linksFound += "Environment Variables" }
if ($readmeContent -match "docs/CONTRIBUTING.md") { $linksFound += "Contributing" }
if ($readmeContent -match "docs/API_DOCUMENTATION.md") { $linksFound += "API Documentation" }
if ($readmeContent -match "docs/DEPLOYMENT.md") { $linksFound += "Deployment" }

$script:testCount++
if ($linksFound.Count -ge 4) {
    Write-Host "  ✅ Test $testCount`: README contains documentation links" -ForegroundColor Green
    Write-Host "     Found links: $($linksFound -join ', ')" -ForegroundColor Gray
    $script:passedCount++
} else {
    Write-Host "  ⚠️  Test $testCount`: Some documentation links may be missing" -ForegroundColor Yellow
    Write-Host "     Found: $($linksFound -join ', ')" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Script Content Checks
Write-Host "📝 Test 6: Script Content" -ForegroundColor Yellow
Test-FileContent "scripts\setup.ps1" "Setup script has Docker commands" "docker-compose"
Test-FileContent "scripts\dev.ps1" "Dev script has Docker commands" "docker-compose"
Write-Host ""

# Test 7: Completion Files
Write-Host "📄 Test 7: Completion Documentation" -ForegroundColor Yellow
Test-File "STAGE_1_DAY_4_COMPLETE.md" "Day 4 completion summary exists"
Test-File "STAGE_1_DAY_4_TESTING.md" "Day 4 testing guide exists"
Write-Host ""

# Summary
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "  Total Tests: $testCount" -ForegroundColor White
Write-Host "  Passed: $passedCount" -ForegroundColor Green
Write-Host "  Failed: $($testCount - $passedCount)" -ForegroundColor $(if (($testCount - $passedCount) -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($allTestsPassed -and ($testCount -eq $passedCount)) {
    Write-Host "✅ All Day 4 tests PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Day 4 is complete and ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  - Review documentation in docs/ folder" -ForegroundColor White
    Write-Host "  - Test setup script: .\scripts\setup.ps1" -ForegroundColor White
    Write-Host "  - Continue to Stage 2 Day 5: Authentication" -ForegroundColor White
    exit 0
} else {
    Write-Host "⚠️  Some tests had warnings. Please review above." -ForegroundColor Yellow
    exit 1
}

