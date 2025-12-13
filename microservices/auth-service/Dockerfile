# Build version: 1.0.6 - Auth Service Simplified
# Railway: Rutas relativas (context es el directorio del servicio)
FROM node:18-alpine

WORKDIR /app

# Rutas relativas al directorio del servicio
COPY package-simple.json ./package.json
COPY src/ ./src/

# Shared files - crear stub para métricas
RUN mkdir -p shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ./shared/metrics-simple.js

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock --ignore-scripts

CMD ["node", "src/server.simple.js"]
