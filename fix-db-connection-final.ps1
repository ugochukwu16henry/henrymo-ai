# Final fix for database connection
# The issue is with password encryption method

Write-Host "Fixing PostgreSQL password authentication..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Setting password encryption to md5..." -ForegroundColor Yellow
docker-compose exec postgres psql -U postgres -c "ALTER SYSTEM SET password_encryption = 'md5';"
docker-compose exec postgres psql -U postgres -c "SELECT pg_reload_conf();"

Write-Host ""
Write-Host "Step 2: Updating postgres user password..." -ForegroundColor Yellow
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

Write-Host ""
Write-Host "Step 3: Restarting PostgreSQL to apply changes..." -ForegroundColor Yellow
docker-compose restart postgres

Write-Host ""
Write-Host "Waiting 5 seconds for PostgreSQL to restart..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Step 4: Testing connection..." -ForegroundColor Yellow
cd apps\api
node test-db-individual.js

