# Build version: 1.0.5 - User Service Simplified (PostgreSQL + winston)
# Railway: Rutas relativas (context es el directorio del servicio)
FROM node:18-alpine

WORKDIR /app

COPY package-simple.json ./package.json
COPY src/ ./src/

RUN npm install --omit=dev --no-package-lock --ignore-scripts

# Verify critical files and dependencies
RUN grep -q "logger.simple" src/config/database.js || exit 1
RUN node -e "require('pg'); require('express'); require('winston');" || exit 1

EXPOSE 3002

CMD ["node", "src/server.simple.js"]
