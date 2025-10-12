# Etapa de construcción
FROM node:16-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Etapa de producción
FROM node:16-alpine

# Crear un usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copiar dependencias de la etapa de construcción
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nextjs:nodejs . .

# Cambiar al usuario no root
USER nextjs

# Exponer puerto
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]