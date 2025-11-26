# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración del servicio PRIMERO
COPY microservices/review-service/package.json ./

# Instalar dependencias del servicio (esto crea node_modules limpio)
RUN npm install --production && \
    npm cache clean --force

# DESPUÉS copiar shared y preparar como paquete npm (sin que npm lo borre)
RUN mkdir -p node_modules/@flores-victoria
COPY microservices/shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --production && npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar curl y dumb-init
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/review-service/package.json ./

# Copiar el código fuente
COPY --chown=nodejs:nodejs microservices/review-service/src/ ./src/

# Crear directorio de logs con permisos correctos
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3007

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]
