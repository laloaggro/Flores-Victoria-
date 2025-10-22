#!/bin/bash

echo "🚀 Reconstruyendo servicios con health checks arreglados..."

# Servicios que necesitan reconstrucción para health checks
services=(
    "user-service"
    "review-service" 
    "frontend"
    "mcp-server"
)

echo "📦 Reconstruyendo servicios restantes (${#services[@]} servicios)..."

for service in "${services[@]}"; do
    echo ""
    echo "🔧 Reconstruyendo $service..."
    
    # Detener el servicio
    docker compose stop "$service"
    
    # Reconstruir sin cache
    docker compose build --no-cache "$service"
    
    # Iniciarlo de nuevo
    docker compose up -d "$service"
    
    echo "✅ $service reconstruido"
done

echo ""
echo "⏳ Esperando 45 segundos para que se establezcan los health checks..."
sleep 45

echo ""
echo "🔍 Verificando estado final de todos los servicios:"
docker compose ps --format "table {{.Service}}\t{{.Status}}" | grep -E "(healthy|unhealthy)"

echo ""
echo "✅ Reconstrucción completada"