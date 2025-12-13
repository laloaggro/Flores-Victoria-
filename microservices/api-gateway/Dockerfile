# Dockerfile para api-gateway - Railway Compatible
# Build version: 1.0.8 - Relative paths (requires Root Directory = microservices/api-gateway)
FROM node:22-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts

# Copy api-gateway source code
COPY src ./src/

# Create stub for shared module if not present
RUN mkdir -p node_modules/@flores-victoria/shared && \
    echo '{"name":"@flores-victoria/shared","version":"1.0.0","main":"index.js"}' > node_modules/@flores-victoria/shared/package.json && \
    echo 'module.exports = { logger: console, metrics: { register: () => {}, metrics: () => "# No metrics" } };' > node_modules/@flores-victoria/shared/index.js

EXPOSE 3000

CMD ["node", "src/server.js"]
