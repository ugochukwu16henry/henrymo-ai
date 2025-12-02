#!/bin/bash
# Complete Development Environment Setup
# Run this script to set up everything from scratch

set -e

echo "🔧 Setting up HenryMo AI Development Environment..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
sleep 8

# Run database schema
echo "🗄️  Setting up database..."
cd packages/database
node scripts/migrate.js schema

# Seed initial data
echo "🌱 Seeding initial data..."
node scripts/seed.js

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start API server: cd apps/api && pnpm run dev"
echo "  2. Access API: http://localhost:4000"
echo ""

