# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/order-service/package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

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
COPY --chown=nodejs:nodejs microservices/order-service/package*.json ./

# Copiar el código fuente
COPY --chown=nodejs:nodejs microservices/order-service/. ./

# Copiar shared desde el root (reemplaza symlink con directorio real)
COPY --chown=nodejs:nodejs shared /shared
COPY --chown=nodejs:nodejs shared ./shared

# Copy tracing from microservices/shared (has middleware.js file) to both locations
COPY --chown=nodejs:nodejs microservices/shared/tracing ./shared/tracing
COPY --chown=nodejs:nodejs microservices/shared/tracing /shared/tracing

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3004

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]