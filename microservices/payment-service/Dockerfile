# Build version: 1.0.1 - Payment Service Simplified
# Railway context: root of repo, not Root Directory
# UPDATED: Force rebuild in Railway
FROM node:18-alpine

WORKDIR /app

# CRITICAL: Paths absolute from repo root
COPY microservices/payment-service/package-simple.json ./package.json
COPY microservices/payment-service/src/ ./src/

RUN npm install --omit=dev --no-package-lock

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

CMD ["node", "src/server.simple.js"]
