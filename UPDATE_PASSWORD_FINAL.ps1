# Update Password Hash with Specific Hash
# Uses the hash generated: $2a$10$PqjR/u22ooa4cMDW8rbgb.5k1Ps3NHGfplCKlXwaMxwDT.uBE3ivu

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating Password Hash" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passwordHash = '$2a$10$PqjR/u22ooa4cMDW8rbgb.5k1Ps3NHGfplCKlXwaMxwDT.uBE3ivu'
$email = 'ugochukwuhenry16@gmail.com'
$password = '1995Mobuchi@.'

Write-Host "Password hash to use:" -ForegroundColor Yellow
Write-Host $passwordHash -ForegroundColor White
Write-Host ""

# Create SQL file
$sqlFile = Join-Path $PSScriptRoot "temp_update_password.sql"
$sql = "UPDATE users SET password_hash = '$passwordHash', updated_at = CURRENT_TIMESTAMP WHERE email = '$email';"

$sql | Out-File -FilePath $sqlFile -Encoding utf8 -NoNewline

Write-Host "Updating password hash in database..." -ForegroundColor Yellow

# Execute SQL
$result = Get-Content $sqlFile | docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev 2>&1

Remove-Item $sqlFile -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0 -or $result -match "UPDATE") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Password Hash Updated!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Verify the update
    Write-Host "Verifying password..." -ForegroundColor Yellow
    cd apps/api
    $verifyResult = node -e "const bcrypt = require('bcryptjs'); const hash = '$passwordHash'; bcrypt.compare('$password', hash).then(r => console.log(r ? 'YES' : 'NO'));" 2>&1 | Select-Object -Last 1
    
    if ($verifyResult -match "YES") {
        Write-Host "✅ Password hash is correct!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Login Credentials:" -ForegroundColor Yellow
        Write-Host "  Email:    $email" -ForegroundColor White
        Write-Host "  Password: $password" -ForegroundColor White
        Write-Host ""
        Write-Host "Try logging in now at: http://localhost:3000/login" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Password verification failed. Hash may be incorrect." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Error updating password:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

