# ================================
# Development Stage
# ================================
FROM node:24.6.0-alpine AS development

RUN apk add --no-cache bash vim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3043

CMD ["npm", "run", "dev"]

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

COPY . .

# Next.js Telemetryを無効化
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ================================
# Production Stage (本番環境)
# ================================
FROM node:24.6.0-alpine AS production

# セキュリティとデバッグ用のツールをインストール
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone出力を使用（最小限の依存関係のみ）
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 非rootユーザーで実行
RUN chown -R node:node /app
USER node

EXPOSE 3000

# ヘルスチェック (ECS独自のヘルスチェックを使用する場合はコメントアウト可)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# dumb-initを使用してシグナルを適切に処理
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]