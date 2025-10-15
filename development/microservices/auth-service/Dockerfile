FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Copiar directorio shared
COPY shared ./shared

# Instalar dependencias del directorio tracing
WORKDIR /app/shared/tracing
RUN npm install --only=production

# Instalar dependencias del directorio metrics
WORKDIR /app/shared/metrics
RUN npm install --only=production

# Volver al directorio principal
WORKDIR /app

# Crear enlaces simbólicos para los paquetes compartidos
RUN mkdir -p ./node_modules/@flores-victoria
RUN ln -s /app/shared/tracing ./node_modules/@flores-victoria/tracing
RUN ln -s /app/shared/metrics ./node_modules/@flores-victoria/metrics

# Instalar dependencias principales incluyendo OpenTelemetry
RUN npm install --only=production

# Instalar las dependencias de OpenTelemetry
RUN npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http --only=production

# Instalar uuid
RUN npm install uuid --only=production

# Copiar el resto del código
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/db

# Crear grupo y usuario para el servicio
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar permisos del directorio de la base de datos
RUN chown -R nextjs:nodejs /app/db
RUN chmod 755 /app/db

# Usar el usuario no root
USER nextjs

# Exponer el puerto
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]