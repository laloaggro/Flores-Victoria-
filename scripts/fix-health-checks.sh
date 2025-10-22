#!/bin/bash

# Script para arreglar health checks problemáticos
# Fecha: 2025-10-22

echo "🏥 Arreglando Health Checks de Servicios"
echo "========================================"

# Función para actualizar health checks con wget
update_health_check() {
    local service_name="$1"
    local port="$2"
    
    echo "🔧 Actualizando health check para $service_name (puerto $port)..."
    
    # Buscar el servicio en docker-compose.yml y actualizar el health check
    sed -i "/^  $service_name:/,/^  [^ ]/ {
        /healthcheck:/,/start_period:/ {
            /test:/ c\      test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:$port/health\"]
            /interval:/ c\      interval: 30s
            /timeout:/ c\      timeout: 10s
            /retries:/ c\      retries: 3
            /start_period:/ c\      start_period: 30s
        }
    }" docker-compose.yml
}

# Servicios a actualizar
services=(
    "auth-service:3001"
    "user-service:3003" 
    "review-service:3007"
    "frontend:80"
    "mcp-server:5050"
)

# Actualizar cada servicio
for service_port in "${services[@]}"; do
    IFS=':' read -r service port <<< "$service_port"
    update_health_check "$service" "$port"
done

# Caso especial para MongoDB (usar mongosh)
echo "🔧 Actualizando health check para MongoDB..."
sed -i '/^  mongodb:/,/^  [^ ]/ {
    /healthcheck:/,/start_period:/ {
        /test:/ c\      test: ["CMD", "mongosh", "--eval", "db.adminCommand('\''ping'\'')"]
        /interval:/ c\      interval: 30s
        /timeout:/ c\      timeout: 10s
        /retries:/ c\      retries: 3
        /start_period:/ c\      start_period: 30s
    }
}' docker-compose.yml

echo "✅ Health checks actualizados"
echo ""
echo "🔄 Para aplicar los cambios:"
echo "docker compose down"
echo "docker compose up -d"
echo ""
echo "🔍 Para verificar:"
echo "docker compose ps"