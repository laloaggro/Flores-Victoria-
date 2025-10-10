FROM node:18-alpine

WORKDIR /app

# Copiar package*.json de audit-service
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código del servicio
COPY . .

# Exponer el puerto
EXPOSE 3005

# Comando por defecto
CMD ["npm", "start"]