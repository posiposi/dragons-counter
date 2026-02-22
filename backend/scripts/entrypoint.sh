#!/bin/sh
set -e

echo "Synchronizing database schema..."
npx typeorm schema:sync -d dist/infrastructure/typeorm/data-source.js

echo "Starting application..."
exec "$@"
