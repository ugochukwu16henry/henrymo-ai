# Simple Database Connection Fix
# This script will reset the PostgreSQL password and ensure it works

Write-Host "=== Fixing Database Connection ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Ensuring PostgreSQL is running..." -ForegroundColor Yellow
docker-compose ps postgres | Select-String "Up"

Write-Host ""
Write-Host "Step 2: Resetting postgres password..." -ForegroundColor Yellow
docker-compose exec -T postgres psql -U postgres <<EOF
-- Set password encryption to md5
ALTER SYSTEM SET password_encryption = 'md5';
SELECT pg_reload_conf();
EOF

Start-Sleep -Seconds 2

docker-compose exec -T postgres psql -U postgres <<EOF
-- Reset password
ALTER USER postgres WITH PASSWORD 'postgres';
EOF

Write-Host ""
Write-Host "Step 3: Restarting PostgreSQL..." -ForegroundColor Yellow
docker-compose restart postgres

Write-Host ""
Write-Host "Waiting for PostgreSQL to restart..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Step 4: Verifying connection from inside container..." -ForegroundColor Yellow
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT 'Connection works!' as status;"

Write-Host ""
Write-Host "Step 5: Testing connection from Node.js..." -ForegroundColor Yellow
cd apps\api
node test-db-individual.js

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

