# Payment Service - Flores Victoria v3.1.0
# Railway: paths from repo root (root_dir is empty)
FROM node:18-alpine

WORKDIR /app

# Copy from repo root paths
COPY microservices/payment-service/package*.json ./

RUN npm ci --omit=dev

COPY microservices/payment-service/src/ ./src/

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3011/health || exit 1

CMD ["node", "src/server.js"]
