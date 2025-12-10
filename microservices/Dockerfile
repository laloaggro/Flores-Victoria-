# Dockerfile parametrizable para todos los microservicios
# Uso: docker build --build-arg SERVICE_NAME=auth-service --build-arg SERVICE_PORT=3001 -t service-name .
FROM node:22-slim

# Argumentos de build
ARG SERVICE_NAME
ARG SERVICE_PORT=3000

# Validar que SERVICE_NAME está definido
RUN test -n "$SERVICE_NAME" || (echo "ERROR: SERVICE_NAME no definido. Usa --build-arg SERVICE_NAME=nombre-del-servicio" && exit 1)

WORKDIR /app

# Copy and install shared module (main dependencies)
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev --no-audit --no-fund

# Copy and install logging subdirectory dependencies
COPY shared/logging/package*.json ./shared/logging/
RUN cd shared/logging && npm install --omit=dev --no-audit --no-fund

# Copy all shared module files
COPY shared ./shared

# Copy and install service dependencies
WORKDIR /app/${SERVICE_NAME}
COPY ${SERVICE_NAME}/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy service source
COPY ${SERVICE_NAME} ./

# Create @flores-victoria scope and link shared module
RUN mkdir -p node_modules/@flores-victoria && \
    ln -sf /app/shared node_modules/@flores-victoria/shared

EXPOSE ${SERVICE_PORT}

CMD ["node", "src/server.js"]
