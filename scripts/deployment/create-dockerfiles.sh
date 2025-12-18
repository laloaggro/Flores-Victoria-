#!/bin/bash
# Script para crear Dockerfiles individuales para cada servicio

SERVICES=(
  "api-gateway:3000"
  "user-service:3003"
  "order-service:3004"
  "cart-service:3005"
  "wishlist-service:3006"
  "review-service:3007"
  "contact-service:3008"
  "product-service:3009"
  "notification-service:3010"
  "payment-service:3011"
  "promotion-service:3012"
)

cd /home/impala/Documentos/Proyectos/flores-victoria/microservices

for service_config in "${SERVICES[@]}"; do
  SERVICE_NAME="${service_config%%:*}"
  SERVICE_PORT="${service_config##*:}"
  
  echo "Creando Dockerfile para $SERVICE_NAME (puerto $SERVICE_PORT)..."
  
  cat > "$SERVICE_NAME/Dockerfile" << EOF
# Dockerfile para $SERVICE_NAME
FROM node:22-slim

WORKDIR /app

# Copy and install shared module (main dependencies)
COPY shared/package*.json ./shared/
RUN cd shared && npm install --omit=dev --no-audit --no-fund

# Copy and install logging subdirectory dependencies
COPY shared/logging/package*.json ./shared/logging/
RUN cd shared/logging && npm install --omit=dev --no-audit --no-fund

# Copy all shared module files
COPY shared ./shared

# Copy and install $SERVICE_NAME dependencies
WORKDIR /app/$SERVICE_NAME
COPY $SERVICE_NAME/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy $SERVICE_NAME source
COPY $SERVICE_NAME ./

# Create @flores-victoria scope and link shared module
RUN mkdir -p node_modules/@flores-victoria && \\
    cp -r /app/shared node_modules/@flores-victoria/

EXPOSE $SERVICE_PORT

CMD ["node", "src/server.js"]
EOF

  echo "✅ Dockerfile creado para $SERVICE_NAME"
done

echo ""
echo "✅ Todos los Dockerfiles han sido creados!"
