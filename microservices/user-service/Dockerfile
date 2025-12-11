# Build version: 1.0.0 - User Service Simplified (PostgreSQL + winston)
# Railway cache bust: 2025-12-11T15:10:00-03:00
FROM node:18-alpine

WORKDIR /app

# Copy source files
COPY package-simple.json ./package.json
COPY src/ ./src/

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock

# Verify critical files and dependencies
RUN grep -q "logger.simple" src/config/database.js || exit 1
RUN node -e "require('pg'); require('express'); require('winston');" || exit 1

CMD ["node", "src/server.simple.js"]
