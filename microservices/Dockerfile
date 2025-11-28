# Dockerfile for auth-service with shared module access
FROM node:22-slim

WORKDIR /app

# Copy and install shared module (main dependencies)
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev --no-audit --no-fund

# Copy and install logging subdirectory dependencies
COPY shared/logging/package*.json ./shared/logging/
RUN cd shared/logging && npm install --omit=dev --no-audit --no-fund

# Copy all shared module files
COPY shared ./shared

# Copy and install auth-service dependencies
WORKDIR /app/auth-service  
COPY auth-service/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy auth-service source
COPY auth-service ./

# Create @flores-victoria scope and link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    cp -r /app/shared node_modules/@flores-victoria/

EXPOSE 3001

CMD ["node", "src/server.js"]
