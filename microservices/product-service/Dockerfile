# Dockerfile para product-service (v2.0 - with /api/products routes)
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

# Copy and install product-service dependencies
WORKDIR /app/product-service
COPY product-service/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy product-service source
COPY product-service ./

# Create @flores-victoria scope and link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    cp -r /app/shared node_modules/@flores-victoria/

EXPOSE 3009

CMD ["node", "src/server.js"]
