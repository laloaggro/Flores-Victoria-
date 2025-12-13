# Dockerfile para api-gateway - Railway Compatible
# Build version: 1.0.7 - Absolute paths (no Root Directory needed)
FROM node:22-slim

WORKDIR /app

# Copy package.json from api-gateway directory and install dependencies
COPY microservices/api-gateway/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy api-gateway source code
COPY microservices/api-gateway/src ./src/

# Create stub for shared module if not present
RUN mkdir -p node_modules/@flores-victoria/shared && \
    echo '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}' > node_modules/@flores-victoria/shared/package.json && \
    echo 'module.exports = { logger: console, metrics: { register: () => {}, metrics: () => "# No metrics" } };' > node_modules/@flores-victoria/shared/index.js

EXPOSE 3000

CMD ["node", "src/server.js"]
