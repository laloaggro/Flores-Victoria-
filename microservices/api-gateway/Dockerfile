# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar shared primero (dependencia local)
COPY microservices/shared /app/node_modules/@flores-victoria/shared

# Copiar archivos de configuración
COPY microservices/api-gateway/package*.json ./

# Instalar dependencias (shared ya está en node_modules)
RUN npm ci --omit=dev && \
    npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar curl para health checks y dumb-init para manejo de señales
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder (incluye @flores-victoria/shared)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/api-gateway/package*.json ./

# Copiar el código de la aplicación
COPY --chown=nodejs:nodejs microservices/api-gateway/src/ ./src/

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]