# Dockerfile para product-service (v2.2 - fixed paths)
FROM node:22-slim

WORKDIR /app

# Copy shared module
COPY ../shared/package*.json ./shared/
RUN cd shared && npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

COPY ../shared/logging/package*.json ./shared/logging/
RUN cd shared/logging && npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

COPY ../shared ./shared

# Copy and install product-service
WORKDIR /app/product-service
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

COPY . .

# Link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    ln -s /app/shared node_modules/@flores-victoria/shared

EXPOSE 3009

CMD ["node", "src/server.js"]
