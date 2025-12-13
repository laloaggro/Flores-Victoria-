# Build version: 1.0.7 - Payment Service Simplified
# Railway: Rutas desde raíz del repo (root_dir vacío en railway-configs)
FROM node:18-alpine

WORKDIR /app

COPY microservices/payment-service/package-simple.json ./package.json
COPY microservices/payment-service/src/ ./src/

RUN mkdir -p shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock --ignore-scripts
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3011

CMD ["node", "src/server.simple.js"]
