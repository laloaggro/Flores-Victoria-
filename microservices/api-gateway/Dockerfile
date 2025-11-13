# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración primero (mejor cache)
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar curl para health checks y dumb-init para manejo de señales
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs package*.json ./

# Copiar el código de la aplicación
COPY --chown=nodejs:nodejs src/ ./src/

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]