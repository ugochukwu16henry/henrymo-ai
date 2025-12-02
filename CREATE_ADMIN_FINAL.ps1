# Create Super Admin - Final Version
Write-Host "Creating super admin user..." -ForegroundColor Cyan

cd apps\api
$hash = node -e "require('bcryptjs').hash('admin123!', 10).then(h => console.log(h))"
$hash = $hash.Trim()

Write-Host "Password hash generated" -ForegroundColor Green

cd ..\..
docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "INSERT INTO users (id, email, password_hash, name, role, subscription_tier, is_email_verified, is_active, country_code) VALUES (gen_random_uuid(), 'admin@henrymo-ai.com', '$hash', 'Henry Maobughichi Ugochukwu', 'super_admin', 'enterprise', true, true, 'NG') ON CONFLICT (email) DO NOTHING RETURNING email, role, name;"

Write-Host ""
Write-Host "Super admin created!" -ForegroundColor Green
Write-Host "Email: admin@henrymo-ai.com" -ForegroundColor Yellow
Write-Host "Password: admin123!" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️ CHANGE THIS PASSWORD IMMEDIATELY!" -ForegroundColor Red

