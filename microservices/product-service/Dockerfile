# Dockerfile para product-service con Root Directory configurado
# Root Directory: microservices/product-service/
FROM node:22-slim

WORKDIR /app

# Copiar e instalar dependencias del módulo shared (relativo al root del repo)
COPY ../shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev --no-audit --no-fund

# Copiar dependencias del submódulo de logging
COPY ../shared/logging/package*.json ./shared/logging/
RUN cd shared/logging && npm install --omit=dev --no-audit --no-fund

# Copiar archivos del módulo shared
COPY ../shared ./shared

# Copiar e instalar dependencias de product-service
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copiar código fuente de product-service
COPY . ./

# Crear scope @flores-victoria y enlazar módulo shared
RUN mkdir -p node_modules/@flores-victoria && \
    cp -r /app/shared node_modules/@flores-victoria/

# Puerto del servicio
EXPOSE 3009

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3009/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/server.js"]
