# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY microservices/auth-service/package*.json ./

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
COPY --chown=nodejs:nodejs microservices/auth-service/package*.json ./

# Copiar los módulos compartidos desde root (tiene validator.js completo)
COPY --chown=nodejs:nodejs shared /shared

# También dejar copia en /app/shared para imports relativos desde /app/src
COPY --chown=nodejs:nodejs shared ./shared

# Copiar el resto del código fuente (desde el contexto raíz)
COPY --chown=nodejs:nodejs microservices/auth-service/. ./

# Crear directorio de logs
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3001

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]