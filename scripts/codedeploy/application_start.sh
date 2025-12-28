#!/bin/bash
set -e

echo "=== ApplicationStart started at $(date) ==="

APP_DIR="/opt/dragons-counter"
DEPLOY_DIR="$APP_DIR/deploy/production"

cd "$DEPLOY_DIR"

echo "Building Docker images..."
/usr/local/bin/docker-compose build

echo "Starting application..."
/usr/local/bin/docker-compose up -d

echo "Waiting for containers to be ready..."
sleep 30

echo "Running database migrations..."
/usr/local/bin/docker-compose exec -T backend npx prisma migrate deploy || \
    /usr/local/bin/docker-compose exec -T backend npx prisma db push

echo "=== ApplicationStart completed at $(date) ==="
