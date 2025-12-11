#!/bin/bash

# Script de monitoreo extendido para todos los servicios

echo "🔍 MONITOREO COMPLETO - Flores Victoria"
echo "========================================"
echo "Timestamp: $(date)"
echo ""

# URLs de servicios
declare -A SERVICES=(
  ["API Gateway"]="https://api-gateway-production-949b.up.railway.app/health"
  ["Auth Service"]="https://auth-service-production-ab8c.up.railway.app/health"
  ["User Service"]="https://user-service-production-275f.up.railway.app/health"
  ["Cart Service"]="https://cart-service-production-73f6.up.railway.app/health"
  ["Product Service"]="https://product-service-production-089c.up.railway.app/health"
  ["Order Service"]="https://order-service-production-29eb.up.railway.app/health"
  ["Frontend"]="https://frontend-v2-production-7508.up.railway.app/health"
  ["Admin Dashboard"]="https://admin-dashboard-service-production.up.railway.app/health"
)

healthy=0
unhealthy=0

echo "📊 Estado de Servicios:"
echo ""

for service in "${!SERVICES[@]}"; do
  url="${SERVICES[$service]}"
  
  # Hacer request y capturar código HTTP y tiempo
  response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" --max-time 5 "$url" 2>/dev/null)
  http_code="${response%%:*}"
  time_total="${response##*:}"
  
  # Convertir tiempo a ms
  time_ms=$(echo "$time_total * 1000" | bc 2>/dev/null | cut -d'.' -f1)
  
  if [ "$http_code" = "200" ]; then
    echo "   ✅ $service: HEALTHY (${time_ms}ms)"
    ((healthy++))
  else
    echo "   ❌ $service: ERROR (HTTP $http_code)"
    ((unhealthy++))
  fi
done

total=$((healthy + unhealthy))
percentage=$((healthy * 100 / total))

echo ""
echo "========================================"
echo "📈 Resumen:"
echo "   Total: $total servicios"
echo "   Healthy: $healthy ($percentage%)"
echo "   Unhealthy: $unhealthy"
echo ""

if [ $unhealthy -eq 0 ]; then
  echo "🎉 ¡Todos los servicios están funcionando!"
  exit 0
else
  echo "⚠️  Hay $unhealthy servicio(s) con problemas"
  exit 1
fi
