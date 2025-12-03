# Update Super Admin Password Hash
# This script generates a fresh hash and updates the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating Super Admin Password Hash" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiDir = Join-Path $PSScriptRoot "apps\api"
if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found!" -ForegroundColor Red
    exit 1
}

cd $apiDir

Write-Host "Generating fresh password hash..." -ForegroundColor Yellow
$password = "1995Mobuchi@."

$hashScript = @"
const bcrypt = require('bcryptjs');
bcrypt.hash('$password', 10).then(hash => {
    console.log(hash);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"@

$hashScript | Out-File -Encoding utf8 -FilePath "temp_hash.js" -ErrorAction SilentlyContinue
$passwordHash = node temp_hash.js 2>&1 | Select-Object -First 1
Remove-Item "temp_hash.js" -ErrorAction SilentlyContinue

if ($passwordHash -match "Error") {
    Write-Host "Failed to generate password hash!" -ForegroundColor Red
    Write-Host $passwordHash -ForegroundColor Red
    exit 1
}

$passwordHash = $passwordHash.Trim()
Write-Host "Password hash generated: $($passwordHash.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot

Write-Host "Updating password hash in database..." -ForegroundColor Yellow

# Escape the hash for SQL
$escapedHash = $passwordHash -replace '\$', '\$'

$updateSql = "UPDATE users SET password_hash = '$passwordHash', updated_at = CURRENT_TIMESTAMP WHERE email = 'ugochukwuhenry16@gmail.com';"

$result = $updateSql | docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Password Hash Updated Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Yellow
    Write-Host "  Email:    ugochukwuhenry16@gmail.com" -ForegroundColor White
    Write-Host "  Password: $password" -ForegroundColor White
    Write-Host ""
    Write-Host "Try logging in now at: http://localhost:3000/login" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error updating password hash:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = "postgres"
    $result = $updateSql | psql -h localhost -p 5433 -U postgres -d henmo_ai_dev 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Password hash updated using direct psql connection!" -ForegroundColor Green
    } else {
        Write-Host "Failed to update password hash." -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

