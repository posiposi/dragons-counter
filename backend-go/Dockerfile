# ================================
# Development Stage
# ================================
FROM golang:1.24.13-alpine AS development

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
# TLS証明書はイメージにCOPYしない（.dockerignoreでも除外）。実行時にcomposeで /app/certs にマウントする想定

EXPOSE 3443

CMD ["go", "run", "./cmd/api"]

# ================================
# Builder Stage
# ================================
FROM golang:1.24.13-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# 静的バイナリにして実行ステージをalpine最小構成にする
RUN CGO_ENABLED=0 go build -o /app/api ./cmd/api

# ================================
# Production Stage
# ================================
FROM alpine:3.21.5 AS production

RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

COPY --from=builder /app/api ./api

ENV GO_ENV=production

USER app

# 本番はTLS終端を上流（ALB/リバースプロキシ）が担うため平文HTTP
EXPOSE 3000

# alpine同梱のBusyBox wgetを使用（curl非搭載）。--spiderでボディを保存しない
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["/app/api"]
