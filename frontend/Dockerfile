# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración primero (mejor cache)
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci && \
    npm cache clean --force

# Copiar archivos del proyecto
COPY . .

# Construir la aplicación (optimización de producción)
RUN npm run build

# Production stage
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear usuario no-root para nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Copiar archivos estáticos desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Ajustar permisos para usuario no-root
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx-user:nginx-user /var/run/nginx.pid

# Cambiar a usuario no-root
USER nginx-user

# Exponer puerto
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]