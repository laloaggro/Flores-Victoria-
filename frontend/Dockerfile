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
COPY --from=builder /app/dist /usr/share/nginx/html;

# Copiar configuración de nginx
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Configuración adicional para manejar correctamente las rutas de los assets
RUN rm /etc/nginx/conf.d/default.conf && \
    echo 'server {' > /etc/nginx/conf.d/app.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/app.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/app.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/app.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/app.conf && \
    echo '        try_files $uri $uri/ =404;' >> /etc/nginx/conf.d/app.conf && \
    echo '    }' >> /etc/nginx/conf.d/app.conf && \
    echo '}' >> /etc/nginx/conf.d/app.conf

# Exponer puerto
EXPOSE 5175

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]