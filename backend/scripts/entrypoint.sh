#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Applying database schema..."
npx prisma db push --skip-generate

echo "Starting application..."
exec "$@"