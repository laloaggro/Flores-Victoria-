#!/bin/bash

echo "📦 Instalando curl en Dockerfiles de microservicios..."

# Lista de directorios de microservicios que necesitan curl
microservices=(
    "microservices/auth-service"
    "microservices/user-service"
    "microservices/product-service"
    "microservices/order-service"
    "microservices/cart-service"
    "microservices/wishlist-service"
    "microservices/review-service"
    "microservices/contact-service"
    "microservices/api-gateway"
    "mcp-server"
)

# Función para agregar curl a un Dockerfile
add_curl_to_dockerfile() {
    local dockerfile_path="$1"
    
    if [[ -f "$dockerfile_path" ]]; then
        echo "  🔧 Actualizando $dockerfile_path..."
        
        # Buscar la línea FROM y agregar la instalación de curl después
        if grep -q "FROM node.*alpine" "$dockerfile_path"; then
            # Para imágenes Alpine
            if ! grep -q "apk add.*curl" "$dockerfile_path"; then
                sed -i '/FROM node.*alpine/a\\n# Instalar curl para health checks\nRUN apk add --no-cache curl' "$dockerfile_path"
            fi
        elif grep -q "FROM node" "$dockerfile_path"; then
            # Para imágenes Ubuntu/Debian
            if ! grep -q "apt-get.*curl" "$dockerfile_path"; then
                sed -i '/FROM node/a\\n# Instalar curl para health checks\nRUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*' "$dockerfile_path"
            fi
        fi
    else
        echo "  ⚠️  No encontrado: $dockerfile_path"
    fi
}

# Actualizar cada microservicio
for service in "${microservices[@]}"; do
    add_curl_to_dockerfile "$service/Dockerfile"
done

# También verificar frontend (nginx)
if [[ -f "frontend/Dockerfile" ]]; then
    echo "  🔧 Actualizando frontend/Dockerfile..."
    if grep -q "FROM nginx" "frontend/Dockerfile"; then
        if ! grep -q "apt-get.*curl" "frontend/Dockerfile"; then
            sed -i '/FROM nginx/a\\n# Instalar curl para health checks\nRUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*' "frontend/Dockerfile"
        fi
    fi
fi

echo "✅ Curl instalado en todos los Dockerfiles"
echo ""
echo "🔄 Para aplicar los cambios:"
echo "   docker compose down"
echo "   docker compose build --no-cache"
echo "   docker compose up -d"