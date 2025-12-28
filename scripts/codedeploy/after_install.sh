#!/bin/bash
set -e

echo "=== AfterInstall started at $(date) ==="

APP_DIR="/opt/dragons-counter"
DEPLOY_DIR="$APP_DIR/deploy/production"
BACKUP_DIR="/tmp/dragons-counter-backup"

if [ -f "$BACKUP_DIR/.env" ]; then
    echo "Restoring .env file from backup..."
    cp "$BACKUP_DIR/.env" "$DEPLOY_DIR/.env"
    echo ".env restored"
else
    echo "WARNING: No .env backup found. Initial deployment may require manual .env creation."
fi

chown -R ec2-user:ec2-user "$APP_DIR"

echo "=== AfterInstall completed at $(date) ==="
