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

# Crear directorio para dependencias de Vite con permisos adecuados
RUN mkdir -p /app/node_modules/.vite && chmod -R 777 /app

# Definir variable de entorno para el backend URL
ENV VITE_BACKEND_URL=http://api-gateway:3000

# Exponer puerto
EXPOSE 5173

# Comando para ejecutar la aplicación con configuración adicional para evitar problemas de permisos
CMD ["sh", "-c", "chmod -R 777 /app && npx vite --host 0.0.0.0 --port 5173"]