# Build version: 1.0.4 - Auth Service Simplified
# Railway: Rutas absolutas desde raíz del repo
FROM node:18-alpine

WORKDIR /app

# Rutas absolutas desde raíz del repo (Railway no respeta rootDirectory)
COPY microservices/auth-service/package-simple.json ./package.json
COPY microservices/auth-service/src/ ./src/
COPY microservices/shared/metrics-simple.js ./shared/

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock

CMD ["node", "src/server.simple.js"]
