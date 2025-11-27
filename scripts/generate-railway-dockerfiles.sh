#!/bin/bash

# Script para generar Dockerfiles optimizados para Railway
# Los Dockerfiles funcionan cuando se ejecutan desde subdirectorios

set -e

echo "🔧 Generando Dockerfiles para Railway..."

# Array de servicios con sus puertos
declare -A services
services=(
    ["product-service"]="3009"
    ["order-service"]="3004"
    ["cart-service"]="3005"
    ["wishlist-service"]="3006"
    ["review-service"]="3007"
    ["contact-service"]="3008"
    ["payment-service"]="3018"
    ["promotion-service"]="3019"
)

# Función para crear Dockerfile.railway
create_dockerfile() {
    local service=$1
    local port=$2
    local dockerfile="microservices/${service}/Dockerfile.railway"
    
    echo "📝 Creando ${dockerfile}..."
    
    cat > "${dockerfile}" <<'EOF'
# Dockerfile optimizado para Railway (ejecutado desde subdirectorio)
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json del servicio
COPY package*.json ./

# Instalar dependencias del servicio
RUN npm install --production --ignore-scripts && npm cache clean --force

# Copiar shared module desde repositorio raíz
RUN mkdir -p node_modules/@flores-victoria
COPY ../../shared node_modules/@flores-victoria/shared

# Instalar dependencias de shared
RUN cd node_modules/@flores-victoria/shared && npm install --production && npm cache clean --force

# Production stage
FROM node:22-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules completo desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar package.json
COPY --chown=nodejs:nodejs package*.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs src/ ./src/

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EOF

    echo "EXPOSE ${port}" >> "${dockerfile}"
    
    cat >> "${dockerfile}" <<'EOF'

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:PORT/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "src/server.js"]
EOF

    # Reemplazar PORT en healthcheck
    sed -i "s/:PORT/:${port}/g" "${dockerfile}"
    
    echo "✅ ${dockerfile} creado"
}

# Función para actualizar railway.toml
update_railway_toml() {
    local service=$1
    local toml_file="microservices/${service}/railway.toml"
    
    if [ -f "${toml_file}" ]; then
        echo "📝 Actualizando ${toml_file}..."
        sed -i 's|dockerfilePath = "microservices/.*/Dockerfile"|dockerfilePath = "Dockerfile.railway"|g' "${toml_file}"
        echo "✅ ${toml_file} actualizado"
    fi
}

# Generar Dockerfiles
for service in "${!services[@]}"; do
    port="${services[$service]}"
    create_dockerfile "$service" "$port"
    update_railway_toml "$service"
done

echo ""
echo "✅ Todos los Dockerfiles para Railway generados"
echo ""
echo "📋 Archivos creados:"
for service in "${!services[@]}"; do
    echo "  - microservices/${service}/Dockerfile.railway"
done
echo ""
echo "🚀 Ahora puedes redesplegar los servicios en Railway"
echo "   Los servicios usarán automáticamente Dockerfile.railway"
