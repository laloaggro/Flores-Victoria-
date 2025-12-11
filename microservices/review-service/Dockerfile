# Build version: 1.0.2 - Review Service Simplified
# Railway Root Directory: microservices/review-service
# UPDATED: Paths relativos desde Root Directory
FROM node:18-alpine

WORKDIR /app

# Paths relativos desde Root Directory
COPY package-simple.json ./package.json
COPY src/ ./src/

RUN npm install --omit=dev --no-package-lock

# Verify server.simple.js exists
RUN ls -la src/ && test -f src/server.simple.js

EXPOSE 3007

CMD ["node", "src/server.simple.js"]
