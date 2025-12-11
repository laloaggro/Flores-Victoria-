# Build version: 1.0.0 - Contact Service Simplified
# Railway context: root of repo, not Root Directory
FROM node:18-alpine

WORKDIR /app

# CRITICAL: Paths absolute from repo root
COPY microservices/contact-service/package-simple.json ./package.json
COPY microservices/contact-service/src/ ./src/

RUN npm install --omit=dev --no-package-lock

# Validation: ensure logger.simple is used
RUN grep -q "logger.simple" src/config/database.js || exit 1

CMD ["node", "src/server.simple.js"]
