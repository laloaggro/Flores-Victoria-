# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/cart-service/package*.json ./

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
COPY --chown=nodejs:nodejs microservices/cart-service/package*.json ./

# Copiar el código fuente (desde el contexto raíz)
COPY --chown=nodejs:nodejs microservices/cart-service/. ./
    
# Copiar shared desde el root (reemplaza symlink con directorio real)
COPY --chown=nodejs:nodejs shared /shared
COPY --chown=nodejs:nodejs shared ./shared

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3005

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]