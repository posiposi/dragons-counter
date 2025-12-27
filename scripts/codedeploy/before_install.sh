#!/bin/bash
set -e

echo "=== BeforeInstall started at $(date) ==="

APP_DIR="/opt/dragons-counter"
DEPLOY_DIR="$APP_DIR/deploy/production"
BACKUP_DIR="/tmp/dragons-counter-backup"

if [ -f "$DEPLOY_DIR/.env" ]; then
    echo "Backing up existing .env file..."
    mkdir -p "$BACKUP_DIR"
    cp "$DEPLOY_DIR/.env" "$BACKUP_DIR/.env"
    echo ".env backup completed"
fi

if [ -f "$DEPLOY_DIR/docker-compose.yml" ]; then
    echo "Stopping existing application..."
    cd "$DEPLOY_DIR"
    /usr/local/bin/docker-compose down || true
    echo "Application stopped"
fi

echo "=== BeforeInstall completed at $(date) ==="
