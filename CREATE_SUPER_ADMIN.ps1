# Create Super Admin User for HenryMo AI
# This script creates/updates the super admin account

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Super Admin Account" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to API directory where bcryptjs is installed
$apiDir = Join-Path $PSScriptRoot "apps\api"
if (-not (Test-Path $apiDir)) {
    Write-Host "Error: API directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Generating password hash..." -ForegroundColor Yellow
cd $apiDir

# Generate password hash using Node.js
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

Write-Host "Password hash generated successfully" -ForegroundColor Green
Write-Host ""

# Navigate back to root
cd $PSScriptRoot

# Create SQL script
$sqlScript = @"
INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    role,
    subscription_tier,
    is_email_verified,
    is_active,
    country_code,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'ugochukwuhenry16@gmail.com',
    '$passwordHash',
    'Henry Maobughichi Ugochukwu',
    'super_admin',
    'enterprise',
    true,
    true,
    'NG',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = 'super_admin',
    subscription_tier = 'enterprise',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP;
"@

Write-Host "Creating super admin user in database..." -ForegroundColor Yellow

# Execute SQL using Docker
$dockerCmd = "docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev"
$result = $sqlScript | & docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Super Admin Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Yellow
    Write-Host "  Email:    ugochukwuhenry16@gmail.com" -ForegroundColor White
    Write-Host "  Password: $password" -ForegroundColor White
    Write-Host "  Role:     super_admin" -ForegroundColor White
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Yellow
    Write-Host "  Login Page:        http://localhost:3000/login" -ForegroundColor Cyan
    Write-Host "  Admin Dashboard:   http://localhost:3000/dashboard/admin" -ForegroundColor Cyan
    Write-Host "  Landing Page:      http://localhost:3000/ (when logged out)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error creating super admin:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use psql directly if Docker method fails
    $env:PGPASSWORD = "postgres"
    $psqlCmd = "psql -h localhost -p 5433 -U postgres -d henmo_ai_dev"
    $result = $sqlScript | & $psqlCmd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Super admin created using direct psql connection!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Login Credentials:" -ForegroundColor Yellow
        Write-Host "  Email:    ugochukwuhenry16@gmail.com" -ForegroundColor White
        Write-Host "  Password: $password" -ForegroundColor White
    } else {
        Write-Host "Failed to create super admin. Please check database connection." -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

