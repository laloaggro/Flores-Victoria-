# Railway rebuild: 2025-11-27T00:13:00Z
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json del servicio
COPY microservices/product-service/package.json ./

# Instalar dependencias del servicio (sin shared todavía)
RUN npm install --production --ignore-scripts && npm cache clean --force

# Copiar shared module DIRECTAMENTE a node_modules (sin symlink)
RUN mkdir -p node_modules/@flores-victoria
COPY microservices/shared node_modules/@flores-victoria/shared

# Instalar dependencias de shared
WORKDIR /app/node_modules/@flores-victoria/shared
RUN npm install --production && npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules completo desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/product-service/package.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs microservices/product-service/src/ ./src/

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3009/health || exit 1

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
