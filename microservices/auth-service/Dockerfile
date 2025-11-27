# Dockerfile para auth-service (Railway.app)
# Creado manualmente para evitar problemas de cache con Nixpacks

FROM node:22-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias (usar npm install en lugar de npm ci)
RUN npm install --omit=dev --no-audit --no-fund

# Copiar módulo compartido
RUN mkdir -p node_modules/@flores-victoria
COPY ../shared node_modules/@flores-victoria/shared
RUN cd node_modules/@flores-victoria/shared && npm install --omit=dev --no-audit --no-fund

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "src/server.js"]
