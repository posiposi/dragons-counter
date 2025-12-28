#!/bin/bash
set -e

echo "=== ValidateService started at $(date) ==="

echo "Checking container status..."
FRONTEND_STATUS=$(docker inspect -f '{{.State.Running}}' dragons-counter-frontend 2>/dev/null || echo "false")
BACKEND_STATUS=$(docker inspect -f '{{.State.Running}}' dragons-counter-backend 2>/dev/null || echo "false")

if [ "$FRONTEND_STATUS" != "true" ]; then
    echo "ERROR: Frontend container is not running"
    exit 1
fi

if [ "$BACKEND_STATUS" != "true" ]; then
    echo "ERROR: Backend container is not running"
    exit 1
fi

echo "Checking backend health..."
if curl -sf http://localhost:3443/health > /dev/null; then
    echo "Backend health check passed"
else
    echo "ERROR: Backend health check failed"
    exit 1
fi

echo "Checking frontend health..."
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:3043 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "Frontend health check passed"
else
    echo "ERROR: Frontend health check failed"
    exit 1
fi

echo "=== ValidateService completed successfully at $(date) ==="
