# Build version: 1.0.1 - Cart Service Railway (force rebuild)
# Railway: Rutas desde raíz del repo (context es el root)
FROM node:18-alpine

WORKDIR /app

# Debug: list available files first
RUN echo "Build context contents:"

COPY microservices/cart-service/package-simple.json ./package.json
COPY microservices/cart-service/src/ ./src/

RUN mkdir -p shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock --ignore-scripts
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3005

CMD ["node", "src/server.simple.js"]
