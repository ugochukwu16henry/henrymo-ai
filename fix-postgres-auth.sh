#!/bin/bash
# Fix PostgreSQL authentication to allow localhost connections

docker-compose exec postgres psql -U postgres <<EOF
-- Allow password authentication from localhost
ALTER SYSTEM SET password_encryption = 'md5';
SELECT pg_reload_conf();
EOF

echo "PostgreSQL authentication updated. Restarting container..."
docker-compose restart postgres

echo "Waiting for PostgreSQL to restart..."
sleep 5

echo "Testing connection..."
docker-compose exec postgres psql -U postgres -d henmo_ai_dev -c "SELECT 1;"

