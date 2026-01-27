# ================================
# Development Stage
# ================================
FROM node:24.6.0-alpine AS development

RUN apk add --no-cache bash vim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3043

CMD ["npm", "run", "dev"]

# ================================
# Dependencies Stage (本番用依存関係のみ)
# ================================
FROM node:24.6.0-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# ================================
# Builder Stage (アプリケーションのビルド)
# ================================
FROM node:24.6.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=/api
ARG VITE_API_GATEWAY_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL}

RUN npm run build

# ================================
# Production Stage (本番環境)
# ================================
FROM nginx:alpine AS production

# Viteビルド出力をnginxに配置
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx設定（SPAルーティング対応）
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
