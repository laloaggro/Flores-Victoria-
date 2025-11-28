# Dockerfile para review-service
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

# Copy and install review-service dependencies
WORKDIR /app/review-service
COPY review-service/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy review-service source
COPY review-service ./

# Create @flores-victoria scope and link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    cp -r /app/shared node_modules/@flores-victoria/

EXPOSE 3007

CMD ["node", "src/server.js"]
