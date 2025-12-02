# Reset Database Script (PowerShell)
# WARNING: This will delete all data!

$confirm = Read-Host "⚠️  This will DELETE ALL DATABASE DATA. Type 'yes' to continue"

if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow

# Stop and remove container
docker-compose stop postgres
docker volume rm henrymo-ai_postgres_data -ErrorAction SilentlyContinue

# Start fresh
docker-compose up -d postgres
Start-Sleep -Seconds 8

# Run schema
cd packages/database
node scripts/migrate.js schema
node scripts/seed.js

cd ..\..

Write-Host "✅ Database reset complete!" -ForegroundColor Green

