# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY product-service/package*.json ./

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
COPY --chown=nodejs:nodejs product-service/package*.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs product-service/src/ ./src/

# Copiar shared global (middleware, errors, health)
COPY --chown=nodejs:nodejs shared/ ./shared/

# Copiar shared local de product-service (logging, metrics, etc)
COPY --chown=nodejs:nodejs product-service/shared/ ./shared/

# Corregir rutas de imports shared (de ../../../shared/ a ../shared/)
RUN find ./src -type f -name "*.js" -exec sed -i "s|require('../../../shared/|require('../shared/|g" {} \; && \
    find ./src -type f -name "*.js" -exec sed -i "s|require('../../../../shared/|require('../../shared/|g" {} \;

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