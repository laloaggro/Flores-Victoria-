# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/wishlist-service/package*.json ./

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
COPY --chown=nodejs:nodejs microservices/wishlist-service/package*.json ./

 # Copiar el resto del código fuente (desde el contexto raíz)
 COPY --chown=nodejs:nodejs microservices/wishlist-service/. ./

 # Copiar shared global a /shared para soporte de imports relativos
 COPY --chown=nodejs:nodejs microservices/shared /shared

 # También dejar copia en /app/shared para imports relativos
 COPY --chown=nodejs:nodejs microservices/shared ./shared

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3006

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]