# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY cart-service/package.json ./

# Instalar dependencias (sin lockfile para evitar conflictos)
RUN npm install --production && \
    npm cache clean --force

# Copiar shared y preparar como paquete npm
RUN mkdir -p node_modules/@flores-victoria
COPY shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --production && npm cache clean --force

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
COPY --chown=nodejs:nodejs cart-service/package.json ./

# Copiar el código fuente
COPY --chown=nodejs:nodejs cart-service/src/ ./src/

# Crear directorio de logs con permisos correctos
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3005

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]
