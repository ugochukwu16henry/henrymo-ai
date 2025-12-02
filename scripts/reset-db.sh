#!/bin/bash
# Reset Database Script
# WARNING: This will delete all data!

read -p "⚠️  This will DELETE ALL DATABASE DATA. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo "🗑️  Resetting database..."

# Stop and remove container
docker-compose stop postgres
docker volume rm henrymo-ai_postgres_data 2>/dev/null || true

# Start fresh
docker-compose up -d postgres
sleep 8

# Run schema
cd packages/database
node scripts/migrate.js schema
node scripts/seed.js

echo "✅ Database reset complete!"

