# Dockerfile para product-service (v2.1 - simplified for Railway)
FROM node:22-slim

WORKDIR /app

# Copy shared module from parent directory
COPY ../shared ./shared
RUN cd shared && npm ci --omit=dev --no-audit --no-fund
RUN cd shared/logging && npm ci --omit=dev --no-audit --no-fund

# Copy product-service
WORKDIR /app/product-service
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

# Link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    cp -r /app/shared node_modules/@flores-victoria/

EXPOSE 3009

CMD ["node", "src/server.js"]
