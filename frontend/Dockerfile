FROM node:24.6.0-alpine AS development

RUN apk add --no-cache bash vim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3043

CMD ["npm", "run", "dev"]

FROM node:24.6.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:24.6.0-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]