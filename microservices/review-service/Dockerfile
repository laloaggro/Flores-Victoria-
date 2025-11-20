# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/review-service/package*.json ./

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
COPY --chown=nodejs:nodejs microservices/review-service/package*.json ./

# Copiar el código fuente
COPY --chown=nodejs:nodejs microservices/review-service/. ./

# Copiar shared global a /shared para soporte de imports relativos sin sobrescribir posibles shared locales
COPY --chown=nodejs:nodejs microservices/shared /shared

# También dejar copia en /app/shared para imports relativos
COPY --chown=nodejs:nodejs microservices/shared ./shared

# Cambiar a usuario no-root
USER nodejs

# Exponer el puerto
EXPOSE 3007

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]