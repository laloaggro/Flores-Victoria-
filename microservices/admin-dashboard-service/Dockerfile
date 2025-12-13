# Build version: 1.0.5 - Admin Dashboard Service Simplified
# Railway: Rutas relativas (context es el directorio del servicio)
FROM node:18-alpine

WORKDIR /app

COPY package-simple.json ./package.json
COPY src/ ./src/
COPY dashboard.html ./

RUN mkdir -p shared && echo 'module.exports = { register: () => {}, metrics: () => "# No metrics" };' > ./shared/metrics-simple.js

RUN npm install --omit=dev --no-package-lock
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3012

CMD ["node", "src/server.simple.js"]
