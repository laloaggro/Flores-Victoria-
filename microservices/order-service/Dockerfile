# Build v2.0 - Order Service
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3004

# Comando de inicio
CMD ["node", "src/server.simple.js"]
