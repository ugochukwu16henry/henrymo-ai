# Development Environment Startup Script (PowerShell)
# Starts all development services

Write-Host "🚀 Starting HenryMo AI Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL
Write-Host "📦 Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Check if PostgreSQL is healthy
$status = docker-compose ps postgres 2>&1
if ($status -match "healthy") {
    Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL is starting (may take a moment)..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - API Server: cd apps/api && pnpm run dev" -ForegroundColor White
Write-Host "  - Database: docker-compose exec postgres psql -U postgres -d henmo_ai_dev" -ForegroundColor White
Write-Host ""

