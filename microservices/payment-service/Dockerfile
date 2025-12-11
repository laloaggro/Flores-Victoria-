# Build version: 1.0.0 - Payment Service Simplified
# Railway context: root of repo, not Root Directory
FROM node:18-alpine

WORKDIR /app

# CRITICAL: Paths absolute from repo root
COPY microservices/payment-service/package-simple.json ./package.json
COPY microservices/payment-service/src/ ./src/

RUN npm install --omit=dev --no-package-lock

CMD ["node", "src/server.simple.js"]
