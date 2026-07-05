# ================================
# Development Stage
# ================================
FROM golang:1.24.13-alpine AS development

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

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

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["/app/api"]
