# Payment Service - Flores Victoria v3.1.0
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev

# Copiar código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3011/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]
