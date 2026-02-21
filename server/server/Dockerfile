# server/server/Dockerfile
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Dependências do argon2 e Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma@5.18.0 generate

COPY . .
RUN npm run build

# -----------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npx prisma@5.18.0 generate

EXPOSE 3000

CMD sh -c "npx prisma@5.18.0 migrate deploy && node dist/src/main"