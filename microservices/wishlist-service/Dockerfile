# Build version: 1.0.1 - Wishlist Service Simplified
# Railway: Rutas relativas (context es el directorio del servicio)
FROM node:20-alpine

WORKDIR /app

# Rutas relativas al directorio del servicio
COPY package.json ./package.json
COPY src/ ./src/

# Shared files - crear stub para métricas
RUN mkdir -p shared && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > ./shared/metrics-simple.js

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock --ignore-scripts

CMD ["node", "src/server.simple.js"]
