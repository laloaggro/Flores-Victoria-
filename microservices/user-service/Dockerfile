# Build version: 1.0.1 - User Service Simplified (PostgreSQL + winston)
# Railway cache bust: 2025-12-11T15:25:00-03:00
# Railway context: root of repo, not Root Directory
FROM node:18-alpine

WORKDIR /app

# Copy source files (paths relative to repo root)
COPY microservices/user-service/package-simple.json ./package.json
COPY microservices/user-service/src/ ./src/

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock

# Verify critical files and dependencies
RUN grep -q "logger.simple" src/config/database.js || exit 1
RUN node -e "require('pg'); require('express'); require('winston');" || exit 1

CMD ["node", "src/server.simple.js"]
