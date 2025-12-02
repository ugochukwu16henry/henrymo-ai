#!/bin/bash
# Development Environment Startup Script
# Starts all development services

echo "🚀 Starting HenryMo AI Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is healthy
if docker-compose ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is ready!"
else
    echo "⚠️  PostgreSQL is starting (may take a moment)..."
fi

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "Next steps:"
echo "  - API Server: cd apps/api && pnpm run dev"
echo "  - Database: docker-compose exec postgres psql -U postgres -d henmo_ai_dev"
echo ""

