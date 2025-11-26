# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración primero (mejor cache)
COPY microservices/api-gateway/package*.json ./

# Instalar todas las dependencias
RUN npm install --production && \
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
COPY --chown=nodejs:nodejs microservices/api-gateway/package*.json ./

# Copiar el código de la aplicación
# Copiar desde el contexto raíz (microservices/api-gateway)
COPY --chown=nodejs:nodejs microservices/api-gateway/src/ ./src/

# Copiar shared global a /shared para que las require relativas funcionen
COPY --chown=nodejs:nodejs microservices/shared /shared

# También dejar copia en /app/shared para imports relativos desde /app/src
COPY --chown=nodejs:nodejs microservices/shared ./shared

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]