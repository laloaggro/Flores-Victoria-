# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json desde el directorio raíz del microservicio
COPY microservices/payment-service/package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar dumb-init y curl para healthcheck
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs microservices/payment-service/package*.json ./

# Copiar el código fuente
COPY --chown=nodejs:nodejs microservices/payment-service/src ./src

# Crear directorio de logs
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

EXPOSE 3014

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
