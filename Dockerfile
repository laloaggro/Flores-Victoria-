# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar package files del frontend
COPY package*.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

# Copiar todo el código fuente
COPY . .

# Ejecutar build (incluye copy-js + optimize-css)
RUN npm run build

# Production stage  
FROM nginx:alpine
RUN apk add --no-cache curl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create optimized nginx config for Railway
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    location /health { \
        access_log off; \
        return 200 "OK"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK CMD curl -f http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
