# Build version: 1.0.6 - Promotion Service Simplified
# Railway: Rutas relativas (context es el directorio del servicio)

FROM node:18-alpine

WORKDIR /app

COPY package-simple.json ./package.json
COPY src/ ./src/
COPY models/ ./models/
COPY routes.js ./routes.js
COPY shared/ ./shared/

RUN npm install --omit=dev --no-package-lock --ignore-scripts
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3019

CMD ["node", "src/server.simple.js"]
