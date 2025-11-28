# Dockerfile for auth-service with shared module access
FROM node:22-slim

WORKDIR /app

# Copy shared module first
COPY shared ./shared
WORKDIR /app/shared
RUN npm install --omit=dev --no-audit --no-fund

# Copy and install auth-service
WORKDIR /app/auth-service
COPY auth-service/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy auth-service source
COPY auth-service ./

# Create symlink to shared module
RUN mkdir -p node_modules/@flores-victoria && \
    ln -s /app/shared node_modules/@flores-victoria/shared

EXPOSE 3001

CMD ["node", "src/server.js"]
