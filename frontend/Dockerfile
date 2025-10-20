# Etapa de construcción
FROM node:16-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar archivos del proyecto
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar archivos estáticos desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 5175

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]