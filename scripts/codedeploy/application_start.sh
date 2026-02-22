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

echo "Running database schema sync..."
/usr/local/bin/docker-compose exec -T backend npx typeorm schema:sync -d dist/infrastructure/typeorm/data-source.js

echo "=== ApplicationStart completed at $(date) ==="
