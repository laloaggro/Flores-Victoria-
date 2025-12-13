# Build version: 1.0.8 - Product Service Simplified
# Railway: Root Directory = microservices/product-service, usar rutas relativas
FROM node:18-alpine

WORKDIR /app

# Rutas relativas (Root Directory está configurado en Railway)
COPY package-simple.json ./package.json
COPY src/ ./src/

# Shared files stub
RUN mkdir -p shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock --ignore-scripts
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3009

CMD ["node", "src/server.simple.js"]
