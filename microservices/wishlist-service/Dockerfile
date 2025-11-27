# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copiar shared module
COPY microservices/shared ./shared/

# Copiar package.json del servicio
COPY microservices/wishlist-service/package.json ./service/

# Instalar dependencias del servicio
WORKDIR /build/service
RUN npm install --production && npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar shared module (necesario para el symlink)
COPY --from=builder --chown=nodejs:nodejs /build/shared /shared

# Copiar node_modules desde builder (incluye symlink a @flores-victoria/shared)
COPY --from=builder --chown=nodejs:nodejs /build/service/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/wishlist-service/package.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs microservices/wishlist-service/src/ ./src/

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3006/health || exit 1

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
