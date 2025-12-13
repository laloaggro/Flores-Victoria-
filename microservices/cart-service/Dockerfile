# Build version: 1.0.4 - Cart Service Simplified
# Railway: Rutas absolutas desde raíz del repo
FROM node:18-alpine

WORKDIR /app

# Rutas absolutas desde raíz del repo (Railway no respeta rootDirectory)
COPY microservices/cart-service/package-simple.json ./package.json
COPY microservices/cart-service/src/ ./src/
COPY microservices/shared/metrics-simple.js ./shared/

RUN npm install --omit=dev --no-package-lock

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3005

CMD ["node", "src/server.simple.js"]
