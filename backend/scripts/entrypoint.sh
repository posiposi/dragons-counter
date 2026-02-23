#!/bin/sh
set -e

echo "Running database migrations..."
npx typeorm migration:run -d dist/infrastructure/typeorm/data-source.js

echo "Starting application..."
exec "$@"
