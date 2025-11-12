FROM node:18

# Instalar curl para health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY product-service/package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY product-service/src/ ./src/

# Copiar shared global (middleware, errors, health)
COPY shared/ ./shared/

# Copiar shared local de product-service (logging, metrics, etc) - sobrescribe/merge con shared global
COPY product-service/shared/ ./shared/

# Corregir rutas de imports shared (de ../../../shared/ a ../shared/)
RUN find ./src -type f -name "*.js" -exec sed -i "s|require('../../../shared/|require('../shared/|g" {} \; && \
    find ./src -type f -name "*.js" -exec sed -i "s|require('../../../../shared/|require('../../shared/|g" {} \;

# Crear directorio de logs si no existe
RUN mkdir -p logs

EXPOSE 3009

# Establecer el puerto en el entorno
ENV PORT=3009

CMD ["npm", "start"]