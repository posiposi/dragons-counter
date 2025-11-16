#!/bin/bash
set -e

echo "========================================="
echo "Database Migration Script for Production"
echo "========================================="

# 環境変数の確認
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "DATABASE_URL is set"
echo ""

# Prismaクライアント生成
echo "Generating Prisma Client..."
npx prisma generate
echo "✓ Prisma Client generated successfully"
echo ""

# マイグレーション実行
echo "Running database migrations..."
npx prisma migrate deploy
echo "✓ Migrations completed successfully"
echo ""

echo "========================================="
echo "Migration completed successfully!"
echo "========================================="
