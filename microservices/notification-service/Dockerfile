# Build version: 1.0.1 - Notification Service Simplified
# Railway context: root of repo, not Root Directory
# UPDATED: Force rebuild in Railway
FROM node:18-alpine

WORKDIR /app

# CRITICAL: Paths absolute from repo root
COPY microservices/notification-service/package-simple.json ./package.json
COPY microservices/notification-service/src/ ./src/

RUN npm install --omit=dev --no-package-lock

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

CMD ["node", "src/server.simple.js"]
