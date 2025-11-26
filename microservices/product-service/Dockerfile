# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar shared primero y preparar como paquete npm
RUN mkdir -p node_modules/@flores-victoria
COPY microservices/shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --production && npm cache clean --force

# Copiar archivos de configuración del servicio
COPY microservices/product-service/package.json ./

# Instalar dependencias (sin lockfile para evitar conflictos con file:)
RUN npm install --production && \
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
COPY --chown=nodejs:nodejs microservices/product-service/package.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs microservices/product-service/src/ ./src/

# Crear directorio de logs con permisos correctos
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3009

# Establecer el puerto en el entorno
ENV PORT=3009

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]