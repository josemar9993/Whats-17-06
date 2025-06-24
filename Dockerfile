# =================================
#  Estágio 1: Builder
# =================================
FROM node:18-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .

# =================================
#  Estágio 2: Production
# =================================
FROM node:18-bookworm-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

CMD ["node", "src/index.js"]
