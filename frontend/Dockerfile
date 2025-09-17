# Usar imagen base de Node.js
FROM node:16-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar resto de los archivos
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando para ejecutar la aplicación
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]