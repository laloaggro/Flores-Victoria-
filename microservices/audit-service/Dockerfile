FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código de la aplicación
COPY . .

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar el propietario de los archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer el puerto
EXPOSE 3005

# Comando para ejecutar la aplicación
CMD ["npm", "start"]