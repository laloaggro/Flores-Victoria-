FROM node:18-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 3007

# Comando para ejecutar la aplicación
CMD ["npm", "start"]