FROM node:16-alpine

WORKDIR /app

# Copiar el directorio shared desde el directorio raíz del proyecto
COPY ../../shared /app/shared
RUN cd /app/shared && npm install

# Copiar package.json y package-lock.json del servicio
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente del servicio
COPY src ./src

# Exponer puerto
EXPOSE 3002

# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]