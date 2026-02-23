#!/bin/sh
set -e

echo "Running database migrations..."
npx typeorm migration:run -d dist/infrastructure/typeorm/data-source.js

echo "Running database seeders..."
node dist/infrastructure/typeorm/seeders/seed.js

echo "Starting application..."
exec "$@"
