# Build version: 1.0.5 - Cart Service Simplified
# Railway: Rutas relativas (context es el directorio del servicio)
FROM node:18-alpine

WORKDIR /app

# Rutas relativas al directorio del servicio
COPY package-simple.json ./package.json
COPY src/ ./src/

# Shared files stub
RUN mkdir -p shared && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock --ignore-scripts

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3008

CMD ["node", "src/server.simple.js"]
