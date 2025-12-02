# Fix Database Connection from Host Machine
# This ensures your Windows PC (host) can connect to the Docker database

Write-Host "=== Fixing Host → Container Database Connection ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "You are the HOST (Windows PC)" -ForegroundColor Yellow
Write-Host "Database is in CONTAINER (Docker)" -ForegroundColor Yellow
Write-Host "We need to allow your PC to connect to the container" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Checking PostgreSQL authentication method..." -ForegroundColor Cyan
docker-compose exec postgres psql -U postgres -c "SHOW password_encryption;"

Write-Host ""
Write-Host "Step 2: Setting password encryption to md5 (more compatible)..." -ForegroundColor Cyan
docker-compose exec postgres psql -U postgres -c "ALTER SYSTEM SET password_encryption = 'md5';"
docker-compose exec postgres psql -U postgres -c "SELECT pg_reload_conf();"

Write-Host ""
Write-Host "Step 3: Resetting postgres password with md5 encryption..." -ForegroundColor Cyan
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

Write-Host ""
Write-Host "Step 4: Restarting PostgreSQL to apply all changes..." -ForegroundColor Cyan
docker-compose restart postgres

Write-Host ""
Write-Host "Waiting for PostgreSQL to restart..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Step 5: Testing connection from host (your PC)..." -ForegroundColor Cyan
cd apps\api
node test-db-individual.js

Write-Host ""
Write-Host "=== Fix Complete ===" -ForegroundColor Cyan

