# Usar imagen base de Node.js
FROM node:16-alpine

# Instalar curl y docker-compose para health checks y gestión de servicios
RUN apk add --no-cache curl docker-cli docker-compose

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar resto de los archivos
COPY . .

# Exponer puerto
EXPOSE 3021

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]