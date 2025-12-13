# Build version: 1.0.2 - Cart Service Railway (root_dir = cart-service)
# Railway: Rutas relativas porque root_dir es microservices/cart-service
FROM node:18-alpine

WORKDIR /app

COPY package-simple.json ./package.json
COPY src/ ./src/

RUN mkdir -p shared && printf 'const metricsMiddleware = (name) => (req, res, next) => next();\nconst metricsEndpoint = (name) => (req, res) => res.send("# metrics");\nmodule.exports = { metricsMiddleware, metricsEndpoint };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock --ignore-scripts
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3005

CMD ["node", "src/server.simple.js"]
