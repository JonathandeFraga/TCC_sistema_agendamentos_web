# server/server/Dockerfile
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Dependências do argon2 e Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

    COPY . .

# Prisma client e build do Nest
RUN npx prisma generate
RUN npm run build

# -----------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=buidler /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]