# Build version: 4.0.0 - FORCE REBUILD - database.js uses logger.simple
# Railway cache bust: 2025-12-11T14:53:00-03:00
FROM node:18-alpine

WORKDIR /app

# Copy source files
COPY package-simple.json ./package.json
COPY src/ ./src/

# Install dependencies (production)
RUN npm install --omit=dev --no-package-lock

# Verify critical file
RUN grep -q "logger.simple" src/config/database.js || exit 1

CMD ["node", "src/server.simple.js"]
