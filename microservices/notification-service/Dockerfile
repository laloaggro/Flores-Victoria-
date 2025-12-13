# Build version: 1.0.3 - Notification Service Simplified
# Railway: Rutas absolutas desde raíz del repo
FROM node:18-alpine

WORKDIR /app

# Rutas absolutas desde raíz del repo (Railway no respeta rootDirectory)
COPY microservices/notification-service/package-simple.json ./package.json
COPY microservices/notification-service/src/ ./src/

RUN npm install --omit=dev --no-package-lock

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3010

CMD ["node", "src/server.simple.js"]
