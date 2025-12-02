# Complete Development Environment Setup (PowerShell)
# Run this script to set up everything from scratch

Write-Host "🔧 Setting up HenryMo AI Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✅ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check Docker
try {
    docker info | Out-Null
    Write-Host "  ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Start Docker services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Run database schema
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
cd packages/database
node scripts/migrate.js schema

# Seed initial data
Write-Host "🌱 Seeding initial data..." -ForegroundColor Yellow
node scripts/seed.js

cd ..\..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start API server: cd apps/api && pnpm run dev" -ForegroundColor White
Write-Host "  2. Access API: http://localhost:4000" -ForegroundColor White
Write-Host ""

