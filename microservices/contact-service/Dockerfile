# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración del microservicio
COPY microservices/contact-service/package*.json ./

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

# Copiar el directorio shared desde la raíz del proyecto
COPY --chown=nodejs:nodejs microservices/shared /shared

# Copiar package.json del microservicio
COPY --chown=nodejs:nodejs microservices/contact-service/package*.json ./

# Copiar el código fuente del microservicio
COPY --chown=nodejs:nodejs microservices/contact-service/. ./

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3008

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]