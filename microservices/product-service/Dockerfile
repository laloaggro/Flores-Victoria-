# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/product-service/package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production --legacy-peer-deps && \
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
COPY --chown=nodejs:nodejs microservices/product-service/package*.json ./

# Copiar código fuente
# Copiar desde el contexto raíz (microservices/product-service)
COPY --chown=nodejs:nodejs microservices/product-service/src/ ./src/

# Copy root shared first (has complete middleware, health, etc)
COPY --chown=nodejs:nodejs shared /shared
COPY --chown=nodejs:nodejs shared ./shared

# Then overlay product-service specific shared directories (logging, metrics, etc)
# This will keep root shared's middleware and health while adding service-specific code
COPY --chown=nodejs:nodejs microservices/product-service/shared/logging ./shared/logging
COPY --chown=nodejs:nodejs microservices/product-service/shared/metrics ./shared/metrics
COPY --chown=nodejs:nodejs microservices/product-service/shared/tracing ./shared/tracing

# Corregir rutas de imports shared (de ../../../shared/ a ../../shared/)
RUN find ./src -type f -name "*.js" -exec sed -i "s|require('../../../shared/|require('../../shared/|g" {} \; && \
    find ./src -type f -name "*.js" -exec sed -i "s|require('../../../../shared/|require('../../../shared/|g" {} \;

# Crear directorio de logs
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3009

# Establecer el puerto en el entorno
ENV PORT=3009

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]