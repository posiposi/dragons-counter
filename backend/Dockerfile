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

FROM node:24.6.0-alpine AS production

RUN apk add --no-cache bash vim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=development /app/dist ./dist

EXPOSE 3443

CMD ["node", "dist/main"]