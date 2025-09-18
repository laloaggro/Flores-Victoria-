# Usar imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar resto de los archivos
COPY . .

# Crear directorio para base de datos si no existe
RUN mkdir -p db

# Crear directorio para imágenes si no existe
RUN mkdir -p assets/images/products

# Exponer puerto
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]