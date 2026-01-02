# contact-service - Flores Victoria v3.1.0
# Railway: paths from repo root
FROM node:18-alpine

WORKDIR /app

COPY microservices/contact-service/package*.json ./

RUN npm ci --omit=dev

COPY microservices/contact-service/src/ ./src/

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

CMD ["node", "src/server.js"]
