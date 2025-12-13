# Build version: 1.0.6 - Product Service Simplified
# Railway: Contexto es RAÍZ del repo, usar rutas absolutas
FROM node:18-alpine

WORKDIR /app

# Rutas absolutas desde la raíz del repositorio
COPY microservices/product-service/package-simple.json ./package.json
COPY microservices/product-service/src/ ./src/

# Shared files stub
RUN mkdir -p shared && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3009

CMD ["node", "src/server.simple.js"]
