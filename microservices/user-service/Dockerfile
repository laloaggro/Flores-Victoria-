# Build version: 1.0.6 - User Service Simplified (PostgreSQL + winston)
# Railway: Root Directory = microservices/user-service, Dockerfile Path = Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package-simple.json ./package.json
COPY src/ ./src/

RUN npm install --omit=dev --no-package-lock --ignore-scripts

# Verify critical files and dependencies
RUN grep -q "logger.simple" src/config/database.js || exit 1
RUN node -e "require('pg'); require('express'); require('winston');" || exit 1

EXPOSE 8080

CMD ["node", "src/server.simple.js"]
