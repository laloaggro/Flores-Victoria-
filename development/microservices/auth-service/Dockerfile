FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar código fuente
COPY . .

# Crear directorio para base de datos
RUN mkdir -p /app/db

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar permisos del directorio de la base de datos
RUN chown -R nextjs:nodejs /app/db
RUN chmod 755 /app/db

USER nextjs

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]