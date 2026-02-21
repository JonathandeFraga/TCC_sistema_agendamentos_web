# server/server/Dockerfile
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Dependências do argon2 e Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

    COPY . .

# Prisma client e build do Nest
RUN npm ci
RUN npx prisma@5.18.0 generate
RUN npm run build

# -----------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]