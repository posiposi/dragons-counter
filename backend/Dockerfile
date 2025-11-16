# ================================
# Development Stage
# ================================
FROM node:24.6.0-alpine AS development

RUN apk add --no-cache bash vim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3443

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# ================================
# Dependencies Stage (本番用依存関係のみ)
# ================================
FROM node:24.6.0-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ================================
# Builder Stage (アプリケーションのビルド)
# ================================
FROM node:24.6.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

RUN npm run build

# ================================
# Production Stage (本番環境)
# ================================
FROM node:24.6.0-alpine AS production

# セキュリティとデバッグ用のツールをインストール
RUN apk add --no-cache bash openssl dumb-init

WORKDIR /app

# 本番用依存関係のコピー
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Prismaスキーマとクライアントのコピー
COPY prisma ./prisma/
RUN npx prisma generate

# ビルド済みアプリケーションのコピー
COPY --from=builder /app/dist ./dist

# マイグレーションスクリプトのコピー
COPY scripts/migrate.sh ./scripts/migrate.sh
RUN chmod +x ./scripts/migrate.sh

# 非rootユーザーで実行
RUN chown -R node:node /app
USER node

EXPOSE 3000

# ヘルスチェック (ECS独自のヘルスチェックを使用する場合はコメントアウト可)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# dumb-initを使用してシグナルを適切に処理
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/main"]