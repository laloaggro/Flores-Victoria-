# Build version: 1.0.1 - Promotion Service Simplified
# Railway context: root of repo, not Root Directory
# UPDATED: Force rebuild in Railway

FROM node:18-alpine

WORKDIR /app

# Copiar configuración simplificada y código fuente
COPY microservices/promotion-service/package-simple.json ./package.json
COPY microservices/promotion-service/src/ ./src/
COPY microservices/promotion-service/models/ ./models/
COPY microservices/promotion-service/routes.js ./routes.js

# Instalar solo dependencias de producción
RUN npm install --omit=dev --no-package-lock

# Verificar que server.simple.js existe
RUN ls -la src/ && test -f src/server.simple.js

# Exponer puerto
EXPOSE 3019

# Comando de inicio
CMD ["node", "src/server.simple.js"]
